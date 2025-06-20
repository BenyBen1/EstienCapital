import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { X, Copy, CircleCheck as CheckCircle } from 'lucide-react-native';

export default function DepositInstructionsModal({
  visible,
  onClose,
  amount,
  bankDetails,
  copiedField,
  onCopy,
  onConfirm,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  amount: string;
  bankDetails: Record<string, string>;
  copiedField: string;
  onCopy: (val: string, field: string) => void;
  onConfirm: () => void;
  colors: any;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.instructionsModal, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Deposit Instructions</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.instructionsBody}>
            <View style={[styles.amountCard, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.amountCardLabel, { color: colors.text }]}>Amount to Deposit</Text>
              <Text style={[styles.amountCardValue, { color: colors.primary }]}>
                KES {parseFloat(amount || '0').toLocaleString()}
              </Text>
            </View>
            <Text style={[styles.instructionsTitle, { color: colors.text }]}>Bank Transfer Details</Text>
            <Text style={[styles.instructionsSubtitle, { color: colors.textSecondary }]}>
              Transfer the exact amount to the following account:
            </Text>
            <View style={[styles.bankDetailsCard, { backgroundColor: colors.surface }]}>
              {Object.entries(bankDetails).map(([key, value]) => (
                <View key={key} style={styles.bankDetailRow}>
                  <Text style={[styles.bankDetailLabel, { color: colors.textSecondary }]}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                  </Text>
                  <View style={styles.bankDetailValue}>
                    <Text style={[styles.bankDetailText, { color: colors.text }]}>{value}</Text>
                    <TouchableOpacity onPress={() => onCopy(value, key)}>
                      {copiedField === key ? (
                        <CheckCircle size={16} color={colors.success} />
                      ) : (
                        <Copy size={16} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
            <View style={[styles.warningCard, { backgroundColor: colors.warning + '10' }]}>
              <Text style={[styles.warningTitle, { color: colors.text }]}>Important Notes:</Text>
              <Text style={[styles.warningText, { color: colors.textSecondary }]}>
                • Transfer the exact amount: KES {parseFloat(amount || '0').toLocaleString()}{'\n'}
                • Include your name and phone number as reference{'\n'}
                • Funds will be credited within 24 hours after verification{'\n'}
                • Keep your transfer receipt for records
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: colors.success }]}
              onPress={onConfirm}
            >
              <CheckCircle size={20} color={colors.background} />
              <Text style={[styles.confirmButtonText, { color: colors.background }]}>
                I Have Made This Deposit
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  instructionsModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  instructionsBody: {
    paddingHorizontal: 24,
  },
  amountCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  amountCardLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  amountCardValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionsSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  bankDetailsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  bankDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bankDetailLabel: {
    fontSize: 14,
    flex: 1,
  },
  bankDetailValue: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  bankDetailText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  warningCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
