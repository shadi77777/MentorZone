import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SportScreen from '../screens/SportsScreen';
import TrainerListScreen from '../screens/TrainerListScreen'; // Import TrainerListScreen
import TrainerProfile from '../screens/TrainerProfile'; // Import TrainerProfile
import ProfileSetupScreen from '../screens/ProfileSetupScreen'; // Import ProfileSetupScreen
import AddTrainerScreen from  '../screens/AddTrainerScreen';
import ChatScreen from '../screens/ChatScreen'; // Import ChatScreen
import MessagesListScreen from '../screens/MessagesListScreen'; // Import MessagesListScreen
import chatbot from '../screens/chatbot';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Sport" 
          component={SportScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="TrainerList" 
          component={TrainerListScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="TrainerProfile" 
          component={TrainerProfile} 
          options={{ headerShown: false }} // Add TrainerProfile to the navigation
        />
        <Stack.Screen 
          name="ProfileSetup" 
          component={ProfileSetupScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="AddTrainer" 
          component={AddTrainerScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Chat" // Sørg for, at navnet er "Chat"
          component={ChatScreen} 
          options={{ headerShown: false }} // Add ChatScreen to the navigation
        />
        <Stack.Screen 
          name="MessagesList" 
          component={MessagesListScreen} 
          options={{ headerShown: false }} // Add MessagesListScreen to the navigation
        />
          <Stack.Screen 
          name="chatbot" 
          component={chatbot} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
