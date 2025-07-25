import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, ArrowLeft, Check, Plus } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import GroupAccountMemberForm from '@/components/profile/GroupAccountMemberForm';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AccountType = 'individual' | 'group';

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

const SignUpScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { register, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'individual' as AccountType,
    groupName: '',
    groupType: 'sacco' as 'joint' | 'sacco' | 'chama' | 'investment_club',
  });

  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [selectedAccountManagers, setSelectedAccountManagers] = useState<string[]>([]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [groupErrors, setGroupErrors] = useState<Record<string, string>>({});

  // Generate unique account number for group members
  const generateAccountNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SA${timestamp}${random}`;
  };

  // Add new group member
  const addGroupMember = () => {
    const newMember: GroupMember = {
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      accountNumber: generateAccountNumber(),
      role: 'member',
      isAccountManager: false,
    };
    setGroupMembers([...groupMembers, newMember]);
  };

  // Remove group member
  const removeGroupMember = (id: string) => {
    setGroupMembers(groupMembers.filter(member => member.id !== id));
    setSelectedAccountManagers(selectedAccountManagers.filter(managerId => managerId !== id));
  };

  // Update group member
  const updateGroupMember = (id: string, field: keyof GroupMember, value: string | boolean) => {
    setGroupMembers(groupMembers.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  // Toggle account manager
  const toggleAccountManager = (id: string) => {
    const isCurrentManager = selectedAccountManagers.includes(id);
    if (isCurrentManager) {
      setSelectedAccountManagers(selectedAccountManagers.filter(managerId => managerId !== id));
      updateGroupMember(id, 'isAccountManager', false);
    } else {
      setSelectedAccountManagers([...selectedAccountManagers, id]);
      updateGroupMember(id, 'isAccountManager', true);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Reset group data when switching account types
      if (field === 'accountType' && value === 'individual') {
        setGroupMembers([]);
        setSelectedAccountManagers([]);
        setGroupErrors({});
      }
      
      // Auto-add one member for joint accounts
      if (field === 'groupType' && value === 'joint' && groupMembers.length === 0) {
        addGroupMember();
      }
      
      return updated;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Group account validation
    if (formData.accountType === 'group') {
      if (!formData.groupName.trim()) {
        newErrors.groupName = 'Group name is required';
      }
      
      // Different minimum requirements based on group type
      let minMembers: number;
      
      if (formData.groupType === 'joint') {
        minMembers = 1;
      } else {
        // For SACCO, Chama, Investment Club - require at least 2 additional members
        minMembers = 2;
      }
      
      if (groupMembers.length < minMembers) {
        if (formData.groupType === 'joint') {
          newErrors.groupMembers = 'Please add the second account holder';
        } else {
          newErrors.groupMembers = `At least ${minMembers} additional members are required for group accounts`;
        }
      }
      
      // Check maximum limits
      if (formData.groupType === 'joint' && groupMembers.length > 1) {
        newErrors.groupMembers = 'Joint accounts can only have 2 people total';
      } else if (formData.groupType !== 'joint' && groupMembers.length > 50) {
        newErrors.groupMembers = 'Maximum 50 members allowed';
      }

      // For non-joint accounts, require at least one account manager
      if (formData.groupType !== 'joint' && selectedAccountManagers.length === 0) {
        newErrors.accountManagers = 'At least one account manager must be selected';
      }
      
      // For groups with 7+ members, require at least 2 account managers
      if (formData.groupType !== 'joint' && (groupMembers.length + 1) >= 7 && selectedAccountManagers.length < 2) {
        newErrors.accountManagers = 'Groups with 7 or more members must have at least 2 account managers';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateGroupMembers = () => {
    const newErrors: Record<string, string> = {};
    
    groupMembers.forEach((member, index) => {
      if (!member.firstName.trim()) {
        newErrors[`member_${index}_firstName`] = 'First name is required';
      }
      if (!member.lastName.trim()) {
        newErrors[`member_${index}_lastName`] = 'Last name is required';
      }
      if (!member.email.trim()) {
        newErrors[`member_${index}_email`] = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
        newErrors[`member_${index}_email`] = 'Please enter a valid email address';
      }
      if (!member.phoneNumber.trim()) {
        newErrors[`member_${index}_phoneNumber`] = 'Phone number is required';
      }
    });

    setGroupErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    if (formData.accountType === 'group' && !validateGroupMembers()) return;

    try {
      const registrationData = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        accountType: formData.accountType,
        groupName: formData.accountType === 'group' ? formData.groupName : undefined,
        groupType: formData.accountType === 'group' ? formData.groupType : undefined,
        groupMembers: formData.accountType === 'group' ? groupMembers : undefined,
      });
      
      console.log('Registration completed:', registrationData);
      
      if (formData.accountType === 'individual') {
        if (registrationData.requiresEmailConfirmation) {
          // Store email for the two-factor screen
          await AsyncStorage.setItem('pending_verification_email', formData.email.trim());
          
          Alert.alert(
            'Check Your Email',
            'We\'ve sent you a verification code via email. Please check your inbox.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/auth/two-factor'),
              },
            ]
          );
        } else {
          // User is already logged in (this won't happen with email confirmation enabled)
          Alert.alert(
            'Account Created',
            'Your account has been created successfully!',
            [
              {
                text: 'Continue',
                onPress: () => router.replace('/(tabs)'),
              },
            ]
          );
        }
      } else {
        // Group account
        Alert.alert(
          'Group Account Created',
          'Your group account has been created successfully. Members will receive email invitations to complete their setup.',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/auth/login'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Creating your account..." overlay />;
  }

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/auth/login');
              }
            }}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Join Estien Capital and start investing
            </Text>

            {/* Account Type Selection */}
            <View style={styles.accountTypeContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Account Type</Text>
              <View style={styles.accountTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.accountTypeButton,
                    {
                      backgroundColor: formData.accountType === 'individual' ? colors.primary : colors.card,
                      borderColor: formData.accountType === 'individual' ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => updateFormData('accountType', 'individual')}
                >
                  <View style={styles.radioContainer}>
                    {formData.accountType === 'individual' && (
                      <Check size={16} color={colors.background} />
                    )}
                  </View>
                  <Text style={[styles.accountTypeText, { color: formData.accountType === 'individual' ? colors.background : colors.text }]}>
                    Individual Account
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.accountTypeButton,
                    {
                      backgroundColor: formData.accountType === 'group' ? colors.primary : colors.card,
                      borderColor: formData.accountType === 'group' ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => updateFormData('accountType', 'group')}
                >
                  <View style={styles.radioContainer}>
                    {formData.accountType === 'group' && (
                      <Check size={16} color={colors.background} />
                    )}
                  </View>
                  <Text style={[styles.accountTypeText, { color: formData.accountType === 'group' ? colors.background : colors.text }]}>
                    Group Account
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Group Type Selection */}
            {formData.accountType === 'group' && (
              <View style={styles.groupTypeContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Group Type</Text>
                <View style={styles.groupTypeButtons}>
                  {[
                    { value: 'joint' as const, label: 'Joint Account (2 people)' },
                    { value: 'sacco' as const, label: 'SACCO' },
                    { value: 'chama' as const, label: 'Chama' },
                    { value: 'investment_club' as const, label: 'Investment Club' },
                  ].map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.groupTypeButton,
                        {
                          backgroundColor: formData.groupType === type.value ? colors.primary : colors.surface,
                          borderColor: formData.groupType === type.value ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => updateFormData('groupType', type.value)}
                    >
                      <Text style={[
                        styles.groupTypeText,
                        { color: formData.groupType === type.value ? colors.background : colors.text }
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Personal Information */}
            <Input
              label="First Name"
              value={formData.firstName}
              onChangeText={(value) => updateFormData('firstName', value)}
              placeholder="Enter your first name"
              error={errors.firstName}
              autoCapitalize="words"
            />

            <Input
              label="Last Name"
              value={formData.lastName}
              onChangeText={(value) => updateFormData('lastName', value)}
              placeholder="Enter your last name"
              error={errors.lastName}
              autoCapitalize="words"
            />

            <Input
              label="Email Address"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="Enter your email address"
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label="Password"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              placeholder="Enter your password"
              error={errors.password}
              secureTextEntry={!showPassword}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color={colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              }
            />

            <Input
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              placeholder="Confirm your password"
              error={errors.confirmPassword}
              secureTextEntry={!showConfirmPassword}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              }
            />

            {/* Group Account Details */}
            {formData.accountType === 'group' && (
              <View style={styles.groupDetailsContainer}>
                <Input
                  label="Group Name"
                  value={formData.groupName}
                  onChangeText={(value) => updateFormData('groupName', value)}
                  placeholder={`Enter ${formData.groupType === 'joint' ? 'joint account' : formData.groupType} name`}
                  error={errors.groupName}
                />

                <View style={styles.groupMembersSection}>
                  <View style={styles.groupMembersHeader}>
                    <Text style={[styles.label, { color: colors.text }]}>
                      {formData.groupType === 'joint' ? 'Second Account Holder' : 'Group Members'}
                    </Text>
                    {/* Only show Add button for joint accounts when no members exist, or for non-joint accounts */}
                    {((formData.groupType === 'joint' && groupMembers.length === 0) || 
                      (formData.groupType !== 'joint')) && (
                      <TouchableOpacity
                        style={[styles.addMemberButton, { backgroundColor: colors.primary }]}
                        onPress={addGroupMember}
                      >
                        <Plus size={16} color={colors.background} />
                        <Text style={[styles.addMemberText, { color: colors.background }]}>
                          {formData.groupType === 'joint' ? 'Add Holder' : 'Add Member'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Account manager requirement info for large groups */}
                  {formData.groupType !== 'joint' && (groupMembers.length + 1) >= 6 && (
                    <View style={[styles.infoContainer, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
                      <Text style={[styles.infoText, { color: colors.text }]}>
                        💡 Groups with 7+ members require at least 2 account managers for enhanced security
                      </Text>
                    </View>
                  )}

                  {groupMembers.map((member, index) => (
                    <GroupAccountMemberForm
                      key={member.id}
                      member={member}
                      index={index}
                      errors={groupErrors}
                      onChange={updateGroupMember}
                      onRemove={removeGroupMember}
                      onToggleManager={toggleAccountManager}
                      colors={colors}
                      canRemove={formData.groupType !== 'joint' || groupMembers.length > 1}
                      isJointAccount={formData.groupType === 'joint'}
                    />
                  ))}

                  {errors.groupMembers && (
                    <Text style={[styles.errorText, { color: colors.error }]}>{errors.groupMembers}</Text>
                  )}
                  {errors.accountManagers && (
                    <Text style={[styles.errorText, { color: colors.error }]}>{errors.accountManagers}</Text>
                  )}
                </View>
              </View>
            )}

            <Button
              title="Create Account"
              onPress={handleSignup}
              disabled={isLoading}
              fullWidth
              style={styles.signupButton}
            />

            <View style={styles.loginLink}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                <Text style={[styles.loginLinkText, { color: colors.primary }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  accountTypeContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  accountTypeButtons: {
    gap: 12,
  },
  accountTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  radioContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountTypeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  groupTypeContainer: {
    marginBottom: 24,
  },
  groupTypeButtons: {
    gap: 8,
  },
  groupTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  groupTypeText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  groupDetailsContainer: {
    marginBottom: 24,
  },
  groupMembersSection: {
    marginTop: 16,
  },
  groupMembersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addMemberText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  infoContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  signupButton: {
    marginTop: 8,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 16,
  },
  loginLinkText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
