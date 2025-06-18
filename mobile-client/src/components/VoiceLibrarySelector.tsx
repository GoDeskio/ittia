import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { SyncService } from '../services/SyncService';

interface VoiceLibrary {
  id: string;
  name: string;
  description: string;
  ownerId: string;
}

interface VoiceLibrarySelectorProps {
  selectedLibrary: string | null;
  onSelectLibrary: (libraryId: string | null) => void;
}

export const VoiceLibrarySelector: React.FC<VoiceLibrarySelectorProps> = ({
  selectedLibrary,
  onSelectLibrary,
}) => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [libraries, setLibraries] = useState<VoiceLibrary[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLibraryName, setNewLibraryName] = useState('');
  const [newLibraryDescription, setNewLibraryDescription] = useState('');
  const syncService = SyncService.getInstance();

  useEffect(() => {
    fetchLibraries();
  }, []);

  const fetchLibraries = async () => {
    try {
      const response = await api.get('/voice/libraries');
      setLibraries(response.data);
    } catch (error) {
      console.error('Error fetching voice libraries:', error);
    }
  };

  const handleAddLibrary = async () => {
    if (!newLibraryName.trim()) return;

    try {
      const libraryData = {
        name: newLibraryName,
        description: newLibraryDescription,
      };

      // Queue library creation for sync
      await syncService.queueSync({
        type: 'library',
        action: 'create',
        data: libraryData,
      });

      // Optimistically update UI
      const tempId = Date.now().toString();
      setLibraries(prev => [...prev, { id: tempId, ...libraryData, ownerId: user?.id || '' }]);
      setNewLibraryName('');
      setNewLibraryDescription('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error adding voice library:', error);
    }
  };

  const handleDeleteLibrary = async (libraryId: string) => {
    try {
      // Queue library deletion for sync
      await syncService.queueSync({
        type: 'library',
        action: 'delete',
        data: { id: libraryId },
      });

      // Optimistically update UI
      setLibraries(prev => prev.filter(lib => lib.id !== libraryId));
      if (selectedLibrary === libraryId) {
        onSelectLibrary(null);
      }
    } catch (error) {
      console.error('Error deleting voice library:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    selector: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: currentTheme === 'dark' ? '#2c2c2c' : '#f5f5f5',
      borderRadius: 8,
      padding: 12,
    },
    selectorText: {
      flex: 1,
      color: currentTheme === 'dark' ? '#ffffff' : '#000000',
    },
    addButton: {
      marginLeft: 8,
      padding: 8,
    },
    dialog: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dialogContent: {
      width: '80%',
      backgroundColor: currentTheme === 'dark' ? '#2c2c2c' : '#ffffff',
      borderRadius: 8,
      padding: 16,
    },
    dialogTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme === 'dark' ? '#ffffff' : '#000000',
      marginBottom: 16,
    },
    input: {
      backgroundColor: currentTheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
      borderRadius: 4,
      padding: 8,
      marginBottom: 16,
      color: currentTheme === 'dark' ? '#ffffff' : '#000000',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    button: {
      padding: 8,
      marginLeft: 8,
    },
    buttonText: {
      color: currentTheme === 'dark' ? '#ffffff' : '#000000',
    },
    libraryList: {
      maxHeight: 200,
    },
    libraryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme === 'dark' ? '#333' : '#e0e0e0',
    },
    libraryInfo: {
      flex: 1,
    },
    libraryName: {
      color: currentTheme === 'dark' ? '#ffffff' : '#000000',
      fontWeight: 'bold',
    },
    libraryDescription: {
      color: currentTheme === 'dark' ? '#888' : '#666',
      fontSize: 12,
    },
    deleteButton: {
      padding: 8,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.selector}>
        <Text style={styles.selectorText}>
          {selectedLibrary
            ? libraries.find(lib => lib.id === selectedLibrary)?.name
            : 'Select a voice library'}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsDialogOpen(true)}
        >
          <MaterialIcons
            name="add"
            size={24}
            color={currentTheme === 'dark' ? '#ffffff' : '#000000'}
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isDialogOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDialogOpen(false)}
      >
        <View style={styles.dialog}>
          <View style={styles.dialogContent}>
            <Text style={styles.dialogTitle}>Voice Libraries</Text>

            <ScrollView style={styles.libraryList}>
              {libraries.map(library => (
                <View key={library.id} style={styles.libraryItem}>
                  <View style={styles.libraryInfo}>
                    <Text style={styles.libraryName}>{library.name}</Text>
                    <Text style={styles.libraryDescription}>
                      {library.description}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteLibrary(library.id)}
                  >
                    <MaterialIcons
                      name="delete"
                      size={24}
                      color={currentTheme === 'dark' ? '#ffffff' : '#000000'}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <TextInput
              style={styles.input}
              value={newLibraryName}
              onChangeText={setNewLibraryName}
              placeholder="New library name"
              placeholderTextColor={currentTheme === 'dark' ? '#888' : '#666'}
            />

            <TextInput
              style={styles.input}
              value={newLibraryDescription}
              onChangeText={setNewLibraryDescription}
              placeholder="Description (optional)"
              placeholderTextColor={currentTheme === 'dark' ? '#888' : '#666'}
              multiline
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setIsDialogOpen(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={handleAddLibrary}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}; 