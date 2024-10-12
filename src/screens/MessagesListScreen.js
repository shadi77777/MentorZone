import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { LinearGradient } from 'expo-linear-gradient';

const MessagesListScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      console.error('User not authenticated');
      setLoading(false);
      return;
    }
  
    const fetchConversations = async () => {
      try {
        const conversationsRef = collection(db, 'chats');
        const q = query(conversationsRef, where('participants', 'array-contains', user.uid));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          const conversationsList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setConversations(conversationsList);
        } else {
          console.warn('No conversations found for the current user.');
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
      setLoading(false);
    };
  
    fetchConversations();
  }, [user]);

  const renderConversation = ({ item }) => {
    if (!item.participantsInfo || item.participantsInfo.length !== 2) {
        console.warn('Participants info er manglende eller ufuldstændig:', item.participantsInfo);
        return null;
      }
      
  
    const otherParticipant = item.participantsInfo.find(p => p.id !== user.uid);
    
    if (!otherParticipant) {
      console.warn('Ingen anden deltager fundet for samtalen:', item);
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
        <Image
          source={otherParticipant.profilePicture ? { uri: otherParticipant.profilePicture } : require('../assets/defaultProfile.png')}
          style={styles.profileImage}
        />
        <View style={styles.conversationContent}>
          <Text style={styles.participantName}>{otherParticipant.name || 'Unknown User'}</Text>
          <Text style={styles.lastMessage}>{item.lastMessage || 'No messages yet'}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  

  return (
    <LinearGradient colors={['#005f99', '#33ccff']} style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : conversations.length > 0 ? (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.conversationsList}
        />
      ) : (
        <Text style={styles.noConversationsText}>No conversations available.</Text>
      )}
    </LinearGradient>
  );
};

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
