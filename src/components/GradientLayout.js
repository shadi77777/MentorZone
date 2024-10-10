import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

const GradientLayout = ({ children }) => {
  return (
    <LinearGradient
      colors={['#0D47A1', '#E3F2FD']}
      style={styles.container}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

export default GradientLayout;
