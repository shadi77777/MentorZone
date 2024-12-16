import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  TextInput
} from 'react-native';
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

/**
 * TrainerListScreen viser en liste over trænere, der tilbyder undervisning i en specifik sportsgren.
 * - Henter trænere fra Firestore, der har isTrainer = true
 * - Filtrerer trænere baseret på den valgte sportsgren fra route parametrene
 * - Giver mulighed for at søge efter trænere via navn
 * - Viser gennemsnitlig rating for trænerne, hvis tilgængelig
 * - Muliggør navigation til trænernes profil-side
 * - Tilbyder også en knap, hvor brugeren kan tilføje sig selv som træner for den valgte sport
 */
const TrainerListScreen = ({ route, navigation }) => {
  // Henter "sport" fra navigationens parametre
  const { sport } = route.params;

  // State-variabler
  const [trainers, setTrainers] = useState([]);     // Liste over trænere hentet fra Firestore
  const [loading, setLoading] = useState(true);     // Indikator for om data stadig hentes
  const [searchQuery, setSearchQuery] = useState(''); // Indtastet søgetekst
  const screenHeight = Dimensions.get('window').height;

  // useEffect: Henter trænere for den valgte sportsgren, når skærmen mountes
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        // Reference til 'users'-kollektionen i Firestore
        const usersRef = collection(db, 'users');
        // Hent kun trænere (isTrainer = true)
        const q = query(usersRef, where('isTrainer', '==', true));
        const querySnapshot = await getDocs(q);

        // Filtrér trænere, så vi kun får dem, der tilbyder den valgte sport
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

  // Filtrerer trænere baseret på søge-input (brugernavn)
  const filteredTrainers = trainers.filter(trainer =>
    trainer.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /**
   * renderTrainer: Renderer et kort for hver træner i listen.
   * Viser profilbillede, navn, rating, pris og erfaring for den valgte sport.
   */
  const renderTrainer = ({ item }) => {
    // Find detaljer for den aktuelle sport i trænerens data
    const sportDetails = item.trainerDetails.find((detail) => detail.sport === sport);

    // Beregn gennemsnitlig rating, hvis ratingCount og ratingSum er tilgængelige
    const averageRating = item.ratingCount
      ? (item.ratingSum / item.ratingCount).toFixed(1)
      : 'No rating available';

    return (
      <View style={styles.card}>
        {/* Profilbillede */}
        <Image source={{ uri: item.profilePicture }} style={styles.image} />
        <View style={styles.cardContent}>
          <Text style={styles.trainerName}>{item.name}</Text>
          {sportDetails && (
            <>
              {/* Rating */}
              <View style={styles.ratingContainer}>
                <Text style={styles.trainerRating}>⭐ {averageRating}</Text>
              </View>
              {/* Pris pr. time */}
              <Text style={styles.trainerPrice}>Price: {sportDetails.price}</Text>
              {/* Erfaring */}
              <Text style={styles.trainerExperience}>Experience: {sportDetails.experience} years</Text>
            </>
          )}

          {/* Knap til at se trænerprofil */}
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

  // Hvis data hentes stadig, vis en loading-indikator
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
      {/* Header med tilbage-knap, titel og beskedknap */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MentorZone</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MessagesList')} style={styles.messageButton}>
          <Ionicons name="chatbubble-outline" size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Overskrift for listen af trænere til den valgte sport */}
      <Text style={styles.header}>Trainers for {sport}</Text>

      {/* Søgning efter trænernavn */}
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

      {/* Vis liste af filtrerede trænere, ellers en besked om ingen trænere */}
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

      {/* Knap til selv at tilføje sig som træner for denne sport */}
      <TouchableOpacity
        style={styles.addTrainerButton}
        onPress={() => navigation.navigate('AddTrainer', { sport })}
      >
        <Text style={styles.addTrainerButtonText}>Add Yourself as a Trainer</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

// Styles til layout og udseende
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
  messageButton: {
    padding: 5,
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
    // Skyggeeffekt til søgefeltet
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
    // Skyggeeffekt til kortet
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
  ratingContainer: {
    marginTop: 5,
  },
  trainerRating: {
    fontSize: 16,
    color: '#f1c40f',
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
