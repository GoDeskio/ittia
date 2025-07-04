import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { GroqService } from '../services/GroqService';
import { VoiceLibrarySelector } from './VoiceLibrarySelector';
import { convertAudioToText, audioBlobToBase64, calculateVolumeLevel } from '../utils/audioUtils';
import { SyncService } from '../services/SyncService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface VoiceAnalysis {
  emotion: string;
  tone: string;
  clarity: number;
  confidence: number;
}

export const VirtualAssistant: React.FC = () => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);
  const [selectedLibrary, setSelectedLibrary] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const syncService = SyncService.getInstance();

  useEffect(() => {
    requestPermissions();
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'VoiceVault needs access to your microphone to record voice.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Microphone permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) return;

      const audioBlob = await fetch(uri).then(r => r.blob());
      const base64Audio = await audioBlobToBase64(audioBlob);
      
      // Process voice input
      const transcribedText = await convertAudioToText(audioBlob);
      if (transcribedText) {
        handleVoiceInput(transcribedText, base64Audio);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    } finally {
      setRecording(null);
    }
  };

  const handleVoiceInput = async (text: string, audioData: string) => {
    setIsProcessing(true);
    try {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Get voice analysis
      const analysis = await GroqService.analyzeVoice(audioData);
      setVoiceAnalysis(analysis);

      // Get AI response
      const response = await GroqService.processVoiceInput(text, {
        userId: user?.id,
        libraryId: selectedLibrary,
        voiceAnalysis: analysis,
      });

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Queue voice recording for sync
      if (selectedLibrary) {
        const recordingData = {
          libraryId: selectedLibrary,
          text,
          audioData,
          analysis,
          localUri: recording?.getURI(),
          metadata: {
            emotion: analysis.emotion,
            tone: analysis.tone,
            clarity: analysis.clarity,
            confidence: analysis.confidence,
            timestamp: new Date().toISOString(),
          },
        };

        await syncService.queueSync({
          type: 'voice',
          action: 'create',
          data: recordingData,
        });
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextInput = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    try {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      setInputText('');

      // Get AI response
      const response = await GroqService.processVoiceInput(inputText, {
        userId: user?.id,
        libraryId: selectedLibrary,
      });

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing text input:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme === 'dark' ? '#1a1a1a' : '#ffffff',
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme === 'dark' ? '#333' : '#e0e0e0',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme === 'dark' ? '#ffffff' : '#000000',
    },
    content: {
      flex: 1,
      padding: 16,
    },
    messagesContainer: {
      flex: 1,
    },
    message: {
      padding: 12,
      marginVertical: 4,
      borderRadius: 8,
      maxWidth: '80%',
    },
    userMessage: {
      backgroundColor: currentTheme === 'dark' ? '#2c2c2c' : '#e3f2fd',
      alignSelf: 'flex-end',
    },
    assistantMessage: {
      backgroundColor: currentTheme === 'dark' ? '#333' : '#f5f5f5',
      alignSelf: 'flex-start',
    },
    messageText: {
      color: currentTheme === 'dark' ? '#ffffff' : '#000000',
    },
    timestamp: {
      fontSize: 12,
      color: currentTheme === 'dark' ? '#888' : '#666',
      marginTop: 4,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: currentTheme === 'dark' ? '#333' : '#e0e0e0',
    },
    textInput: {
      flex: 1,
      backgroundColor: currentTheme === 'dark' ? '#2c2c2c' : '#f5f5f5',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 8,
      color: currentTheme === 'dark' ? '#ffffff' : '#000000',
    },
    button: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: currentTheme === 'dark' ? '#2c2c2c' : '#e3f2fd',
      justifyContent: 'center',
      alignItems: 'center',
    },
    voiceAnalysis: {
      padding: 16,
      backgroundColor: currentTheme === 'dark' ? '#2c2c2c' : '#f5f5f5',
      borderRadius: 8,
      marginTop: 8,
    },
    analysisTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: currentTheme === 'dark' ? '#ffffff' : '#000000',
      marginBottom: 8,
    },
    analysisItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    analysisLabel: {
      color: currentTheme === 'dark' ? '#ffffff' : '#000000',
    },
    analysisValue: {
      color: currentTheme === 'dark' ? '#888' : '#666',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Virtual Assistant</Text>
      </View>

      <View style={styles.content}>
        <VoiceLibrarySelector
          selectedLibrary={selectedLibrary}
          onSelectLibrary={setSelectedLibrary}
        />

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.message,
                message.sender === 'user' ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
              <Text style={styles.timestamp}>
                {message.timestamp.toLocaleTimeString()}
              </Text>
            </View>
          ))}

          {voiceAnalysis && (
            <View style={styles.voiceAnalysis}>
              <Text style={styles.analysisTitle}>Voice Analysis</Text>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Emotion:</Text>
                <Text style={styles.analysisValue}>{voiceAnalysis.emotion}</Text>
              </View>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Tone:</Text>
                <Text style={styles.analysisValue}>{voiceAnalysis.tone}</Text>
              </View>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Clarity:</Text>
                <Text style={styles.analysisValue}>{voiceAnalysis.clarity}%</Text>
              </View>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Confidence:</Text>
                <Text style={styles.analysisValue}>{voiceAnalysis.confidence}%</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor={currentTheme === 'dark' ? '#888' : '#666'}
            onSubmitEditing={handleTextInput}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={recording ? stopRecording : startRecording}
            disabled={isProcessing}
          >
            <MaterialIcons
              name={recording ? 'stop' : 'mic'}
              size={24}
              color={currentTheme === 'dark' ? '#ffffff' : '#000000'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}; 