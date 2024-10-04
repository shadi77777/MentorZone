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
      colors={['#0D47A1', '#E3F2FD']}
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
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  },
  notFoundText: {
    color: '#fff',
    fontSize: 22,
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '100%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoContainer: {
    paddingHorizontal: 10,
  },
  name: {
    fontSize: 26,
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
  },
  bio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  contactButton: {
    backgroundColor: '#0046a3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TrainerProfile;
