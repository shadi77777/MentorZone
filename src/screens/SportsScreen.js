import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';  // For gradient background
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';  // Firestore instance

const SportScreen = () => {
  const navigation = useNavigation();
  const screenHeight = Dimensions.get('window').height;

  const [profilePicture, setProfilePicture] = useState(null); // State to store profile picture URL

  // Fetch user profile info from Firebase (assuming the profile picture is stored in Firestore)
  useEffect(() => {
    const fetchUserProfile = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log('User Data:', userData);  // Log fetched data
          if (userData.profilePicture) {
            setProfilePicture(userData.profilePicture);
            console.log('Profile picture found:', userData.profilePicture); // Log profile picture URL
          } else {
            console.log('No profile picture found, setting default.');
          }
        } else {
          console.log('No user document found.');
        }
      }
    };
  
    fetchUserProfile();
  }, []);
  

  // Dummy sports list
  const sports = [
    { name: 'Football' },
    { name: 'Basketball' },
    { name: 'Tennis' },
    { name: 'Running' },
    { name: 'Swimming' },
    { name: 'Cycling' },
    { name: 'Bordtennis' },
    { name: 'Badminton' },
  ];

  return (
    <LinearGradient
      colors={['#0D47A1', '#E3F2FD']}
      style={[styles.container, { minHeight: screenHeight }]}
    >

      {/* Profile Picture in Top-Right */}
      <View style={styles.profilePictureContainer}>
        <Image 
          source={
            profilePicture
              ? { uri: profilePicture }  // If a profile picture exists, use it
              : require('../assets/defaultProfile.png')  // Default image if no profile picture
          }
          style={styles.profilePicture}
        />
      </View>

      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/mentorZone.png')}  // Make sure the path to your logo is correct
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Welcome</Text>
        <Text style={styles.subHeader}>
          In this app, you can find professional trainers for different sports. Select your sport below to see available trainers!
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.sportsList}>
        {sports.map((sport, index) => (
          <TouchableOpacity
            key={index}
            style={styles.sportButton}
            onPress={() => navigation.navigate('TrainerList', { sport: sport.name })}
          >
            <Text style={styles.sportText}>{sport.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  profilePictureContainer: {
    position: 'absolute',
    top: 40, // Adjust the position from the top of the screen
    right: 20, // Align it to the right side
    zIndex: 10, // Ensure the profile picture stays on top
  },
  profilePicture: {
    width: 50,  // Adjust the size of the profile picture
    height: 50,
    borderRadius: 25,  // Make it circular
    borderWidth: 2,
    borderColor: '#fff',  // Add a border for a clean look
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 0,  // Adjust for spacing
  },
  logo: {
    width: 200,  // Adjust the size of the logo
    height: 200, // Adjust the size of the logo
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  header: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 0,
  },
  subHeader: {
    fontSize: 16,
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  sportsList: {
    alignItems: 'center',
  },
  sportButton: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 10,
    width: '80%',
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,  // Shadow for Android
    shadowColor: '#000',  // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  sportText: {
    color: '#0046a3',
    fontSize: 20,
    fontWeight: '600',
  },
});

export default SportScreen;
