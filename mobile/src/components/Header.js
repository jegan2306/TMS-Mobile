import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import SignOutModal from './SignOutModal';

export default function Header({ onOpenServerConfig, title }) {
  const { user, logout, isServerOnline } = useAuth();
  const [signOutVisible, setSignOutVisible] = useState(false);
  const roleName = user?.role?.name || 'Guest';

  return (
    <>
      <View style={styles.container}>
        <View style={styles.left}>
          <View style={styles.logoBadge}>
            <Ionicons name="construct" size={18} color="#FFF" />
          </View>
          <View>
            <Text style={styles.title}>{title || 'TMS Mobile'}</Text>
            <View style={styles.connectionRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isServerOnline ? '#10B981' : '#F59E0B' }
                ]}
              />
              <Text style={styles.statusText}>
                {isServerOnline ? 'Backend Connected' : 'Offline / Demo Mode'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.right}>
          {user && (
            <View style={styles.roleChip}>
              <Text style={styles.roleText}>{roleName}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onOpenServerConfig}
            accessibilityLabel="Server Settings"
          >
            <Ionicons name="server-outline" size={19} color={colors.textSecondary} />
          </TouchableOpacity>

          {user && (
            <TouchableOpacity
              style={[styles.iconButton, styles.logoutButton]}
              onPress={() => setSignOutVisible(true)}
              accessibilityLabel="Sign Out"
            >
              <Ionicons name="log-out-outline" size={19} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <SignOutModal
        visible={signOutVisible}
        user={user}
        onClose={() => setSignOutVisible(false)}
        onConfirm={logout}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
});

