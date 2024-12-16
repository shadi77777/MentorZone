import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
} from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from 'react-native-vector-icons';
import { createNewChat } from './createNewChat';

/**
 * ChatScreen-komponenten giver brugeren mulighed for at deltage i en chat med en anden deltager (typisk en træner).
 * Komponentens ansvar er at:
 * - Hente chatbeskeder fra Firestore i realtid
 * - Håndtere afsendelse af nye beskeder til Firestore
 * - Vise brugerens og modpartens navn, profil og beskeder
 * - Muliggøre navigation tilbage til forrige skærm
 */
const ChatScreen = ({ route, navigation }) => {
  // Henter parametre fra navigationsruten
  const { chatId, otherParticipant, trainerId } = route.params;

  // State-variabler
  const [messages, setMessages] = useState([]);     // Opbevarer den aktuelle chats beskeder
  const [newMessage, setNewMessage] = useState(''); // Teksten i det nye besked-inputfelt
  const [trainerName, setTrainerName] = useState('');// Navn på træneren eller modparten
  const [userName, setUserName] = useState('');     // Navn på den aktuelle bruger
  const auth = getAuth();
  const user = auth.currentUser;                    // Den aktuelle, autentificerede bruger

  // useEffect: Henter trænerens navn, hvis det ikke allerede er givet i otherParticipant
  useEffect(() => {
    if (otherParticipant && otherParticipant.name) {
      // Hvis otherParticipant-objektet er givet og indeholder et navn, brug det
      setTrainerName(otherParticipant.name);
    } else if (trainerId) {
      // Hvis vi kun har trainerId, hent trænerens navn fra Firestore
      const fetchTrainerName = async () => {
        try {
          const trainerDoc = await getDoc(doc(db, 'users', trainerId));
          if (trainerDoc.exists()) {
            // Sæt trænerens navn, eller "Trainer" hvis tom
            setTrainerName(trainerDoc.data().name || 'Trainer');
          }
        } catch (error) {
          console.error('Error fetching trainer name:', error);
        }
      };
      fetchTrainerName();
    }
  }, [trainerId, otherParticipant]);

  // useEffect: Henter den aktuelle brugers navn fra Firestore
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          // Sæt brugerens navn eller "User"
          setUserName(userDoc.data().name || 'User');
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
      }
    };

    if (user) {
      fetchUserName();
    }
  }, [user]);

  // useEffect: Opretter en realtime-lytter på chatbeskederne
  // Lytter til ændringer i dokumenter i chatten og opdaterer UI i realtid
  useEffect(() => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }
  
    if (!chatId) {
      console.error('Chat ID is missing');
      return;
    }

    // Reference til messages-kollektionen i den pågældende chat
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    // Sortér beskederne i stigende rækkefølge efter oprettelsestidspunkt
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
  
    // Opret snapshot-listener, der opdaterer messages-state, når Firestore-data ændres
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesData);
    });
  
    // Afmeld listener, når komponenten unmountes
    return unsubscribe;
  }, [chatId, user]);

  /**
   * Funktion til at håndtere afsendelse af beskeder:
   * - Tjekker for tom besked
   * - Opretter dokument i Firestore under 'chats' -> 'messages'
   * - Rydder inputfeltet
   */
  const handleSend = async () => {
    if (newMessage.trim() === '') return; // Send ikke tomme beskeder
  
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
  
      // Opret chatten, hvis den ikke eksisterer (hvis vi fx har chatId, men ingen chat)
      if (!chatDoc.exists()) {
        await createNewChat(user.uid, trainerId);
      }
  
      // Opret en ny besked i Firestore
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        text: newMessage,
        senderId: user.uid,
        senderName: userName,
        createdAt: new Date(),
      });
  
      // Nulstil inputfeltet efter beskeden er sendt
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };
  
  /**
   * Funktion til at renderere individuelle beskeder i FlatList:
   * Afhænger af, om beskeden er sendt af den aktuelle bruger (myMessage) eller ej (otherMessage)
   */
  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.senderId === user.uid ? styles.myMessage : styles.otherMessage
      ]}
    >
      <Text style={styles.senderName}>{item.senderName}</Text>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    // KeyboardAvoidingView sikrer at inputfeltet ikke skjules af tastaturet på iOS
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Baggrundsgradient */}
      <LinearGradient colors={['#005f99', '#33ccff']} style={styles.container}>
        {/* Header med titel og tilbageknap */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
            <FontAwesome name="arrow-left" size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{trainerName}</Text>
        </View>

        {/* Liste over beskeder */}
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
        />

        {/* Inputfelt og sendeknap */}
        <View style={styles.inputContainer}>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="#cccccc"
            style={styles.input}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <FontAwesome name="send" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

// Stylesheet for ChatScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    // Header placeret i toppen med tilbage-knap og titel
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backArrow: {
    // Tilbage-knap placeret til venstre
    position: 'absolute',
    left: 20,
  },
  headerTitle: {
    // Titel i midten af headeren
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  messagesList: {
    // Plads til beskeder, starter under headeren og slutter over inputfeltet
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 10,
    marginBottom: 70,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '80%',
  },
  myMessage: {
    // Brugerens egne beskeder højrejusteres
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    // Andre brugeres beskeder venstrejusteres
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  senderName: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#0046a3',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    // Inputfelt og sendeknap i bunden
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    backgroundColor: '#ffffff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    // Tekstinput hvor brugeren skriver sin besked
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#cccccc',
    color: '#333',
  },
  sendButton: {
    // Knap til at sende beskeden
    marginLeft: 10,
    backgroundColor: '#3399ff',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatScreen;
