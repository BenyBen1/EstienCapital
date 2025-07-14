import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, Alert } from 'react-native';

export default function SecuritySettingsScreen() {
  // Password reset state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const handlePasswordReset = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    setLoading(true);
    // TODO: Call backend API for password reset
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Password updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1000);
  };

  const handle2FAToggle = () => {
    // TODO: Call backend API to enable/disable 2FA
    setIs2FAEnabled((prev) => !prev);
    Alert.alert('2FA', is2FAEnabled ? '2FA Disabled' : '2FA Enabled');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Security Settings</Text>

      {/* Password Reset Section */}
      <Text style={styles.sectionTitle}>Change Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Current Password"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handlePasswordReset} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update Password'}</Text>
      </TouchableOpacity>

      {/* 2FA Section */}
      <Text style={styles.sectionTitle}>Two-Factor Authentication (2FA)</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Enable 2FA</Text>
        <Switch value={is2FAEnabled} onValueChange={handle2FAToggle} />
      </View>
      {is2FAEnabled && (
        <View style={styles.qrContainer}>
          {/* TODO: Show QR code and verification input here */}
          <Text style={styles.qrPlaceholder}>[QR Code Placeholder]</Text>
          <TextInput style={styles.input} placeholder="Enter 2FA Code" keyboardType="numeric" />
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Verify 2FA</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
  },
  qrContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  qrPlaceholder: {
    fontSize: 16,
    color: '#888',
    marginBottom: 12,
  },
});
