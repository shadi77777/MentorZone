// components/TrainerCard.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const TrainerCard = ({ trainer, onPress }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: trainer.imageUrl }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{trainer.name || 'Name not available'}</Text>
        <Text style={styles.rating}>⭐ {trainer.rating || 'No rating available'}</Text>
        <Text style={styles.price}>Price: {trainer.price || 'Price not available'}</Text>
        <Text style={styles.description}>{trainer.description || 'No description available'}</Text>
        <Text style={styles.bio}>{trainer.bio || 'No bio available'}</Text>

        {/* Button to interact with the profile */}
        {onPress && (
          <TouchableOpacity style={styles.contactButton} onPress={onPress}>
            <Text style={styles.buttonText}>Contact Trainer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    padding: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },
  infoContainer: {
    paddingHorizontal: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0046a3',
  },
  rating: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  price: {
    fontSize: 16,
    color: '#0046a3',
    marginTop: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  contactButton: {
    backgroundColor: '#0046a3',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TrainerCard;
