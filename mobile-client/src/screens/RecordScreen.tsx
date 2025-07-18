import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Platform, ScrollView, Alert} from 'react-native';
import {Text, Button, IconButton, Card, Chip, ProgressBar, Menu, Divider} from 'react-native-paper';
import Sound from 'react-native-sound';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import ElevenLabsService, { Voice, AudioMetadata } from '../services/ElevenLabsService';
import * as Location from 'expo-location';

const RecordScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [audioMetadata, setAudioMetadata] = useState<AudioMetadata | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  
  const audioRecorderPlayer = new AudioRecorderPlayer();

  useEffect(() => {
    checkPermission();
    loadVoices();
    getCurrentLocation();
  }, []);

  const loadVoices = async () => {
    try {
      const voiceList = await ElevenLabsService.getVoices();
      setVoices(voiceList);
      if (voiceList.length > 0) {
        setSelectedVoice(voiceList[0]);
      }
    } catch (error) {
      console.error('Error loading voices:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await ElevenLabsService.getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const checkPermission = async () => {
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.MICROPHONE,
      android: PERMISSIONS.ANDROID.RECORD_AUDIO,
    });

    if (permission) {
      const result = await check(permission);
      if (result === RESULTS.GRANTED) {
        setHasPermission(true);
      } else {
        const requestResult = await request(permission);
        setHasPermission(requestResult === RESULTS.GRANTED);
      }
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      checkPermission();
      return;
    }

    try {
      const path = `${audioRecorderPlayer.mmssss(Date.now())}.wav`;
      const result = await audioRecorderPlayer.startRecorder(path);
      setRecordingUri(result);
      setIsRecording(true);
      
      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Store timer reference for cleanup
      (audioRecorderPlayer as any).timer = timer;
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      setIsRecording(false);
      
      // Clear timer
      if ((audioRecorderPlayer as any).timer) {
        clearInterval((audioRecorderPlayer as any).timer);
      }
      
      if (result) {
        setRecordingUri(result);
        await processRecording(result);
      }
      
      setRecordingTime(0);
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const processRecording = async (uri: string) => {
    setIsProcessing(true);
    try {
      const result = await ElevenLabsService.processAudioWithMetadata(uri, currentLocation);
      setAudioMetadata(result.metadata);
    } catch (error) {
      console.error('Error processing recording:', error);
      Alert.alert('Error', 'Failed to process recording');
    } finally {
      setIsProcessing(false);
    }
  };

  const convertSpeechToSpeech = async () => {
    if (!recordingUri || !selectedVoice) {
      Alert.alert('Error', 'No recording or voice selected');
      return;
    }

    setIsProcessing(true);
    try {
      const convertedUri = await ElevenLabsService.speechToSpeech(recordingUri, selectedVoice.voice_id);
      
      // Play converted audio
      const sound = new Sound(convertedUri, '', (error) => {
        if (error) {
          console.error('Error loading converted audio:', error);
          return;
        }
        sound.play();
      });
    } catch (error) {
      console.error('Error converting speech:', error);
      Alert.alert('Error', 'Failed to convert speech');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderEmotionChips = () => {
    if (!audioMetadata?.words) return null;

    const emotionColors: { [key: string]: string } = {
      joy: '#4caf50',
      sadness: '#2196f3',
      anger: '#f44336',
      fear: '#9c27b0',
      surprise: '#ff9800',
      disgust: '#795548',
    };

    return (
      <View style={styles.emotionContainer}>
        <Text variant="titleMedium" style={styles.emotionTitle}>
          Word-Level Emotions
        </Text>
        <View style={styles.chipContainer}>
          {audioMetadata.words.map((wordData, index) => {
            const dominantEmotion = Object.entries(wordData.emotion.emotions)
              .reduce((a, b) => a[1] > b[1] ? a : b)[0];
            
            return (
              <Chip
                key={index}
                style={[
                  styles.emotionChip,
                  { backgroundColor: emotionColors[dominantEmotion] || '#gray' }
                ]}
                textStyle={styles.chipText}
              >
                {`${wordData.word} (${dominantEmotion})`}
              </Chip>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        AI Voice Recorder
      </Text>

      {/* Voice Selection */}
      {voices.length > 0 && (
        <Card style={styles.voiceCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Voice Conversion
            </Text>
            <Menu
              visible={showVoiceMenu}
              onDismiss={() => setShowVoiceMenu(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setShowVoiceMenu(true)}
                  style={styles.voiceButton}
                >
                  {selectedVoice ? `${selectedVoice.name} (${selectedVoice.category})` : 'Select Voice'}
                </Button>
              }
            >
              {voices.map((voice) => (
                <Menu.Item
                  key={voice.voice_id}
                  onPress={() => {
                    setSelectedVoice(voice);
                    setShowVoiceMenu(false);
                  }}
                  title={`${voice.name} (${voice.category})`}
                />
              ))}
            </Menu>
          </Card.Content>
        </Card>
      )}

      {/* Recording Interface */}
      <View style={styles.recordingContainer}>
        <Text variant="displayLarge" style={styles.timer}>
          {formatTime(recordingTime)}
        </Text>

        {isRecording && (
          <Text variant="bodyMedium" style={styles.recordingStatus}>
            🔴 Recording...
          </Text>
        )}

        <View style={styles.controls}>
          {!isRecording ? (
            <IconButton
              icon="microphone"
              mode="contained"
              size={50}
              onPress={startRecording}
              style={styles.recordButton}
              disabled={isProcessing}
            />
          ) : (
            <IconButton
              icon="stop"
              mode="contained"
              size={50}
              onPress={stopRecording}
              style={[styles.recordButton, styles.stopButton]}
            />
          )}
        </View>

        {/* Convert Button */}
        {recordingUri && selectedVoice && !isRecording && (
          <Button
            mode="contained"
            onPress={convertSpeechToSpeech}
            disabled={isProcessing}
            style={styles.convertButton}
            icon="voice-over-off"
          >
            Convert with AI Voice
          </Button>
        )}
      </View>

      {/* Processing Indicator */}
      {isProcessing && (
        <Card style={styles.processingCard}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.processingText}>
              Processing with AI analysis...
            </Text>
            <ProgressBar indeterminate style={styles.progressBar} />
          </Card.Content>
        </Card>
      )}

      {/* Location Info */}
      {currentLocation && (
        <Text variant="bodySmall" style={styles.locationText}>
          📍 Location tracking enabled for metadata
        </Text>
      )}

      {/* Metadata Display */}
      {audioMetadata && (
        <Card style={styles.metadataCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Recording Analysis
            </Text>
            <Divider style={styles.divider} />
            
            <View style={styles.metadataRow}>
              <Text variant="bodyMedium">
                <Text style={styles.metadataLabel}>Duration:</Text> {audioMetadata.duration.toFixed(2)}s
              </Text>
            </View>
            
            <View style={styles.metadataRow}>
              <Text variant="bodyMedium">
                <Text style={styles.metadataLabel}>Sample Rate:</Text> {audioMetadata.sampleRate}Hz
              </Text>
            </View>
            
            <View style={styles.metadataRow}>
              <Text variant="bodyMedium">
                <Text style={styles.metadataLabel}>Channels:</Text> {audioMetadata.channels}
              </Text>
            </View>
            
            <View style={styles.metadataRow}>
              <Text variant="bodyMedium">
                <Text style={styles.metadataLabel}>Overall Sentiment:</Text> {audioMetadata.overallEmotion?.score || 'N/A'}
              </Text>
            </View>
            
            <View style={styles.metadataRow}>
              <Text variant="bodyMedium">
                <Text style={styles.metadataLabel}>Words Detected:</Text> {audioMetadata.words.length}
              </Text>
            </View>
            
            {audioMetadata.recordingLocation && (
              <View style={styles.metadataRow}>
                <Text variant="bodyMedium">
                  <Text style={styles.metadataLabel}>Location:</Text> {audioMetadata.recordingLocation.city || 'Unknown'}
                </Text>
              </View>
            )}
            
            {renderEmotionChips()}
          </Card.Content>
        </Card>
      )}

      {/* Permissions Warning */}
      {!hasPermission && (
        <Card style={styles.warningCard}>
          <Card.Content>
            <Text style={styles.permissionText}>
              Microphone permission is required to record audio
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Instructions */}
      {!isRecording && !isProcessing && (
        <Text variant="bodyMedium" style={styles.instructions}>
          Record your voice and optionally convert it using AI voice cloning technology. 
          Metadata including emotions, location, and timestamps will be automatically extracted.
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    textAlign: 'center',
    marginVertical: 24,
    fontWeight: 'bold',
  },
  voiceCard: {
    marginBottom: 16,
    elevation: 4,
  },
  cardTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  voiceButton: {
    marginTop: 8,
  },
  recordingContainer: {
    alignItems: 'center',
    marginVertical: 32,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 4,
  },
  timer: {
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  recordingStatus: {
    marginBottom: 24,
    color: '#F44336',
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordButton: {
    backgroundColor: '#2196F3',
    margin: 8,
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  convertButton: {
    marginTop: 16,
    backgroundColor: '#9C27B0',
  },
  processingCard: {
    marginVertical: 16,
    elevation: 4,
  },
  processingText: {
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
  },
  locationText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 8,
  },
  metadataCard: {
    marginVertical: 16,
    elevation: 4,
  },
  divider: {
    marginVertical: 12,
  },
  metadataRow: {
    marginVertical: 4,
  },
  metadataLabel: {
    fontWeight: 'bold',
  },
  emotionContainer: {
    marginTop: 16,
  },
  emotionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionChip: {
    margin: 2,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  warningCard: {
    marginVertical: 16,
    backgroundColor: '#FFEBEE',
    elevation: 4,
  },
  permissionText: {
    textAlign: 'center',
    color: '#F44336',
    fontWeight: 'bold',
  },
  instructions: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 16,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
});

export default RecordScreen; 