import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ProfilePicture = ({ profilePicture }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProfileSetup')}
      style={styles.profilePictureTouchable}
    >
      <View style={styles.profilePictureContainer}>
        <Image
          source={
            profilePicture
              ? { uri: profilePicture }
              : require('../assets/defaultProfile.png')
          }
          style={styles.profilePicture}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  profilePictureTouchable: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  profilePictureContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicture: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
});

export default ProfilePicture;
