import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ScrollView, Dimensions, Platform, Modal, Button, ActionSheetIOS } from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * AddTrainerScreen er en React-komponent, der giver brugeren mulighed for at:
 * - Tilføje sit profilbillede (via kamera eller galleri)
 * - Indtaste personlige oplysninger (navn, by)
 * - Angive trænerdetaljer for en given sport (pris, erfaring, beskrivelse)
 * - Gemme disse oplysninger i Firestore-databasen
 * - Uploade billedet til Firebase Storage
 * - Slette trænerprofilen med et enkelt tryk
 * 
 * Komponentens formål er at gøre det nemt for en bruger at tilføje eller fjerne sig selv som træner.
 */
const AddTrainerScreen = ({ route, navigation }) => {
  // Hent den valgte sportsgren fra navigationens parametre, eller tom streng hvis ingen
  const sport = route?.params?.sport || '';

  // State-variabler der holder styr på brugerdata
  const [name, setName] = useState('');           // Brugerens navn
  const [city, setCity] = useState('');           // By hvor brugeren befinder sig
  const [price, setPrice] = useState('');         // Trænerpris pr. time
  const [experience, setExperience] = useState('');// Antal års erfaring
  const [description, setDescription] = useState('');// Kort beskrivelse af brugerens kompetencer
  const [profilePicture, setProfilePicture] = useState(null); // URL til profilbillede
  const [uploading, setUploading] = useState(false);// Status om billede uploader i øjeblikket
  const [progress, setProgress] = useState(0);     // Procentvis fremdrift for billedupload
  const [isModalVisible, setIsModalVisible] = useState(false); // Styring af modal til billedvalg på Android
  const screenHeight = Dimensions.get('window').height; // Skærmhøjde for styling

  // useEffect, der kører ved første render:
  // Henter eksisterende brugerdata fra Firestore, hvis det findes, og sætter felter med disse data.
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          // Referencen til Firestore-dokumentet for den loggede bruger
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            // Hvis dokumentet findes, sæt state med de hentede oplysninger
            const userData = userDocSnap.data();
            setName(userData.name || '');
            setCity(userData.city || '');
            setProfilePicture(userData.profilePicture || null);
          } else {
            // Hvis brugerens dokument ikke findes, opretter vi det med standardværdier
            await setDoc(userDocRef, {
              name: '',
              city: '',
              isTrainer: false,
              trainerDetails: [],
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data: ', error);
      }
    };

    fetchUserData();
  }, []);

  /**
   * Håndterer valgmuligheder for billedvalg:
   * På iOS vises en ActionSheet med "Tag billede" og "Vælg fra galleri".
   * På Android vises en modal med disse valgmuligheder.
   */
  const handleImagePicker = () => {
    if (Platform.OS === 'ios') {
      // iOS: ActionSheet til valg af billedkilde
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();            // Tag nyt billede med kamera
          } else if (buttonIndex === 2) {
            pickImageFromGallery(); // Vælg eksisterende billede fra galleri
          }
        }
      );
    } else {
      // Android: Åbn modal med valgmuligheder
      setIsModalVisible(true);
    }
  };

  /**
   * Åbn enhedens galleri for at vælge et billede.
   */
  const pickImageFromGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,  // Kun billeder
      allowsEditing: true,                              // Tillad beskæring
      aspect: [1, 1],                                   // Kvadratisk beskæring
      quality: 1,                                       // Høj billedkvalitet
    });

    // Hvis brugeren ikke annullerede, sæt profilbilledet til det valgte billede
    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  /**
   * Start enhedens kamera for at tage et nyt billede.
   */
  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,  // Tillad beskæring
      aspect: [1, 1],       // Kvadratisk beskæring
      quality: 1,           // Høj kvalitet
    });

    // Hvis brugeren ikke annullerede, opdater profilbilledet
    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  /**
   * Oploader billedet til Firebase Storage og returnerer en downloadURL.
   * Viser uploadprogress, så brugeren kan se status.
   */
  const uploadImageToFirebase = async (uri) => {
    setUploading(true);
    setProgress(0);

    try {
      const uploadUri = uri.replace('file://', '');
      const response = await fetch(uploadUri);    // Hent billedet som binært data (blob)
      const blob = await response.blob();         // Konvertér respons til blob

      // Opret en reference til hvor billedet skal gemmes i Storage
      const storageRef = ref(storage, `profilePictures/${getAuth().currentUser.uid}`);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      // Returnér et promise der løses, når upload er færdig
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Beregn fremdrift i procent
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(progress);
          },
          (error) => {
            // Håndtér fejl under upload
            console.error('Upload error: ', error.message);
            setUploading(false);
            reject(error);
          },
          async () => {
            // Når upload er fuldført, hent downloadURL til billedet
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploading(false);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error('Error uploading image:', error.message);
      setUploading(false);
      return null;
    }
  };

  /**
   * addTrainer-funktionen gemmer brugerens trænerinformationer i Firestore.
   * - Oploader eventuelt nyt profilbillede og får en downloadURL
   * - Opdaterer eller opretter et bruger-dokument i Firestore med de indtastede felter
   * - Markerer brugeren som træner (isTrainer: true)
   */
  const addTrainer = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let profilePicURL = '';
        if (profilePicture) {
          // Upload profilbillede til Storage
          profilePicURL = await uploadImageToFirebase(profilePicture);
          if (!profilePicURL) {
            Alert.alert('Error', 'Image upload failed');
            return;
          }
        }

        // Hvis dokumentet allerede findes, opdater det
        // Hvis ikke, opret et nyt med de indtastede data.
        if (userDocSnap.exists()) {
          await updateDoc(userDocRef, {
            isTrainer: true,
            profilePicture: profilePicURL || userDocSnap.data().profilePicture,
            trainerDetails: arrayUnion({
              sport,
              price,
              experience,
              description,
              rating: 0,  // Standard rating for ny træner
            }),
          });
        } else {
          await setDoc(userDocRef, {
            name,
            city,
            isTrainer: true,
            profilePicture: profilePicURL,
            trainerDetails: [
              {
                sport,
                price,
                experience,
                description,
                rating: 0,
              },
            ],
          });
        }

        // Giv brugeren besked om at operationen var vellykket
        Alert.alert('Success', 'You have successfully added yourself as a trainer!');
        navigation.goBack(); // Gå tilbage til forrige skærm
      }
    } catch (error) {
      console.error('Error adding trainer: ', error);
      Alert.alert('Error adding trainer', error.message);
    }
  };

  /**
   * deleteTrainer-funktionen sletter brugerens trænerprofil:
   * - Fjerner profilbillede fra Firebase Storage
   * - Opdaterer Firestore-dokumentet til at isTrainer = false og tømmer trainerDetails
   */
  const deleteTrainer = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        // Hvis der er et profilbillede i dokumentet, slet det fra Storage
        if (userDocSnap.exists() && userDocSnap.data().profilePicture) {
          const profilePicRef = ref(storage, `profilePictures/${user.uid}`);
          await deleteObject(profilePicRef);
        }

        // Opdater Firestore for at slette trænerinformationerne
        await updateDoc(userDocRef, {
          isTrainer: false,
          trainerDetails: [],
          profilePicture: '',
        });

        // Vis en succesbesked til brugeren
        Alert.alert('Success', 'Your trainer profile has been deleted.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error deleting trainer: ', error);
      Alert.alert('Error deleting trainer', error.message);
    }
  };

  return (
    // LinearGradient giver en pæn baggrundsfarvegradient
    <LinearGradient colors={['#005f99', '#33ccff']} style={[styles.container, { minHeight: screenHeight }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          {/* Tilbage-knap der tager brugeren tilbage til forrige skærm */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          {/* Overskrift for skærmen */}
          <Text style={styles.header}>Add Yourself as a Trainer</Text>
        </View>

        {/* Område til profilbillede: Ved tryk åbnes billedvalg */}
        <TouchableOpacity onPress={handleImagePicker} style={styles.profilePictureContainer}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
          ) : (
            // Ikon, hvis intet billede endnu er valgt
            <Ionicons name="camera" size={50} color="#ffffff" />
          )}
        </TouchableOpacity>

        {/* Hvis der uploades et billede, vises en fremdriftsbesked */}
        {uploading && (
          <Text style={styles.uploadProgress}>Upload is {Math.round(progress)}% done</Text>
        )}

        {/* Inputfelter for navn, by, pris, erfaring og beskrivelse */}
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#c7c7cd"
          value={name}
          onChangeText={(text) => setName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="City"
          placeholderTextColor="#c7c7cd"
          value={city}
          onChangeText={(text) => setCity(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Price per hour (e.g., 200 DKK)"
          placeholderTextColor="#c7c7cd"
          value={price}
          onChangeText={(text) => setPrice(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Years of Experience"
          placeholderTextColor="#c7c7cd"
          value={experience}
          onChangeText={(text) => setExperience(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Description (e.g., Your specialties)"
          placeholderTextColor="#c7c7cd"
          value={description}
          onChangeText={(text) => setDescription(text)}
          multiline
          numberOfLines={4}
        />

        {/* Knap til at tilføje bruger som træner */}
        <TouchableOpacity style={styles.button} onPress={addTrainer}>
          <Text style={styles.buttonText}>Add Trainer</Text>
        </TouchableOpacity>

        {/* Knap til at slette trænerprofilen */}
        <TouchableOpacity style={styles.deleteButton} onPress={deleteTrainer}>
          <Text style={styles.deleteButtonText}>Delete Trainer Profile</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal til billedvalg på Android */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Knapper til at tage billede eller vælge fra galleri */}
            <Button title="Take Photo" onPress={() => { setIsModalVisible(false); takePhoto(); }} />
            <Button title="Choose from Gallery" onPress={() => { setIsModalVisible(false); pickImageFromGallery(); }} />
            <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

// Styles til komponenten, herunder layout, farver og størrelser
const styles = StyleSheet.create({
  container: {
    flex: 1, // Fyld hele skærmen
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center', // Centrér indholdet
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row', // Placér elementer vandret
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40, // Ekstra topmargin, så det ikke kolliderer med topbar
  },
  backButton: {
    marginRight: 10, // Afstand mellem tilbageknap og titel
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    flex: 1, // Får titlen til at fylde den resterende plads
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    color: '#333',
    // Skygger og elevation for et mere dynamisk look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  profilePictureContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Let hvid overlay
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60, // Gør billedet rundt
  },
  button: {
    backgroundColor: '#0046a3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    // Let skygge for at give dybde
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#cc0000',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    // Let skygge for at give dybde
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  uploadProgress: {
    marginBottom: 20,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end', // Vis modal i bunden
    backgroundColor: 'rgba(0,0,0,0.5)', // Mørk overlay baggrund
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});

export default AddTrainerScreen;
