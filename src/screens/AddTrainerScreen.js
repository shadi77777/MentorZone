import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ScrollView, Dimensions, Platform, Modal, Button, ActionSheetIOS } from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const AddTrainerScreen = ({ route, navigation }) => {
  const sport = route?.params?.sport || '';
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [experience, setExperience] = useState('');
  const [description, setDescription] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setName(userData.name || '');
            setCity(userData.city || '');
            setProfilePicture(userData.profilePicture || null);
          } else {
            // Hvis dokumentet ikke findes, opret et nyt
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

  const pickImageFromGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const uploadImageToFirebase = async (uri) => {
    setUploading(true);
    setProgress(0);

    try {
      const uploadUri = uri.replace('file://', '');
      const response = await fetch(uploadUri);
      const blob = await response.blob();

      const storageRef = ref(storage, `profilePictures/${getAuth().currentUser.uid}`);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(progress);
          },
          (error) => {
            console.error('Upload error: ', error.message);
            setUploading(false);
            reject(error);
          },
          async () => {
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

  const addTrainer = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let profilePicURL = '';
        if (profilePicture) {
          profilePicURL = await uploadImageToFirebase(profilePicture);
          if (!profilePicURL) {
            Alert.alert('Error', 'Image upload failed');
            return;
          }
        }

        if (userDocSnap.exists()) {
          await updateDoc(userDocRef, {
            isTrainer: true,
            profilePicture: profilePicURL || userDocSnap.data().profilePicture,
            trainerDetails: arrayUnion({
              sport,
              price,
              experience,
              description,
              rating: 0,
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

        Alert.alert('Success', 'You have successfully added yourself as a trainer!');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error adding trainer: ', error);
      Alert.alert('Error adding trainer', error.message);
    }
  };

  return (
    <LinearGradient colors={['#005f99', '#33ccff']} style={[styles.container, { minHeight: screenHeight }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.header}>Add Yourself as a Trainer</Text>
        </View>
        <TouchableOpacity onPress={handleImagePicker} style={styles.profilePictureContainer}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
          ) : (
            <Ionicons name="camera" size={50} color="#ffffff" />
          )}
        </TouchableOpacity>
        {uploading && (
          <Text style={styles.uploadProgress}>Upload is {Math.round(progress)}% done</Text>
        )}
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
        <TouchableOpacity style={styles.button} onPress={addTrainer}>
          <Text style={styles.buttonText}>Add Trainer</Text>
        </TouchableOpacity>
      </ScrollView>

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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  backButton: {
    marginRight: 10,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    flex: 1,
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  button: {
    backgroundColor: '#0046a3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
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
  uploadProgress: {
    marginBottom: 20,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});

export default AddTrainerScreen;