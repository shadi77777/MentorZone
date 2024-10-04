import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore'; // Firestore queries
import { db } from '../firebase'; // Firestore instance
import { LinearGradient } from 'expo-linear-gradient'; // For gradient background

const TrainerListScreen = ({ route, navigation }) => {
  const { sport } = route.params;
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    // Fetch trainers from Firestore based on the selected sport
    const fetchTrainers = async () => {
      try {
        const trainersRef = collection(db, 'trainers'); // Reference to the trainers collection
        const q = query(trainersRef, where('sport', '==', sport)); // Query trainers by sport
        const querySnapshot = await getDocs(q);

        const trainersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTrainers(trainersList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trainers: ', error);
        setLoading(false);
      }
    };

    fetchTrainers();
  }, [sport]);

  const renderTrainer = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.trainerName}>{item.name}</Text>
        <Text style={styles.trainerRating}>⭐ {item.rating}</Text>
        <Text style={styles.trainerPrice}>Price: {item.price}</Text>
        <Text style={styles.trainerDescription}>{item.description}</Text>

        {/* Button to view more details or book a session */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('TrainerProfile', { trainerId: item.id })}
        >
          <Text style={styles.buttonText}>View Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading trainers...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#0D47A1', '#E3F2FD']}
      style={[styles.container, { minHeight: screenHeight }]}
    >
      <Text style={styles.header}>Trainers for {sport}</Text>
      {trainers.length > 0 ? (
        <FlatList
          data={trainers}
          renderItem={renderTrainer}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.trainersList}
        />
      ) : (
        <Text style={styles.noTrainersText}>No trainers available for {sport}.</Text>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    padding: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  cardContent: {
    flex: 1,
    paddingLeft: 15,
    justifyContent: 'center',
  },
  trainerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0046a3',
  },
  trainerRating: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  trainerPrice: {
    fontSize: 16,
    color: '#0046a3',
    marginTop: 5,
  },
  trainerDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#0046a3',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trainersList: {
    paddingBottom: 20,
  },
  noTrainersText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 10,
  },
});

export default TrainerListScreen;
