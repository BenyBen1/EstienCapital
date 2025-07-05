import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface JointAccountHolderFormProps {
  prefix: string;
  values: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  errors: Partial<Record<keyof JointAccountHolderFormProps['values'], string>>;
  onChange: (field: keyof JointAccountHolderFormProps['values'], value: string) => void;
  colors: any;
}

export default function JointAccountHolderForm({ prefix, values, errors, onChange, colors }: JointAccountHolderFormProps) {
  return (
    <View style={styles.formSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{prefix} Account Holder</Text>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          value={values.firstName}
          onChangeText={v => onChange('firstName', v)}
          placeholder="First name"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="words"
        />
        {!!errors.firstName && <Text style={[styles.error, { color: colors.error }]}>{errors.firstName}</Text>}
      </View>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          value={values.lastName}
          onChangeText={v => onChange('lastName', v)}
          placeholder="Last name"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="words"
        />
        {!!errors.lastName && <Text style={[styles.error, { color: colors.error }]}>{errors.lastName}</Text>}
      </View>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          value={values.email}
          onChangeText={v => onChange('email', v)}
          placeholder="Email address"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        {!!errors.email && <Text style={[styles.error, { color: colors.error }]}>{errors.email}</Text>}
      </View>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          value={values.password}
          onChangeText={v => onChange('password', v)}
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          autoComplete="new-password"
        />
        {!!errors.password && <Text style={[styles.error, { color: colors.error }]}>{errors.password}</Text>}
      </View>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          value={values.confirmPassword}
          onChangeText={v => onChange('confirmPassword', v)}
          placeholder="Confirm password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          autoComplete="new-password"
        />
        {!!errors.confirmPassword && <Text style={[styles.error, { color: colors.error }]}>{errors.confirmPassword}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  error: {
    fontSize: 13,
    marginTop: 2,
  },
});
