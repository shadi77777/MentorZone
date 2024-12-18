import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SportScreen from '../screens/SportsScreen';
import TrainerListScreen from '../screens/TrainerListScreen';   // Skærm til at vise liste over trænere for en specifik sport
import TrainerProfile from '../screens/TrainerProfile';         // Skærm til at vise detaljeret profil om en specifik træner
import ProfileSetupScreen from '../screens/ProfileSetupScreen'; // Skærm hvor brugeren kan oprette/ændre sin profil
import AddTrainerScreen from '../screens/AddTrainerScreen';     // Skærm hvor brugeren kan tilføje sig selv som træner
import ChatScreen from '../screens/ChatScreen';                 // Skærm til at vise enkelt chat mellem bruger og træner
import MessagesListScreen from '../screens/MessagesListScreen'; // Skærm til at vise en liste over brugerens samtaler
import chatbot from '../screens/chatbot';                       // Skærm til chatbot-support
import BookingScreen from '../screens/BookingScreen';

const Stack = createStackNavigator();

/**
 * AppNavigator opsætter appens navigationsstruktur:
 * - InitialRouteName = "Login" betyder at appen starter på Login-skærmen
 * - Hver Stack.Screen definerer en skærm i stakken
 * - 'headerShown: false' fjerner den øverste headerbjælke, så styling styres i hver enkelt skærm
 */
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
          options={{ headerShown: false }} 
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
          name="Chat"
          component={ChatScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="MessagesList" 
          component={MessagesListScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="chatbot" 
          component={chatbot} 
          options={{ headerShown: false }} 
        />

         <Stack.Screen 
            name="Booking" 
            component={BookingScreen} 
            options={{ headerShown: false }} 
          />


      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
