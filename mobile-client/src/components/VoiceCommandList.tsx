import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const commands = [
  {
    command: 'Open Settings',
    description: 'Navigate to the settings screen',
  },
  {
    command: 'Start Recording',
    description: 'Begin voice recording',
  },
  {
    command: 'Stop Recording',
    description: 'End voice recording',
  },
  {
    command: 'Save Voice',
    description: 'Save the current voice recording',
  },
  {
    command: 'Delete Last',
    description: 'Delete the last recorded voice clip',
  },
];

export const VoiceCommandList: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Commands</Text>
      <ScrollView style={styles.scrollView}>
        {commands.map((cmd, index) => (
          <View key={index} style={styles.commandItem}>
            <Text style={styles.commandText}>{cmd.command}</Text>
            <Text style={styles.descriptionText}>{cmd.description}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scrollView: {
    maxHeight: 200,
  },
  commandItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commandText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
}); 