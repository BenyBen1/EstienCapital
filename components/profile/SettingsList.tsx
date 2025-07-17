import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface SettingsListProps {
  sections: Array<{
    title: string;
    items: any[];
  }>;
  colors: any;
}

interface ProfileOption {
  id: string;
  icon: any;
  title: string;
  subtitle: string;
  onPress?: () => void;
  badge?: boolean;
  badgeColor?: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: () => void;
  customStyle?: any; // Add custom styling support
}

const SettingsList: React.FC<SettingsListProps> = ({ sections, colors }) => {
  return (
    <>
      {sections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}> {section.title} </Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.card }]}> 
            {section.items.map((item, itemIndex) => {
              const option = item as ProfileOption;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.settingItem,
                    itemIndex < section.items.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                    option.customStyle, // Apply custom styling
                  ]}
                  onPress={option.onPress}
                  disabled={option.hasSwitch}
                >
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: colors.surface }]}> 
                      <option.icon size={20} color={colors.text} />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={[styles.settingTitle, { color: colors.text }]}> 
                        {option.title}
                      </Text>
                      <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}> 
                        {option.subtitle}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.settingRight}>
                    {option.badge && (
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: (option.badgeColor || colors.primary) + '20' },
                        ]}
                      >
                        <Text style={[styles.badgeText, { color: option.badgeColor || colors.primary }]}>●</Text>
                      </View>
                    )}
                    {option.hasSwitch ? (
                      <Switch
                        value={option.switchValue ?? false}
                        onValueChange={option.onSwitchChange}
                        disabled={option.hasSwitch ?? false}
                        trackColor={{
                          false: colors.border,
                          true: colors.primary + '40',
                        }}
                        thumbColor={option.switchValue ? colors.primary : colors.textSecondary}
                      />
                    ) : (
                      <ChevronRight size={20} color={colors.textSecondary} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default SettingsList; 