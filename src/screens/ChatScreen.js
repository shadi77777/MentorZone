import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from 'react-native-vector-icons';
import { createNewChat } from './createNewChat';

const ChatScreen = ({ route, navigation }) => {
  const { chatId, otherParticipant, trainerId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [trainerName, setTrainerName] = useState('');
  const [userName, setUserName] = useState('');
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (otherParticipant && otherParticipant.name) {
      setTrainerName(otherParticipant.name);
    } else if (trainerId) {
      // Fetch trainer name
      const fetchTrainerName = async () => {
        try {
          const trainerDoc = await getDoc(doc(db, 'users', trainerId));
          if (trainerDoc.exists()) {
            setTrainerName(trainerDoc.data().name || 'Trainer');
          }
        } catch (error) {
          console.error('Error fetching trainer name:', error);
        }
      };
      fetchTrainerName();
    }
  }, [trainerId, otherParticipant]);

  useEffect(() => {
    // Fetch user name
    const fetchUserName = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
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

  useEffect(() => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }
  
    if (!chatId) {
      console.error('Chat ID is missing');
      return;
    }

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesData);
    });
  
    return unsubscribe;
  }, [chatId, user]);

  const handleSend = async () => {
    if (newMessage.trim() === '') return;
  
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
  
      // Opret chatten, hvis den ikke eksisterer
      if (!chatDoc.exists()) {
        await createNewChat(user.uid, trainerId);
      }
  
      // Tilføj beskeden til chatten
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        text: newMessage,
        senderId: user.uid,
        senderName: userName,
        createdAt: new Date(),
      });
  
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };
  
  const renderItem = ({ item }) => (
    <View style={[styles.messageContainer, item.senderId === user.uid ? styles.myMessage : styles.otherMessage]}>
      <Text style={styles.senderName}>{item.senderName}</Text>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#005f99', '#33ccff']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
            <FontAwesome name="arrow-left" size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{trainerName}</Text>
        </View>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
        />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
    position: 'absolute',
    left: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  messagesList: {
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
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  otherMessage: {
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
    marginLeft: 10,
    backgroundColor: '#3399ff',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatScreen;