import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const ProfilePicture = ({ profilePicture }) => {
  return (
    <View style={styles.profilePictureContainer}>
      <Image 
        source={
          profilePicture
            ? { uri: profilePicture }
            : require('../assets/defaultProfile.png')  // Default image if no profile picture
        }
        style={styles.profilePicture}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  profilePictureContainer: {
    width: 50, 
    height: 50,
    borderRadius: 25, 
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
});

export default ProfilePicture;
