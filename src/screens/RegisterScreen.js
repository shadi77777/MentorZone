// src/screens/RegisterScreen.js

import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Dimensions,
  Alert
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Firebase Authentication funktion til oprettelse af bruger
import { useNavigation } from '@react-navigation/native'; // Hook til at navigere mellem skærme
import { auth } from '../firebase'; // Importér konfigurationen for Firebase
import Button from '../components/Button'; // Egen defineret knap-komponent

/**
 * RegisterScreen giver brugeren mulighed for at oprette en ny konto med email og password.
 * - Tjekker at password og confirm password matcher
 * - Opretter brugeren i Firebase Authentication
 * - Navigerer brugeren til Login-skærmen ved succesfuld oprettelse
 */
const RegisterScreen = () => {
  // Lokale state-variabler til at gemme brugerens inputdata
  const [email, setEmail] = useState('');           // Indtastet email
  const [password, setPassword] = useState('');     // Indtastet password
  const [confirmPassword, setConfirmPassword] = useState(''); // Bekræft password

  // Hent skærmhøjden til layoutformål
  const screenHeight = Dimensions.get('window').height;

  // Navigation hook, så vi kan navigere mellem skærme
  const navigation = useNavigation();

  /**
   * handleRegister:
   * - Tjekker om password matcher confirmPassword
   * - Hvis ja, opretter bruger i Firebase
   * - Hvis nej, vises en alert om at passwords ikke matcher
   */
  const handleRegister = () => {
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match!');
      return;
    }

    // Opret bruger i Firebase Authentication med email og password
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        Alert.alert('Registration Successful', `Welcome, ${user.email}!`);
        navigation.navigate('Login'); // Naviger til Login-skærm efter registrering
      })
      .catch((error) => {
        console.error('Registration error: ', error);
        Alert.alert('Registration Failed', error.message);
      });
  };

  return (
    <View style={styles.container}>
      {/* Header-sektion med logo */}
      <View style={[styles.header, { height: screenHeight * 0.4 }]}>
        <Image
          style={styles.logo}
          source={require('../assets/mentorZone.png')} // Sti til logo-billede
          resizeMode="contain"
        />
      </View>

      {/* Formular til at indtaste email, password, og confirm password */}
      <View style={styles.form}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#c7c7cd"
          style={styles.input}
          value={email}
          onChangeText={(text) => setEmail(text)} // Opdater email-state med brugerens input
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#c7c7cd"
          secureTextEntry={true} // Skjul passwordtegn
          style={styles.input}
          value={password}
          onChangeText={(text) => setPassword(text)} // Opdater password-state
        />
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#c7c7cd"
          secureTextEntry={true} // Skjul passwordtegn
          style={styles.input}
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)} // Opdater confirmPassword-state
        />

        {/* Knap til at starte registreringsprocessen */}
        <Button title="Register" onPress={handleRegister} />

        {/* Link til Login-skærmen, hvis brugeren allerede har en konto */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.registerButtonText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles for layout og udseende
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
