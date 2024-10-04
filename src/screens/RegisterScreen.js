// src/screens/RegisterScreen.js

import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Image, Dimensions, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Firebase Authentication
import { useNavigation } from '@react-navigation/native'; // Navigation hook
import { auth } from '../firebase'; // Firebase configuration
import Button from '../components/Button'; // Custom button component

const RegisterScreen = () => {
  const [email, setEmail] = useState(''); // State for email
  const [password, setPassword] = useState(''); // State for password
  const [confirmPassword, setConfirmPassword] = useState(''); // State for confirming password
  const screenHeight = Dimensions.get('window').height; // Get screen height for layout
  const navigation = useNavigation(); // Hook for navigation

  // Function to handle user registration
  const handleRegister = () => {
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match!');
      return;
    }

    // Firebase registration using email and password
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        Alert.alert('Registration Successful', `Welcome, ${user.email}!`);
        navigation.navigate('Login'); // Navigate to Login after successful registration
      })
      .catch((error) => {
        console.error('Registration error: ', error);
        Alert.alert('Registration Failed', error.message);
      });
  };

  return (
    <View style={styles.container}>
      {/* Header with logo */}
      <View style={[styles.header, { height: screenHeight * 0.4 }]}>
        <Image
          style={styles.logo}
          source={require('../assets/mentorZone.png')} // Path to your logo image
          resizeMode="contain"
        />
      </View>

      {/* Registration form */}
      <View style={styles.form}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#c7c7cd"
          style={styles.input}
          value={email}
          onChangeText={(text) => setEmail(text)} // Bind the email input
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#c7c7cd"
          secureTextEntry={true}
          style={styles.input}
          value={password}
          onChangeText={(text) => setPassword(text)} // Bind the password input
        />
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#c7c7cd"
          secureTextEntry={true}
          style={styles.input}
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)} // Bind confirm password input
        />

        {/* Custom button to trigger registration */}
        <Button title="Register" onPress={handleRegister} />

        {/* Navigation back to Login screen */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.registerButtonText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0046a3',
    overflow: 'hidden',
    
  },
  logo: {
    width: '90%',
    height: '90%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  form: {
    padding: 20,
    marginTop: 30,
    
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 15,
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
  },
  registerButtonText: {
    color: '#0046a3',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default RegisterScreen;
