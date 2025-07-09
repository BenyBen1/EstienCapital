import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Minus, Shield, User } from 'lucide-react-native';

interface GroupMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  accountNumber: string;
  role: 'admin' | 'member';
  isAccountManager: boolean;
}

interface GroupAccountMemberFormProps {
  member: GroupMember;
  index: number;
  errors: Record<string, string>;
  onChange: (id: string, field: keyof GroupMember, value: string | boolean) => void;
  onRemove: (id: string) => void;
  onToggleManager: (id: string) => void;
  colors: any;
  canRemove: boolean;
  isJointAccount?: boolean;
}

export default function GroupAccountMemberForm({
  member,
  index,
  errors,
  onChange,
  onRemove,
  onToggleManager,
  colors,
  canRemove,
  isJointAccount = false,
}: GroupAccountMemberFormProps) {
  return (
    <View style={[styles.memberCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.memberHeader}>
        <View style={styles.memberInfo}>
          <Text style={[styles.memberTitle, { color: colors.text }]}>
            {isJointAccount ? `Account Holder ${index + 2}` : `Member ${index + 1}`}
          </Text>
          <Text style={[styles.accountNumber, { color: colors.textSecondary }]}>
            Account: {member.accountNumber}
          </Text>
        </View>
        
        <View style={styles.memberActions}>
          {!isJointAccount && (
            <TouchableOpacity
              style={[
                styles.managerToggle,
                {
                  backgroundColor: member.isAccountManager ? colors.success : colors.surface,
                  borderColor: member.isAccountManager ? colors.success : colors.border,
                },
              ]}
              onPress={() => onToggleManager(member.id)}
            >
              <Shield size={16} color={member.isAccountManager ? colors.background : colors.textSecondary} />
              <Text style={[
                styles.managerText,
                { color: member.isAccountManager ? colors.background : colors.textSecondary }
              ]}>
                {member.isAccountManager ? 'Manager' : 'Member'}
              </Text>
            </TouchableOpacity>
          )}
          
          {canRemove && (
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: colors.error }]}
              onPress={() => onRemove(member.id)}
            >
              <Minus size={16} color={colors.background} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={member.firstName}
            onChangeText={(value) => onChange(member.id, 'firstName', value)}
            placeholder="First name"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="words"
          />
          {errors[`member_${index}_firstName`] && (
            <Text style={[styles.error, { color: colors.error }]}>
              {errors[`member_${index}_firstName`]}
            </Text>
          )}
        </View>

        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={member.lastName}
            onChangeText={(value) => onChange(member.id, 'lastName', value)}
            placeholder="Last name"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="words"
          />
          {errors[`member_${index}_lastName`] && (
            <Text style={[styles.error, { color: colors.error }]}>
              {errors[`member_${index}_lastName`]}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={member.email}
          onChangeText={(value) => onChange(member.id, 'email', value)}
          placeholder="Email address"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors[`member_${index}_email`] && (
          <Text style={[styles.error, { color: colors.error }]}>
            {errors[`member_${index}_email`]}
          </Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={member.phoneNumber}
          onChangeText={(value) => onChange(member.id, 'phoneNumber', value)}
          placeholder="+254 7XX XXX XXX"
          placeholderTextColor={colors.textSecondary}
          keyboardType="phone-pad"
        />
        {errors[`member_${index}_phoneNumber`] && (
          <Text style={[styles.error, { color: colors.error }]}>
            {errors[`member_${index}_phoneNumber`]}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  memberCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  memberInfo: {
    flex: 1,
  },
  memberTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  accountNumber: {
    fontSize: 12,
    marginTop: 2,
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  managerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  managerText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  removeButton: {
    padding: 6,
    borderRadius: 6,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  error: {
    fontSize: 12,
    marginTop: 2,
  },
});
