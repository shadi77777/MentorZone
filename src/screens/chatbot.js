import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Text } from 'react-native';
import { GiftedChat, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import { FontAwesome } from '@expo/vector-icons';
import SendMessage from '../services/request';

const CHAT_BOT_DATA = {
    name: 'Chat Assistant',
    image: 'https://via.placeholder.com/150/008080/FFFFFF?text=Chat+Assistant',
    primaryColor: '#005f99',
    secondaryColor: '#ffffff',
    userBubbleColor: '#dcf8c6',
    botBubbleColor: '#ffffff',
};

export default function ChatbotScreen({ navigation }) {
    const [chatMessages, setChatMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);

    const initialConversation = [
        {
            role: 'system',
            content:
                'You are a customer support assistant. Your job is to help users resolve issues, answer questions, and provide information about our services. Be polite, clear, and concise in your responses.',
        },
        {
            role: 'assistant',
            content: 'Hello! I’m here to assist you with any questions or issues. How can I help you today?',
        },
    ];

    useEffect(() => {
        initializeChat();
    }, []);

    const initializeChat = () => {
        const initialMessage = {
            _id: 1,
            text: `Hi, I’m ${CHAT_BOT_DATA.name}. How can I assist you?`,
            createdAt: new Date(),
            user: {
                _id: 2,
                name: CHAT_BOT_DATA.name,
                avatar: CHAT_BOT_DATA.image,
            },
        };
        setChatMessages([initialMessage]);
    };

    const handleSend = (newMessages = []) => {
        setChatMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
        const userMessage = newMessages[0]?.text;
        if (userMessage) {
            fetchBotResponse(userMessage);
        }
    };

    const fetchBotResponse = async (userInput) => {
        setIsTyping(true);
        const userMessage = { role: 'user', content: userInput };
        initialConversation.push(userMessage);

        try {
            const response = await SendMessage(initialConversation);
            const botReply = response?.content || "I'm sorry, I cannot assist with that.";
            const botMessage = {
                _id: Math.random(),
                text: botReply,
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: CHAT_BOT_DATA.name,
                    avatar: CHAT_BOT_DATA.image,
                },
            };
            initialConversation.push({ role: 'assistant', content: botReply });
            setChatMessages((prevMessages) => GiftedChat.append(prevMessages, botMessage));
        } catch (error) {
            console.error('Error fetching bot response:', error);
        } finally {
            setIsTyping(false);
        }
    };

    const customizeBubble = (props) => (
        <Bubble
            {...props}
            wrapperStyle={{
                right: { backgroundColor: CHAT_BOT_DATA.userBubbleColor },
                left: { backgroundColor: CHAT_BOT_DATA.botBubbleColor },
            }}
            textStyle={{
                right: { color: '#333' },
                left: { color: '#333' },
            }}
        />
    );

    const customizeInputToolbar = (props) => (
        <InputToolbar
            {...props}
            containerStyle={{
                backgroundColor: CHAT_BOT_DATA.secondaryColor,
                borderTopWidth: 1,
                borderTopColor: '#cccccc',
            }}
            textInputStyle={{ color: '#333' }}
        />
    );

    const customizeSendButton = (props) => (
        <Send {...props}>
            <View style={{ marginRight: 10, marginBottom: 5 }}>
                <FontAwesome name="send" size={20} color="#005f99" />
            </View>
        </Send>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: CHAT_BOT_DATA.primaryColor }}>
            <View style={{ backgroundColor: CHAT_BOT_DATA.primaryColor, padding: 15 }}>
                <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
                    Customer Support
                </Text>
            </View>
            <View style={{ flex: 1 }}>
                <GiftedChat
                    messages={chatMessages}
                    isTyping={isTyping}
                    onSend={handleSend}
                    user={{ _id: 1 }}
                    renderBubble={customizeBubble}
                    renderInputToolbar={customizeInputToolbar}
                    renderSend={customizeSendButton}
                />
            </View>
        </SafeAreaView>
    );
}
