import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera, CreditCard as Edit } from 'lucide-react-native';

interface ProfileStat {
  label: string;
  value: string;
  icon: any;
  color: string;
}

interface ProfileCardProps {
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  kycStatus: 'pending' | 'approved' | 'rejected';
  getKycStatusColor: () => string;
  getKycStatusText: () => string;
  profileStats: ProfileStat[];
  onEditProfile?: () => void;
  onChangeAvatar?: () => void;
  colors: any;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  kycStatus,
  getKycStatusColor,
  getKycStatusText,
  profileStats,
  onEditProfile,
  onChangeAvatar,
  colors,
}) => {
  return (
    <View style={[styles.userCard, { backgroundColor: colors.card }]}> 
      <View style={styles.userHeader}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}> 
            <Text style={[styles.avatarText, { color: colors.background }]}> 
              {user?.firstName?.charAt(0) || 'J'}{user?.lastName?.charAt(0) || 'D'}
            </Text>
          </View>
          <TouchableOpacity style={[styles.cameraButton, { backgroundColor: colors.background }]} onPress={onChangeAvatar}>
            <Camera size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}> 
            {user?.firstName || 'John'} {user?.lastName || 'Doe'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}> 
            {user?.email || 'john.doe@example.com'}
          </Text>
          <View style={styles.kycBadge}>
            <View style={[styles.kycIndicator, { backgroundColor: getKycStatusColor() }]} />
            <Text style={[styles.kycText, { color: getKycStatusColor() }]}> 
              {getKycStatusText()}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
          <Edit size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <View style={styles.statsContainer}>
        {profileStats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}> 
              <stat.icon size={20} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}> 
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}> 
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  userCard: {
    borderRadius: 20,
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 8,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kycIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  kycText: {
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ProfileCard; 