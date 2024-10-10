import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient for gradient background
import { db } from '../firebase';

const TrainerProfile = ({ route, navigation }) => {
  const { trainerId } = route.params;
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to fetch trainer details based on the trainerId
    const fetchTrainerDetails = async () => {
      try {
        const trainerDocRef = doc(db, 'trainers', trainerId);
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

  return (
    <LinearGradient
      colors={['#005f99', '#33ccff']} // Updated gradient for a modern look
      style={styles.container}
    >
      <View style={styles.card}>
        <Image source={{ uri: trainer.imageUrl }} style={styles.image} />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{trainer.name || 'Name not available'}</Text>
          <Text style={styles.rating}>⭐ {trainer.rating || 'No rating available'}</Text>
          <Text style={styles.price}>Price: {trainer.price || 'Price not available'}</Text>
          <Text style={styles.description}>{trainer.description || 'No description available'}</Text>
          <Text style={styles.bio}>{trainer.bio || 'No bio available'}</Text>

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
    justifyContent: 'center',
    alignItems: 'center',
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
  rating: {
    fontSize: 20,
    color: '#fbc02d',
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    color: '#0046a3',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    lineHeight: 22,
  },
  bio: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
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
