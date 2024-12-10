import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ProfilePicture from '../components/ProfilePicture';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const SportScreen = () => {
  const navigation = useNavigation();
  const screenHeight = Dimensions.get('window').height;
  const [profilePicture, setProfilePicture] = useState(null);

  const fetchUserProfile = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.profilePicture) {
          setProfilePicture(userData.profilePicture);
        }
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserProfile();
    }, [])
  );

  const sports = [
    { name: 'Football', icon: 'football-outline', type: 'Ionicons' },
    { name: 'Basketball', icon: 'basketball-outline', type: 'Ionicons' },
    { name: 'Tennis', icon: 'tennisball-outline', type: 'Ionicons' },
    { name: 'Running', icon: 'walk-outline', type: 'Ionicons' },
    { name: 'Swimming', icon: 'water-outline', type: 'Ionicons' },
    { name: 'Cycling', icon: 'bicycle-outline', type: 'Ionicons' },
    { name: 'Bordtennis', icon: 'table-tennis', type: 'MaterialCommunityIcons' },
    { name: 'Badminton', icon: 'badminton', type: 'MaterialCommunityIcons' },
    { name: 'Yoga', icon: 'yoga', type: 'MaterialCommunityIcons' },
  ];

  return (
    <LinearGradient
      colors={['#0061A8', '#00C6FB']}
      style={[styles.container, { minHeight: screenHeight }]}
    >
      <View style={styles.topBar}>
        {/* AI Button (venstre side) */}
        <TouchableOpacity
          style={styles.chatSupportButton}
          onPress={() => navigation.navigate('chatbot')}
        >
          <Text style={styles.aiText}>AI-Support</Text>
        </TouchableOpacity>

        {/* Profile Picture (højre side) */}
        <ProfilePicture profilePicture={profilePicture} />
      </View>

      <View style={styles.logoContainer}>
        <Image source={require('../assets/mentorZone.png')} style={styles.logo} resizeMode="contain" />
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
            {sport.type === 'MaterialCommunityIcons' ? (
              <MaterialCommunityIcons name={sport.icon} size={24} color="#0046a3" style={styles.sportIcon} />
            ) : (
              <Ionicons name={sport.icon} size={24} color="#0046a3" style={styles.sportIcon} />
            )}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between', // AI til venstre, profilbillede til højre
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 15,
    marginTop: 20

  },
  chatSupportButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    // Skygge for knappen
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  aiText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0046a3',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 120,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subHeader: {
    fontSize: 18,
    color: '#D1E8FF',
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
    borderRadius: 25,
    width: '90%',
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    // Knapskygge
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  sportText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0046a3',
    marginLeft: 10,
  },
  sportIcon: {
    marginRight: 10,
  },
});

export default SportScreen;
