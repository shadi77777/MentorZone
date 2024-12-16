import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Modal, 
  Alert 
} from 'react-native';
import { doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from 'react-native-vector-icons';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

/**
 * TrainerProfile-komponenten viser detaljer om en bestemt træner (tilhørende det givne trainerId).
 * Den giver brugeren mulighed for:
 * - At se trænerens profil, inklusiv billede, by, sport, pris, erfaring og beskrivelse
 * - At sende en besked til træneren (oprette eller gå ind i en chat)
 * - At vurdere (rate) træneren med stjerner (1-5)
 *
 * Når komponenten mountes, hentes trænerens data fra Firestore. Hvis brugeren er logget ind,
 * hentes også brugerens profilbillede til at vise i øverste hjørne.
 */
const TrainerProfile = ({ route, navigation }) => {
  // Henter trainerId fra navigationens parametre
  const { trainerId } = route.params;

  // State-variabler
  const [trainer, setTrainer] = useState(null);                // Gemmer trænerdata
  const [loading, setLoading] = useState(true);                // Indikator for datahentning
  const [profilePicture, setProfilePicture] = useState(null);  // Brugerens profilbillede
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false); // Viser modal til rating

  // useEffect kører ved komponent-mount:
  // - Henter nuværende bruger
  // - Henter brugerens profilbillede
  // - Henter trænerens data baseret på trainerId
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      // Hent brugerens profilbillede
      const fetchProfilePicture = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setProfilePicture(userData.profilePicture || null);
          }
        } catch (error) {
          console.error('Error fetching user profile picture:', error);
        }
      };
      fetchProfilePicture();

      // Hent trænerdata
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
    }
  }, [trainerId]);

  /**
   * handleContactTrainer:
   * Navigerer brugeren til chatten med denne træner.
   * Opretter et chatId baseret på bruger-id og træner-id for at sikre deterministisk chatnavn.
   */
  const handleContactTrainer = () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const chatId = user.uid < trainerId ? `${user.uid}_${trainerId}` : `${trainerId}_${user.uid}`;
      navigation.navigate('Chat', { chatId, trainerId });
    }
  };

  /**
   * handleRating:
   * Håndterer brugerens rating af træneren.
   * - Henter trænerens data igen for at sikre opdaterede værdier
   * - Opdaterer ratingSum og ratingCount, afhængig af om brugeren har ratet før.
   * - Gemmer brugerens rating i userRatings på trænerens dokument.
   */
  const handleRating = async (rating) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const trainerDocRef = doc(db, 'users', trainerId);

      // Hent trænerdata for at sikre det er opdateret
      const trainerDocSnap = await getDoc(trainerDocRef);
      if (trainerDocSnap.exists()) {
        const trainerData = trainerDocSnap.data();
        const userRatings = trainerData.userRatings || {}; // Brug eksisterende ratings, eller tomt object
        const previousRating = userRatings[user.uid] ? userRatings[user.uid] : 0;

        if (previousRating > 0) {
          // Hvis brugeren har ratet før, justér ratingSum ved at fjerne den gamle rating og tilføje den nye
          const updatedRatingSum = trainerData.ratingSum - previousRating + rating;
          await updateDoc(trainerDocRef, {
            ratingSum: updatedRatingSum,
            userRatings: {
              ...userRatings,
              [user.uid]: rating,
            },
          });
        } else {
          // Hvis det er første gang brugeren rater, inkrementér ratingSum og ratingCount
          await updateDoc(trainerDocRef, {
            ratingSum: increment(rating),
            ratingCount: increment(1),
            userRatings: {
              ...userRatings,
              [user.uid]: rating,
            },
            ratedBy: arrayUnion(user.uid),
          });
        }

        // Opdater local state med den nye rating
        setTrainer((prevTrainer) => ({
          ...prevTrainer,
          ratingSum: previousRating === 0 
            ? (prevTrainer.ratingSum || 0) + rating 
            : prevTrainer.ratingSum - previousRating + rating,
          ratingCount: previousRating === 0 
            ? (prevTrainer.ratingCount || 0) + 1 
            : prevTrainer.ratingCount,
          userRatings: {
            ...prevTrainer.userRatings,
            [user.uid]: rating,
          },
          ratedBy: previousRating === 0 
            ? [...(prevTrainer.ratedBy || []), user.uid] 
            : prevTrainer.ratedBy,
        }));

        // Luk rating-modalen efter succesfuld opdatering
        setIsRatingModalVisible(false);
      }
    } catch (error) {
      console.error('Error rating trainer: ', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
      setIsRatingModalVisible(false); // Luk modal selv ved fejl
    }
  };

  // Hvis data stadig hentes, vis en loading-indikator
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading trainer details...</Text>
      </View>
    );
  }

  // Hvis der ikke blev fundet en træner med trainerId
  if (!trainer) {
    return <Text style={styles.notFoundText}>Trainer not found</Text>;
  }

  // Hent første trænerDetail (antag kun én, eller vælg en vilkårlig)
  const trainerDetail = trainer.trainerDetails && trainer.trainerDetails.length > 0 
    ? trainer.trainerDetails[0] 
    : null;

  // Beregn gennemsnitlig rating
  const averageRating = trainer.ratingCount
    ? (trainer.ratingSum / trainer.ratingCount).toFixed(1)
    : 'No rating available';

  return (
    <LinearGradient colors={['#005f99', '#33ccff']} style={styles.container}>
      {/* Header med tilbage-knap, titel og brugerens profilbillede */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MentorZone</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileSetup')}>
          <View style={styles.profilePictureContainer}>
            <Image
              source={profilePicture ? { uri: profilePicture } : require('../assets/defaultProfile.png')}
              style={styles.profilePicture}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Trænerens info-kort */}
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
              <View style={styles.ratingContainer}>
                <FontAwesome name="star" size={20} color="#ffd700" style={styles.ratingStar} />
                <Text style={styles.ratingText}>Average Rating: {averageRating}</Text>
                
                {/* Ikon til at tilføje eller ændre brugerens rating af træneren */}
                <TouchableOpacity onPress={() => setIsRatingModalVisible(true)} style={{ marginLeft: 'auto' }}>
                  <FontAwesome name="star-o" size={20} color="#3399ff" style={styles.rateStar} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.noDetails}>No trainer details available</Text>
          )}

          {/* Knap til at kontakte træneren (gå til chat) */}
          <TouchableOpacity style={styles.contactButton} onPress={handleContactTrainer}>
            <Text style={styles.buttonText}>Contact Trainer</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal til at vælge rating (1-5 stjerner) */}
      <Modal
        visible={isRatingModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsRatingModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate the Trainer</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleRating(star)}>
                  <FontAwesome name="star" size={32} color="#ffd700" />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsRatingModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

// Styles til udseende og layout
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  ratingStar: {
    marginRight: 5,
  },
  rateStar: {
    marginLeft: 10,
  },
  ratingText: {
    fontSize: 16,
    color: '#333',
  },
  contactButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cancelButton: {
    marginTop: 20,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 18,
  },
});

export default TrainerProfile;
