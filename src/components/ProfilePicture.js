import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

/**
 * ProfilePicture-komponenten viser brugerens profilbillede i topBar. 
 * Hvis der ikke er et profilbillede, vises et standardbillede.
 * Ved tryk navigeres brugeren til ProfileSetup-siden, hvor de kan opdatere deres profil.
 *
 * Props:
 * - profilePicture: URL-string til profilbillede (valgfrit)
 */
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
    // Ingen absolution positioning her, 
    // topBar-komponenten håndterer placering og styling
  },
  profilePictureContainer: {
    width: 60, 
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  profilePicture: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
});

export default ProfilePicture;
