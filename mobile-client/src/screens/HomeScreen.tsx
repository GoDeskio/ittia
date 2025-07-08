import React, { useState } from 'react';
import {
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Animated,
  Dimensions,
} from 'react-native';
import {Text, Card, Button, Avatar, Surface} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import { colors, neumorphicStyles } from '../theme/shared';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const [isRecording, setIsRecording] = useState(false);
  const recordingAnimation = new Animated.Value(1);

  const handleRecordPress = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnimation, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop animation
      recordingAnimation.stopAnimation();
      recordingAnimation.setValue(1);
    }
  };

  const StatCard = ({ icon, value, label, color }) => (
    <Surface style={[styles.statCard, neumorphicStyles.card]}>
      <View style={styles.statContent}>
        <Avatar.Icon 
          size={50} 
          icon={icon} 
          style={[styles.statIcon, { backgroundColor: color }]}
        />
        <Text variant="headlineMedium" style={styles.statValue}>
          {value}
        </Text>
        <Text variant="bodySmall" style={styles.statLabel}>
          {label}
        </Text>
      </View>
    </Surface>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.welcomeTitle}>
          Welcome back! 👋
        </Text>
        <Text variant="bodyLarge" style={styles.welcomeSubtitle}>
          Ready to capture your voice and build your digital presence?
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard 
          icon="microphone" 
          value="47" 
          label="Total Recordings" 
          color={colors.primary}
        />
        <StatCard 
          icon="clock-outline" 
          value="2h 34m" 
          label="Total Duration" 
          color={colors.success}
        />
        <StatCard 
          icon="trending-up" 
          value="12,847" 
          label="Words Processed" 
          color={colors.warning}
        />
        <StatCard 
          icon="database" 
          value="68%" 
          label="Storage Used" 
          color="#9C27B0"
        />
      </View>

      {/* Voice Recording Studio */}
      <Surface style={[styles.recordingStudio, neumorphicStyles.card]}>
        <Text variant="headlineSmall" style={styles.studioTitle}>
          🎙️ Voice Recording Studio
        </Text>
        
        <View style={styles.recordingSection}>
          <Animated.View 
            style={[
              styles.recordButton, 
              { 
                transform: [{ scale: recordingAnimation }],
                backgroundColor: isRecording ? '#ff6b6b' : colors.primary,
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.recordButtonInner}
              onPress={handleRecordPress}
            >
              <Avatar.Icon 
                size={60} 
                icon={isRecording ? "stop" : "microphone"} 
                style={styles.recordIcon}
              />
            </TouchableOpacity>
          </Animated.View>
          
          <Text variant="titleMedium" style={styles.recordText}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Text>
          
          <Text variant="bodyMedium" style={styles.recordDescription}>
            Click to start recording your voice. The recording will be automatically saved and processed.
          </Text>
        </View>
      </Surface>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Surface style={[styles.actionCard, neumorphicStyles.card]}>
          <Avatar.Icon 
            size={40} 
            icon="database" 
            style={[styles.actionIcon, { backgroundColor: colors.info }]}
          />
          <Text variant="titleMedium" style={styles.actionTitle}>
            Raw Audio Cache
          </Text>
          <Text variant="bodySmall" style={styles.actionDescription}>
            Manage your recorded audio files
          </Text>
          <Button
            mode="contained"
            style={[styles.actionButton, neumorphicStyles.button]}
            onPress={() => navigation.navigate('Documents')}
          >
            View Cache
          </Button>
        </Surface>

        <Surface style={[styles.actionCard, neumorphicStyles.card]}>
          <Avatar.Icon 
            size={40} 
            icon="book-open-variant" 
            style={[styles.actionIcon, { backgroundColor: colors.success }]}
          />
          <Text variant="titleMedium" style={styles.actionTitle}>
            Word Library
          </Text>
          <Text variant="bodySmall" style={styles.actionDescription}>
            Browse your processed voice words
          </Text>
          <Button
            mode="contained"
            style={[styles.actionButton, neumorphicStyles.button]}
            onPress={() => navigation.navigate('Documents')}
          >
            Browse Library
          </Button>
        </Surface>
      </View>

      {/* Recent Activity */}
      <Surface style={[styles.activityCard, neumorphicStyles.card]}>
        <Text variant="headlineSmall" style={styles.activityTitle}>
          📊 Recent Activity
        </Text>
        
        <View style={styles.activityList}>
          {[
            { action: 'Voice recording completed', time: '2 minutes ago', icon: 'microphone', color: colors.primary },
            { action: 'Word library updated', time: '15 minutes ago', icon: 'trending-up', color: colors.success },
            { action: 'New acquaintance added', time: '1 hour ago', icon: 'account-plus', color: colors.warning },
            { action: 'Settings updated', time: '3 hours ago', icon: 'cog', color: '#9C27B0' },
          ].map((item, index) => (
            <View key={index} style={styles.activityItem}>
              <Avatar.Icon 
                size={32} 
                icon={item.icon} 
                style={[styles.activityIcon, { backgroundColor: item.color }]}
              />
              <View style={styles.activityContent}>
                <Text variant="bodyMedium" style={styles.activityAction}>
                  {item.action}
                </Text>
                <Text variant="bodySmall" style={styles.activityTime}>
                  {item.time}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header styles
  header: {
    padding: 24,
    paddingTop: 40,
  },
  welcomeTitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    color: colors.disabled,
    textAlign: 'center',
    fontWeight: '400',
  },
  
  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: (width - 48) / 2,
    marginBottom: 16,
    minHeight: 120,
  },
  statContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  statIcon: {
    marginBottom: 12,
  },
  statValue: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: colors.disabled,
    textAlign: 'center',
  },
  
  // Recording studio
  recordingStudio: {
    marginHorizontal: 16,
    marginBottom: 24,
    minHeight: 300,
  },
  studioTitle: {
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
  },
  recordingSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.neumorphic.shadowDark,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    marginBottom: 24,
  },
  recordButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
  recordIcon: {
    backgroundColor: 'transparent',
  },
  recordText: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 16,
  },
  recordDescription: {
    color: colors.disabled,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 20,
  },
  
  // Quick actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    width: (width - 48) / 2,
    padding: 20,
    alignItems: 'center',
  },
  actionIcon: {
    marginBottom: 12,
  },
  actionTitle: {
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  actionDescription: {
    color: colors.disabled,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 16,
  },
  actionButton: {
    marginTop: 8,
  },
  
  // Activity section
  activityCard: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  activityTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 20,
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityIcon: {
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    color: colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityTime: {
    color: colors.disabled,
  },
});

export default HomeScreen; 