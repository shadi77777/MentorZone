import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ActionSheetIOS,
  Modal,
  Button
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker'; // Bibliotek til billedevalg og kameraadgang
import { db, storage } from '../firebase';

/**
 * ProfileSetupScreen giver brugeren mulighed for at:
 * - Vælge et profilbillede (enten fra galleri eller tage et foto)
 * - Indtaste navn og by
 * - Uploade data og billede til Firestore og Storage
 * 
 * Formålet er at hjælpe en ny bruger med at oprette sin profil første gang,
 * eller opdatere den senere.
 */
const ProfileSetupScreen = ({ navigation }) => {
  // Hent den nuværende autentificerede bruger fra Firebase Authentication
  const auth = getAuth();
  const user = auth.currentUser;

  // State-variabler til at gemme brugerens indtastede data og status
  const [name, setName] = useState('');                 // Brugernavn
  const [city, setCity] = useState('');                 // By
  const [profilePicture, setProfilePicture] = useState(null); // URL til valg af profilbillede
  const [uploading, setUploading] = useState(false);     // Om et billede uploades lige nu
  const [progress, setProgress] = useState(0);           // Fremdrift i upload (0-100%)
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal-visning til Android valg

  // useEffect: Anmoder om tilladelse til kamera og mediebibliotek ved første visning
  useEffect(() => {
    (async () => {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus.status !== 'granted' || mediaLibraryStatus.status !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Please enable camera and media library permissions in your settings.'
        );
      }
    })();
  }, []);

  /**
   * pickImageFromGallery: Åbn telefonens galleri for at vælge et billede
   */
  const pickImageFromGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Kun billeder
      allowsEditing: true,
      aspect: [1, 1], // Kvadratisk
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
      console.log('Image selected:', result.assets[0].uri);
    }
  };

  /**
   * takePhoto: Start kamera for at tage et nyt billede
   */
  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1], // Kvadratisk
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
      console.log('Photo taken:', result.assets[0].uri);
    }
  };

  /**
   * handleImagePicker: Præsenterer valgmuligheder for billedvalg.
   * På iOS bruges ActionSheetIOS, på Android en Modal.
   */
  const handleImagePicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImageFromGallery();
          }
        }
      );
    } else {
      setIsModalVisible(true);
    }
  };

  /**
   * uploadImageToFirebase: Upload det valgte billede til Firebase Storage
   * Returnerer en downloadURL ved succes.
   */
  const uploadImageToFirebase = async (uri) => {
    setUploading(true);
    setProgress(0);

    try {
      const uploadUri = uri.replace('file://', '');
      const response = await fetch(uploadUri);
      const blob = await response.blob();

      // Referencen til hvor billedet gemmes i Storage
      const storageRef = ref(storage, `profilePictures/${user.uid}`);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Beregn upload-fremdrift
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(progress);
            console.log(`Upload is ${progress}% done`);
          },
          (error) => {
            console.error('Upload error: ', error.message);
            setUploading(false);
            reject(error);
          },
          async () => {
            // Når upload er fuldført, hent downloadURL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('File available at:', downloadURL);
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
   * handleProfileSave: Gemmer brugerens profil (navn, by, billede) i Firestore.
   * - Tjekker at felter ikke er tomme
   * - Oploader evt. billede hvis valgt
   * - Gemmer data i "users" kollektionen
   * - Navigerer til 'Sport' efter succes
   */
  const handleProfileSave = async () => {
    if (!name || !city) {
      Alert.alert('Incomplete fields', 'Please fill in all fields before saving.');
      return;
    }

    let profilePicURL = '';
    if (profilePicture) {
      profilePicURL = await uploadImageToFirebase(profilePicture);
      if (!profilePicURL) {
        Alert.alert('Error', 'Image upload failed');
        return;
      }
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      const profileData = {
        name,
        city,
        profilePicture: profilePicURL || '',
        isProfileSetup: true, // Markér at profilen er oprettet
      };

      if (userDoc.exists()) {
        // Opdater eksisterende dokument
        await updateDoc(userDocRef, profileData);
      } else {
        // Opret nyt dokument hvis det ikke findes
        await setDoc(userDocRef, profileData);
      }

      Alert.alert('Profile updated successfully!');
      navigation.navigate('Sport');
    } catch (error) {
      console.error('Error updating profile: ', error.message);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Complete Your Profile</Text>

      {/* Profilbilledevalg */}
      <TouchableOpacity onPress={handleImagePicker}>
        <View style={styles.imagePicker}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.profileImage} />
          ) : (
            <Text style={styles.imagePlaceholder}>Select Profile Picture</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Viser upload-fremdriften hvis billede uploades */}
      {uploading && (
        <Text style={styles.uploadProgress}>Upload is {Math.round(progress)}% done</Text>
      )}

      {/* Inputfelter for navn og by */}
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor="#666666"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your city"
        placeholderTextColor="#666666"
        value={city}
        onChangeText={setCity}
      />

      {/* Knap til at gemme profiloplysninger */}
      <TouchableOpacity style={styles.saveButton} onPress={handleProfileSave} disabled={uploading}>
        <Text style={styles.saveButtonText}>{uploading ? 'Saving...' : 'Save Profile'}</Text>
      </TouchableOpacity>

      {/* Modal til Android for valg mellem foto eller galleri */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Button title="Take Photo" onPress={() => { setIsModalVisible(false); takePhoto(); }} />
            <Button title="Choose from Gallery" onPress={() => { setIsModalVisible(false); pickImageFromGallery(); }} />
            <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles til layout og udseende
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', 
    padding: 20,
    backgroundColor: '#E3F2FD',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#0046a3',
  },
  imagePicker: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#0046a3',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  imagePlaceholder: {
    color: '#888',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '80%',
    color: 'black', // Gør teksten sort
  },
  saveButton: {
    backgroundColor: '#0046a3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  uploadProgress: {
    marginBottom: 20,
    color: '#0046a3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end', // Placer modal i bunden af skærmen
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});

export default ProfileSetupScreen;
