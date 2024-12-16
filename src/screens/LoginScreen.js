import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; 
import GradientLayout from '../components/GradientLayout'; // Importér en komponent der giver en gradient baggrund

/**
 * LoginScreen er en React-komponent der håndterer brugerlogin.
 * - Brugeren kan indtaste email og password
 * - Ved login tjekkes legitimationsoplysninger mod Firebase Authentication
 * - Ved succesfuldt login navigeres brugeren til "Sport" skærmen
 * - Der tilbydes også en knap til registrering og en glemt kodeord-knap (i denne kode ikke funktionel)
 */
const LoginScreen = () => {
  // State-variabler til at gemme brugerens indtastede email og password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Hent skærmens højde for at justere layout dynamisk
  const screenHeight = Dimensions.get('window').height;

  // useNavigation-hook fra React Navigation bruges til at navigere mellem skærme
  const navigation = useNavigation();

  /**
   * HandleLogin-funktionen kaldes, når brugeren trykker på "Sign In" knappen.
   * Den bruger Firebase Authentication til at logge brugeren ind.
   * Ved succesfuldt login vises en alert, og brugeren navigeres til "Sport"-skærmen.
   * Ved fejl vises en alert med fejlmeddelelsen.
   */
  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        Alert.alert('Login Successful', `Welcome, ${user.email}!`);
        navigation.navigate('Sport'); // Naviger til Sport-skærm efter login
      })
      .catch((error) => {
        console.error('Login error: ', error);
        Alert.alert('Login Failed', error.message);
      });
  };

  return (
    // GradientLayout giver en baggrund med farvegradient, importeret fra en ekstern komponent
    <GradientLayout>
      {/* Header-sektion med logo */}
      <View style={[styles.header, { height: screenHeight * 0.4 }]}>
        <Image
          style={styles.logo}
          source={require('../assets/mentorZone.png')} // Logo-billede
          resizeMode="contain"
        />
      </View>

      {/* Formular-sektion med inputfelter og knapper */}
      <View style={styles.form}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#c7c7cd"
          style={styles.input}
          value={email}
          onChangeText={(text) => setEmail(text)}   // Opdater email-state med brugerens input
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#c7c7cd"
          secureTextEntry={true}                    // Gør feltet til et password-felt
          style={styles.input}
          value={password}
          onChangeText={(text) => setPassword(text)}// Opdater password-state med brugerens input
        />
        
        {/* Login-knap */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        {/* Registrerings-knap der navigerer til "Register" skærmen */}
        <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerButtonText}>Register Here</Text>
        </TouchableOpacity>

        {/* Glemt password-knap (funktionalitet ikke implementeret) */}
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
    </GradientLayout>
  );
};

// Styles til layout, input, knapper og tekst
const styles = StyleSheet.create({
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
    // Skygge for at give dybde
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
    // Skygge
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
    // Skygge
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
