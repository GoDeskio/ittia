import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {Text, Button, IconButton} from 'react-native-paper';
import Sound from 'react-native-sound';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';

const RecordScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

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

  const startRecording = () => {
    if (!hasPermission) {
      checkPermission();
      return;
    }
    setIsRecording(true);
    // TODO: Implement actual recording logic
  };

  const stopRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
    // TODO: Implement stop recording logic
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Voice Recorder
      </Text>

      <View style={styles.recordingContainer}>
        <Text variant="displayLarge" style={styles.timer}>
          {formatTime(recordingTime)}
        </Text>

        <View style={styles.controls}>
          {!isRecording ? (
            <IconButton
              icon="microphone"
              mode="contained"
              size={40}
              onPress={startRecording}
              style={styles.recordButton}
            />
          ) : (
            <IconButton
              icon="stop"
              mode="contained"
              size={40}
              onPress={stopRecording}
              style={[styles.recordButton, styles.stopButton]}
            />
          )}
        </View>
      </View>

      {!hasPermission && (
        <Text style={styles.permissionText}>
          Microphone permission is required to record audio
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    textAlign: 'center',
    marginVertical: 24,
  },
  recordingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    marginBottom: 32,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: '#2196F3',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  permissionText: {
    textAlign: 'center',
    color: '#F44336',
    marginTop: 16,
  },
});

export default RecordScreen; 