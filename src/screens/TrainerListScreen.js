import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

const TrainerListScreen = ({ route, navigation }) => {
  const { sport } = route.params;
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    // Fetch trainers
    const fetchTrainers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('isTrainer', '==', true));
        const querySnapshot = await getDocs(q);

        const trainersList = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(
            (trainer) =>
              Array.isArray(trainer.trainerDetails) &&
              trainer.trainerDetails.some((detail) => detail.sport === sport)
          );

        setTrainers(trainersList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trainers: ', error);
        setLoading(false);
      }
    };

    fetchTrainers();
  }, [sport]);

  // Fetch user's profile picture
  useEffect(() => {
    const fetchUserProfilePicture = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setProfilePicture(userDocSnap.data().profilePicture || null);
          }
        } catch (error) {
          console.error('Error fetching profile picture: ', error);
        }
      }
    };

    fetchUserProfilePicture();
  }, []);

  const filteredTrainers = trainers.filter(trainer =>
    trainer.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTrainer = ({ item }) => {
    const sportDetails = item.trainerDetails.find((detail) => detail.sport === sport);

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.profilePicture }} style={styles.image} />
        <View style={styles.cardContent}>
          <Text style={styles.trainerName}>{item.name}</Text>
          {sportDetails && (
            <>
              <Text style={styles.trainerRating}>⭐ {sportDetails.rating || 'No rating available'}</Text>
              <Text style={styles.trainerPrice}>Price: {sportDetails.price}</Text>
              <Text style={styles.trainerExperience}>{sportDetails.experience}</Text>
            </>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('TrainerProfile', { trainerId: item.id })}
          >
            <Text style={styles.buttonText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading trainers...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#005f99', '#33ccff']}
      style={[styles.container, { minHeight: screenHeight }]}
    >
      {/* Header with back arrow, title, and profile picture */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MentorZone</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileSetup')} style={styles.profileButton}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.profileImage} />
          ) : (
            <Image source={require('../assets/defaultProfile.png')} style={styles.profileImage} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.header}>Trainers for {sport}</Text>

      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search trainers..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
      </View>

      {filteredTrainers.length > 0 ? (
        <FlatList
          data={filteredTrainers}
          renderItem={renderTrainer}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.trainersList}
        />
      ) : (
        <Text style={styles.noTrainersText}>No trainers available for {sport}.</Text>
      )}

      <TouchableOpacity
        style={styles.addTrainerButton}
        onPress={() => navigation.navigate('AddTrainer', { sport })}
      >
        <Text style={styles.addTrainerButtonText}>Add Yourself as a Trainer</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    flex: 1,
  },
  profileButton: {
    padding: 5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    flexDirection: 'row',
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    padding: 15,
    overflow: 'hidden',
  },
  image: {
    width: 110,
    height: 150,
    borderRadius: 20,
  },
  cardContent: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'space-between',
  },
  trainerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0046a3',
  },
  trainerRating: {
    fontSize: 16,
    color: '#f1c40f',
    marginTop: 5,
  },
  trainerPrice: {
    fontSize: 16,
    color: '#0046a3',
    marginTop: 5,
  },
  trainerExperience: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 15,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trainersList: {
    paddingBottom: 20,
  },
  noTrainersText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
    marginTop: 10,
  },
  addTrainerButton: {
    backgroundColor: '#0046a3',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    alignSelf: 'center',
  },
  addTrainerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TrainerListScreen;
