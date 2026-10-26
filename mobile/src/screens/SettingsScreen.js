import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { getCurrentCachedApiUrl } from '../config/apiConfig';
import SignOutModal from '../components/SignOutModal';

export default function SettingsScreen({ onOpenServerConfig }) {
  const { user, logout, quickLogin, isServerOnline } = useAuth();
  const [signOutVisible, setSignOutVisible] = useState(false);

  const handleLogout = () => {
    setSignOutVisible(true);
  };

  const handleSwitchUser = async (email) => {
    await quickLogin(email);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <Ionicons name="person" size={32} color="#FFF" />
        </View>

        <Text style={styles.profileName}>{user?.username || 'User'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role?.name || 'Standard User'}</Text>
        </View>

        <View style={styles.profileDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{user?.email || 'N/A'}</Text>
          </View>
          {user?.phone ? (
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>{user.phone}</Text>
            </View>
          ) : null}
          {user?.department ? (
            <View style={styles.detailRow}>
              <Ionicons name="school-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>
                {user.department?.name || user.department?.shortName || 'Department'}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Backend Server Configuration Box */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backend Connection</Text>
        <TouchableOpacity style={styles.serverCard} onPress={onOpenServerConfig}>
          <View style={styles.serverLeft}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isServerOnline ? '#10B981' : '#F59E0B' }
              ]}
            />
            <View>
              <Text style={styles.serverTitle}>
                {isServerOnline ? 'Backend Online' : 'Offline / Demo Mode'}
              </Text>
              <Text style={styles.serverUrl}>{getCurrentCachedApiUrl()}</Text>
            </View>
          </View>
          <View style={styles.changeIpBtn}>
            <Text style={styles.changeIpText}>Edit IP</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primaryLight} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Switch User / Test Other Roles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Switch Role (Quick Test)</Text>
        <View style={styles.switchGrid}>
          {DEMO_USERS.map((item) => {
            const isCurrent = user?.email?.toLowerCase() === item.email.toLowerCase();
            return (
              <TouchableOpacity
                key={item.email}
                style={[
                  styles.switchChip,
                  isCurrent && styles.switchChipCurrent
                ]}
                onPress={() => handleSwitchUser(item.email)}
              >
                <Text
                  style={[
                    styles.switchLabel,
                    isCurrent && { color: colors.primaryLight, fontWeight: '700' }
                  ]}
                >
                  {item.label}
                </Text>
                {isCurrent && (
                  <Ionicons name="checkmark-circle" size={16} color={colors.primaryLight} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* About System */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Info</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>App Platform:</Text>
            <Text style={styles.infoVal}>React Native & Web (Universal)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Expo SDK:</Text>
            <Text style={styles.infoVal}>v57.0 (Expo Go ready)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Backend Server:</Text>
            <Text style={styles.infoVal}>Node.js / Express.js (Port 5000)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Database:</Text>
            <Text style={styles.infoVal}>MongoDB (Local Instance)</Text>
          </View>
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Sign Out of TMS</Text>
      </TouchableOpacity>

      <SignOutModal
        visible={signOutVisible}
        user={user}
        onClose={() => setSignOutVisible(false)}
        onConfirm={logout}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 20,
  },
  avatarWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  roleBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  profileDetails: {
    width: '100%',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryLight,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  serverCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  serverLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  serverTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  serverUrl: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  changeIpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  changeIpText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  switchGrid: {
    gap: 8,
  },
  switchChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  switchChipCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  switchLabel: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoKey: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7F1D1D20',
    borderWidth: 1,
    borderColor: '#7F1D1D',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 10,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
});
