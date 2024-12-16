import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * MessagesListScreen er en komponent der viser en liste over alle samtaler (chats),
 * som den aktuelle bruger deltager i.
 *
 * - Henter fra Firestore en liste over chats, hvor den aktuelle bruger er deltager
 * - Henter også den seneste besked i hver chat for at vise en kort beskrivelse af sidste interaktion
 * - Viser profiler og navne på de andre deltagere i hver chat
 * - Muliggør navigation ind i en bestemt chat ved tryk på samtalen
 */
const MessagesListScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]); // State til at gemme samtale-data
  const [loading, setLoading] = useState(true);           // State til at styre en loading-indikator

  const auth = getAuth();
  const user = auth.currentUser; // Den aktuelle, loggede bruger

  // useEffect: Henter samtaler for den aktuelle bruger, når komponenten mountes
  useEffect(() => {
    if (!user) {
      console.error('User not authenticated');
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      try {
        // Reference til 'chats' kollektionen
        const conversationsRef = collection(db, 'chats');
        // Forespørgsel: Find alle chats, hvor den aktuelle bruger er deltager
        const q = query(conversationsRef, where('participants', 'array-contains', user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // For hver fundne chat, hent sidste besked (sorteret efter nyeste)
          const conversationsList = await Promise.all(
            querySnapshot.docs.map(async (doc) => {
              const conversationData = {
                id: doc.id,
                ...doc.data(),
              };

              // Hent den sidste besked i samtalen
              const messagesRef = collection(db, 'chats', doc.id, 'messages');
              const lastMessageQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
              const lastMessageSnapshot = await getDocs(lastMessageQuery);

              if (!lastMessageSnapshot.empty) {
                const lastMessageData = lastMessageSnapshot.docs[0].data();
                conversationData.lastMessage = lastMessageData.text;
                conversationData.lastMessageTime = lastMessageData.createdAt.toDate();
              } else {
                // Hvis ingen beskeder, angiv standard værdi
                conversationData.lastMessage = 'No messages yet';
                conversationData.lastMessageTime = new Date(0); // Epoketid
              }

              return conversationData;
            })
          );

          // Sortér samtaler efter seneste besked (nyeste først)
          conversationsList.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
          setConversations(conversationsList);
        } else {
          // Ingen samtaler fundet
          setConversations([]);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }

      setLoading(false);
    };

    fetchConversations();
  }, [user]);

  /**
   * Renderer én samtale ad gangen i en FlatList.
   * Viser anden deltager og den seneste besked fra chatten.
   */
  const renderConversation = ({ item }) => {
    // Sørg for at participantsInfo eksisterer, og at der er to deltagere
    if (!item.participantsInfo || item.participantsInfo.length !== 2) {
      console.warn('Participants info is missing or incomplete:', item.participantsInfo);
      return null;
    }

    // Find den anden deltager, som ikke er den aktuelle bruger
    const otherParticipant = item.participantsInfo.find(p => p.id !== user.uid);

    if (!otherParticipant) {
      console.warn('No other participant found for the conversation:', item);
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.conversationContainer}
        onPress={() => navigation.navigate('Chat', {
          chatId: item.id,
          otherParticipant: otherParticipant
        })}
      >
        {/* Profilbillede eller standardbillede hvis intet billede angivet */}
        <Image
          source={otherParticipant.profilePicture ? { uri: otherParticipant.profilePicture } : require('../assets/defaultProfile.png')}
          style={styles.profileImage}
        />
        <View style={styles.conversationContent}>
          <Text style={styles.participantName}>{otherParticipant.name || 'Unknown User'}</Text>
          <Text style={styles.lastMessage}>{item.lastMessage}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    // LinearGradient: Pæn baggrundsgradient
    <LinearGradient colors={['#005f99', '#33ccff']} style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>
      {loading ? (
        // Hvis data stadig hentes, vis en aktiveringsindikator
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : conversations.length > 0 ? (
        // Vis liste over samtaler
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.conversationsList}
        />
      ) : (
        // Hvis ingen samtaler
        <Text style={styles.noConversationsText}>No conversations available.</Text>
      )}
    </LinearGradient>
  );
};

// Styles til layout af siden
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    flex: 1,
  },
  conversationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  conversationContent: {
    flex: 1,
  },
  participantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0046a3',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
    marginTop: 10,
  },
  conversationsList: {
    paddingBottom: 20,
  },
  noConversationsText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MessagesListScreen;
