import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';

export default function PaymentMethodCard({
  method,
  selected,
  onSelect,
  colors,
}: {
  method: {
    id: string;
    name: string;
    details: string;
    isDefault: boolean;
    icon: string;
  };
  selected: boolean;
  onSelect: () => void;
  colors: any;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: selected ? colors.primary + '20' : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
      onPress={onSelect}
    >
      <View style={styles.left}>
        <Image source={{ uri: method.icon }} style={styles.icon} />
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]}>{method.name}</Text>
          <Text style={[styles.details, { color: colors.textSecondary }]}>{method.details}</Text>
          {method.isDefault && (
            <Text style={[styles.defaultLabel, { color: colors.primary }]}>Default</Text>
          )}
        </View>
      </View>
      <View
        style={[
          styles.radioButton,
          {
            borderColor: selected ? colors.primary : colors.border,
            backgroundColor: selected ? colors.primary : 'transparent',
          },
        ]}
      >
        {selected && <View style={[styles.radioButtonInner, { backgroundColor: colors.background }]} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  details: {
    fontSize: 14,
    marginBottom: 2,
  },
  defaultLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
