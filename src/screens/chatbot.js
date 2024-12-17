// inspiration taget fra https://github.com/Innovationg-og-ny-teknologi-2021/07_GenAI_Code
// API-Nøglen findes i rapporten
import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Text } from 'react-native';
import { GiftedChat, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import { FontAwesome } from '@expo/vector-icons';
import SendMessage from '../services/request'; // Funktion der håndterer kommunikation med server eller chatbot-API

// Konfiguration for chatbot-profilen (udseende, navn, farver)
const CHAT_BOT_DATA = {
    name: 'Chat Assistant',
    image: 'https://via.placeholder.com/150/008080/FFFFFF?text=Chat+Assistant',
    primaryColor: '#005f99',
    secondaryColor: '#ffffff',
    userBubbleColor: '#dcf8c6',
    botBubbleColor: '#ffffff',
};

export default function ChatbotScreen({ navigation }) {
    // State-hook til at gemme chat-beskeder
    const [chatMessages, setChatMessages] = useState([]);
    // State-hook til at vise om chatbotten skriver lige nu (typing indicator)
    const [isTyping, setIsTyping] = useState(false);

    // Oprindelig samtalestart – bruger rolle og assistant rolle defineret til at give chatbot context
    const initialConversation = [
        {
            role: 'system',
            content:
                'You are a customer support assistant. Your job is to help users resolve issues, answer questions, and provide information about our services. Be polite, clear, and concise in your responses.',
        },
        {
            role: 'assistant',
            content: 'Hello!',
        },
    ];

    // useEffect der kører ved komponentens første rendering,
    // og initialiserer chatten med en standard velkomstbesked fra chatbotten.
    useEffect(() => {
        initializeChat();
    }, []);

    /**
     * Initialiserer chatten med en velkomstbesked fra chatbotten.
     */
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
        setChatMessages([initialMessage]); // Sætter chatMessages til at indeholde én besked
    };

    /**
     * Håndterer når brugeren sender en besked.
     * Tilføjer den nye besked til chatMessages og sender den til chatbot-funktionen.
     */
    const handleSend = (newMessages = []) => {
        // Tilføj brugerens besked til chatten
        setChatMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));

        const userMessage = newMessages[0]?.text;
        // Hvis der er en faktisk tekstbesked fra brugeren, bed om bot-respons
        if (userMessage) {
            fetchBotResponse(userMessage);
        }
    };

    /**
     * Henter chatbot-svar fra serveren eller API'et.
     * Viser typing-indikator, tilføjer brugerens input til konteksten,
     * og appender derefter chatbot-svaret til chatten.
     */
    const fetchBotResponse = async (userInput) => {
        setIsTyping(true); // Vis, at chatbotten "tænker"
        const userMessage = { role: 'user', content: userInput };
        initialConversation.push(userMessage);

        try {
            // Send hele konteksten (initialConversation) til chatbot-API'et for at få svar
            const response = await SendMessage(initialConversation);
            const botReply = response?.content || "I'm sorry, I cannot assist with that.";
            
            // Opret en ny besked fra chatbotten baseret på svaret
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

            // Tilføj chatbot-svaret til kontekst og chatten
            initialConversation.push({ role: 'assistant', content: botReply });
            setChatMessages((prevMessages) => GiftedChat.append(prevMessages, botMessage));
        } catch (error) {
            console.error('Error fetching bot response:', error);
        } finally {
            setIsTyping(false);
        }
    };

    /**
     * Tilpasning af boblestilen i chatten.
     * Brugeren får en grønlig farve, chatbotten en hvid boble.
     */
    const customizeBubble = (props) => (
        <Bubble
            {...props}
            wrapperStyle={{
                right: { backgroundColor: CHAT_BOT_DATA.userBubbleColor }, // Boble for bruger
                left: { backgroundColor: CHAT_BOT_DATA.botBubbleColor },   // Boble for chatbot
            }}
            textStyle={{
                right: { color: '#333' },
                left: { color: '#333' },
            }}
        />
    );

    /**
     * Tilpasning af inputfeltet i bunden af chatten.
     * Viser en hvid baggrund og en tynd grænse.
     */
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

    /**
     * Tilpasning af send-knappen.
     * Viser et lille send-ikon i stedet for standard-tekst.
     */
    const customizeSendButton = (props) => (
        <Send {...props}>
            <View style={{ marginRight: 10, marginBottom: 5 }}>
                <FontAwesome name="send" size={20} color="#005f99" />
            </View>
        </Send>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: CHAT_BOT_DATA.primaryColor }}>
            {/* Overskrift i toppen af skærmen, der fortæller at dette er kundesupport */}
            <View style={{ backgroundColor: CHAT_BOT_DATA.primaryColor, padding: 15 }}>
                <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
                    Customer Support
                </Text>
            </View>
            
            {/* Selve chat-komponenten der fylder det resterende areal */}
            <View style={{ flex: 1 }}>
                <GiftedChat
                    messages={chatMessages}                // Listen over beskeder
                    isTyping={isTyping}                    // Viser typing-indikator
                    onSend={handleSend}                    // Funktion der køres når bruger sender besked
                    user={{ _id: 1 }}                      // ID for den aktuelle bruger
                    renderBubble={customizeBubble}         // Tilpas bobler
                    renderInputToolbar={customizeInputToolbar} // Tilpas inputfelt
                    renderSend={customizeSendButton}        // Tilpas send-knap
                />
            </View>
        </SafeAreaView>
    );
}
