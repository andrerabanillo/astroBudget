import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>🚀 AstraFinance</Text>
      <Text style={styles.text}>Your personal financial assistant</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
});
