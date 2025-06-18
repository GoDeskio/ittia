import React, {useState} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {
  Text,
  List,
  Switch,
  Divider,
  Button,
  Dialog,
  Portal,
} from 'react-native-paper';
import ReactNativeBiometrics from 'react-native-biometrics';

const SettingsScreen = () => {
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const rnBiometrics = new ReactNativeBiometrics();

  const toggleBiometrics = async () => {
    try {
      const {available, biometryType} = await rnBiometrics.isSensorAvailable();
      if (available) {
        setBiometricsEnabled(!biometricsEnabled);
      }
    } catch (error) {
      console.error('Biometrics error:', error);
    }
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    setShowLogoutDialog(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Settings
      </Text>

      <List.Section>
        <List.Subheader>Security</List.Subheader>
        <List.Item
          title="Biometric Authentication"
          description="Use fingerprint or face ID to unlock the app"
          left={props => <List.Icon {...props} icon="fingerprint" />}
          right={() => (
            <Switch value={biometricsEnabled} onValueChange={toggleBiometrics} />
          )}
        />
        <Divider />
      </List.Section>

      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Dark Mode"
          description="Enable dark theme"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch value={darkMode} onValueChange={setDarkMode} />
          )}
        />
        <Divider />
      </List.Section>

      <List.Section>
        <List.Subheader>Notifications</List.Subheader>
        <List.Item
          title="Push Notifications"
          description="Receive notifications for new features and updates"
          left={props => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          )}
        />
        <Divider />
      </List.Section>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => setShowLogoutDialog(true)}
          style={styles.logoutButton}>
          Logout
        </Button>
      </View>

      <Portal>
        <Dialog
          visible={showLogoutDialog}
          onDismiss={() => setShowLogoutDialog(false)}>
          <Dialog.Title>Logout</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to logout?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLogoutDialog(false)}>Cancel</Button>
            <Button onPress={handleLogout}>Logout</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  title: {
    textAlign: 'center',
    marginVertical: 24,
  },
  buttonContainer: {
    padding: 16,
  },
  logoutButton: {
    borderColor: '#F44336',
  },
});

export default SettingsScreen; 