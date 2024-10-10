import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const FormInput = ({ placeholder, value, onChangeText, secureTextEntry = false }) => {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#c7c7cd"
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 55,
    borderColor: '#B0BEC5',
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 15,
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    color: '#37474F',
  },
});

export default FormInput;
