import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

const TrainerProfile = ({ route, navigation }) => {
  const { trainerId } = route.params;
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    // Fetching user profile picture for the top-right corner
    const fetchProfilePicture = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setProfilePicture(userData.profilePicture || null);
        }
      }
    };

    fetchProfilePicture();

    // Function to fetch trainer details based on the trainerId
    const fetchTrainerDetails = async () => {
      try {
        const trainerDocRef = doc(db, 'users', trainerId);
        const trainerDoc = await getDoc(trainerDocRef);
        if (trainerDoc.exists()) {
          setTrainer(trainerDoc.data());
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trainer details: ', error);
        setLoading(false);
      }
    };

    fetchTrainerDetails();
  }, [trainerId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading trainer details...</Text>
      </View>
    );
  }

  if (!trainer) {
    return <Text style={styles.notFoundText}>Trainer not found</Text>;
  }

  // Check if trainer has trainerDetails
  const trainerDetail = trainer.trainerDetails && trainer.trainerDetails.length > 0 ? trainer.trainerDetails[0] : null;

  return (
    <LinearGradient
      colors={['#005f99', '#33ccff']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MentorZone</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileSetup')}>
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
      </View>

      <View style={styles.card}>
        <Image source={{ uri: trainer.profilePicture }} style={styles.image} />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{trainer.name || 'Name not available'}</Text>
          <Text style={styles.city}>City: {trainer.city || 'City not available'}</Text>
          {trainerDetail ? (
            <View style={styles.detailContainer}>
              <Text style={styles.sport}>Sport: {trainerDetail.sport || 'N/A'}</Text>
              <Text style={styles.price}>Price: {trainerDetail.price || 'N/A'}</Text>
              <Text style={styles.experience}>Experience: {trainerDetail.experience || 'N/A'}</Text>
              <Text style={styles.description}>Description: {trainerDetail.description || 'No description available'}</Text>
            </View>
          ) : (
            <Text style={styles.noDetails}>No trainer details available</Text>
          )}

          {/* Button to interact with the profile */}
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => {
              alert('Contact Trainer feature coming soon!');
            }}
          >
            <Text style={styles.buttonText}>Contact Trainer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 70,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  backArrow: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  profilePictureContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profilePicture: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    marginTop: 10,
  },
  notFoundText: {
    color: '#ffffff',
    fontSize: 22,
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    padding: 25,
    marginTop: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginBottom: 20,
  },
  infoContainer: {
    paddingHorizontal: 10,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0046a3',
    marginBottom: 10,
  },
  city: {
    fontSize: 18,
    color: '#0046a3',
    marginBottom: 10,
  },
  detailContainer: {
    marginBottom: 15,
  },
  sport: {
    fontSize: 18,
    color: '#333',
  },
  price: {
    fontSize: 16,
    color: '#0046a3',
    marginTop: 5,
  },
  experience: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  description: {
    fontSize: 15,
    color: '#666',
    marginTop: 5,
  },
  noDetails: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  contactButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TrainerProfile;