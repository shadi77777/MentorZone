import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from '../firebase';

const ProfileSetupScreen = ({ navigation }) => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Function to pick an image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
      console.log('Image selected:', result.assets[0].uri);
    }
  };

  // Function to upload the image to Firebase Storage
  const uploadImageToFirebase = async (uri) => {
    setUploading(true);
    setProgress(0);

    try {
      const uploadUri = uri.replace('file://', '');
      const response = await fetch(uploadUri);
      const blob = await response.blob();

      const storageRef = ref(storage, `profilePictures/${user.uid}`);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
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

  // Save profile details to Firestore
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
      const profileData = {
        name,
        city,
        profilePicture: profilePicURL || '',
      };

      await setDoc(doc(db, 'users', user.uid), profileData);
      Alert.alert('Profile created successfully!');
      navigation.navigate('Sport');
    } catch (error) {
      console.error('Error saving profile: ', error.message);
      Alert.alert('Error', 'Failed to save profile.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Complete Your Profile</Text>

      <TouchableOpacity onPress={pickImage}>
        <View style={styles.imagePicker}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.profileImage} />
          ) : (
            <Text style={styles.imagePlaceholder}>Select Profile Picture</Text>
          )}
        </View>
      </TouchableOpacity>

      {uploading && (
        <Text style={styles.uploadProgress}>Upload is {Math.round(progress)}% done</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your city"
        value={city}
        onChangeText={setCity}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleProfileSave} disabled={uploading}>
        <Text style={styles.saveButtonText}>{uploading ? 'Saving...' : 'Save Profile'}</Text>
      </TouchableOpacity>
    </View>
  );
};

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
});

export default ProfileSetupScreen;
