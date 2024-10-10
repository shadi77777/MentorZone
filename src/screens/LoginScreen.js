import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Image, Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';  
import { signInWithEmailAndPassword } from 'firebase/auth';  
import { auth, db } from '../firebase';  // Firestore instance
import { doc, getDoc } from 'firebase/firestore';  // Firestore methods
import { LinearGradient } from 'expo-linear-gradient';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const screenHeight = Dimensions.get('window').height;
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the user has completed the profile setup
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        // Check if 'isProfileSetup' field is true, otherwise navigate to ProfileSetup
        if (userData.isProfileSetup) {
          navigation.navigate('Sport');  // Navigate to SportScreen
        } else {
          navigation.navigate('ProfileSetup');  // Navigate to ProfileSetupScreen
        }
      } else {
        // If no document exists for the user, navigate to ProfileSetupScreen
        navigation.navigate('ProfileSetup');
      }

    } catch (error) {
      console.error('Login error: ', error);
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <LinearGradient
      colors={['#0D47A1', '#E3F2FD']}
      style={styles.container}
    >
      <View style={[styles.header, { height: screenHeight * 0.4 }]}>
        <Image
          style={styles.logo}
          source={require('../assets/mentorZone.png')}  
          resizeMode="contain"
        />
      </View>
      <View style={styles.form}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#c7c7cd"
          style={styles.input}
          value={email}
          onChangeText={(text) => setEmail(text)}  
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#c7c7cd"
          secureTextEntry={true}
          style={styles.input}
          value={password}
          onChangeText={(text) => setPassword(text)}  
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerButtonText}>Register Here</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: '80%',  
    height: '80%',
    marginBottom: 20,
  },
  form: {
    padding: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 55,
    borderColor: '#B0BEC5',  
    borderWidth: 1,
    borderRadius: 12,  
    paddingLeft: 15,
    marginBottom: 20,
    backgroundColor: '#F5F5F5',  
    color: '#37474F',  
    shadowColor: "#000",  
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,  
  },
  button: {
    backgroundColor: '#1E88E5',  
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',  
  },
  registerButton: {
    backgroundColor: '#42A5F5',  
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  forgotPassword: {
    marginTop: 15,
    textAlign: 'center',
    color: '#1565C0',
    fontWeight: '500',  
    fontSize: 16,
  },
});

export default LoginScreen;
