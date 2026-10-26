import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function SignOutModal({ visible, user, onClose, onConfirm }) {
  if (!visible) return null;

  const roleName = user?.role?.name || 'User';
  const displayName = user?.username || user?.email || 'User';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top Danger Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name="log-out-outline" size={32} color="#EF4444" />
          </View>

          <Text style={styles.title}>Sign Out</Text>
          <Text style={styles.message}>
            Are you sure you want to sign out of the Ticket Management System?
          </Text>

          {/* User Details Box */}
          <View style={styles.userBox}>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={18} color="#FFF" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
              <Text style={styles.userRole}>{roleName}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => {
                onClose();
                onConfirm();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.confirmBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  userBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 22,
    gap: 12,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  userRole: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: '500',
    marginTop: 2,
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
});
