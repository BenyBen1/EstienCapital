import React from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import PaymentMethodCard from './PaymentMethodCard';

export default function WithdrawModal({
  visible,
  onClose,
  amount,
  setAmount,
  availableBalance,
  paymentMethods,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  onWithdraw,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  amount: string;
  setAmount: (val: string) => void;
  availableBalance: number;
  paymentMethods: any[];
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: (id: string) => void;
  onWithdraw: () => void;
  colors: any;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Withdraw Funds</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Withdrawal Amount (KES)</Text>
            <TextInput
              style={[
                styles.amountInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
            <Text style={[styles.availableBalance, { color: colors.textSecondary }]}>
              Available balance: KES {availableBalance.toLocaleString()}
            </Text>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Payment Method</Text>
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                selected={selectedPaymentMethod === method.id}
                onSelect={() => setSelectedPaymentMethod(method.id)}
                colors={colors}
              />
            ))}
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={onWithdraw}
            >
              <Text style={[styles.modalButtonText, { color: colors.background }]}>
                Request Withdrawal
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
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
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
  modalBody: {
    paddingHorizontal: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  amountInput: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  availableBalance: {
    fontSize: 14,
    marginBottom: 24,
  },
  modalButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
