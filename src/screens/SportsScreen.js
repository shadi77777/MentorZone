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
          console.log('User Data:', userData);
          if (userData.profilePicture) {
            setProfilePicture(userData.profilePicture);
            console.log('Profile picture found:', userData.profilePicture);
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
      colors={['#0D47A1', '#2196F3']}  // Darker blue tones for a modern look
      style={[styles.container, { minHeight: screenHeight }]}
    >
      {/* TouchableOpacity wrapping the Profile Picture */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('ProfileSetup')}
        style={styles.profilePictureTouchable}  // Updated styling for interaction
      >
        <View style={styles.profilePictureContainer}>
          <Image 
            source={
              profilePicture
                ? { uri: profilePicture }
                : require('../assets/defaultProfile.png')
            }
            style={styles.profilePicture}
          />
        </View>
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/mentorZone.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.headerContainer}>
        <Text style={styles.header}>Welcome</Text>
        <Text style={styles.subHeader}>
          Find professional trainers for different sports. Select a sport below to see available trainers!
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
  profilePictureTouchable: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  profilePictureContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicture: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subHeader: {
    fontSize: 16,
    color: '#B3E5FC',
    textAlign: 'center',
    marginHorizontal: 30,
    marginBottom: 20,
  },
  sportsList: {
    paddingBottom: 40,
  },
  sportButton: {
    backgroundColor: '#FFF',
    padding: 15,
    marginVertical: 10,
    borderRadius: 15,
    width: '90%',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  sportText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0046a3',
  },
});

export default SportScreen;
