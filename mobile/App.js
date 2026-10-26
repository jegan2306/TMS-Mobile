import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { colors } from './src/theme/colors';
import Header from './src/components/Header';
import ServerConfigModal from './src/components/ServerConfigModal';
import ComplaintDetailModal from './src/components/ComplaintDetailModal';
import StatusModal from './src/components/StatusModal';
import AssignModal from './src/components/AssignModal';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ComplaintsScreen from './src/screens/ComplaintsScreen';
import RaiseComplaintScreen from './src/screens/RaiseComplaintScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import MasterDataScreen from './src/screens/MasterDataScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { complaintAPI } from './src/services/api';

const ALL_TABS = [
  { key: 'Dashboard', label: 'Dashboard', icon: 'grid-outline', activeIcon: 'grid', roles: ['Superadmin', 'User', 'Faculty', 'Networking Staff', 'Plumber', 'Electrician', 'Software Developer'] },
  { key: 'Complaints', label: 'Tickets', icon: 'document-text-outline', activeIcon: 'document-text', roles: ['Superadmin', 'User', 'Faculty', 'Networking Staff', 'Plumber', 'Electrician', 'Software Developer'] },
  { key: 'Raise', label: 'Raise', icon: 'add-circle-outline', activeIcon: 'add-circle', isFab: true, roles: ['User'] }, // ONLY User can raise complaints!
  { key: 'Reports', label: 'Reports', icon: 'bar-chart-outline', activeIcon: 'bar-chart', roles: ['Superadmin', 'Faculty'] },
  { key: 'Masters', label: 'Campus', icon: 'business-outline', activeIcon: 'business', roles: ['Superadmin'] },
  { key: 'Settings', label: 'Settings', icon: 'settings-outline', activeIcon: 'settings', roles: ['Superadmin', 'User', 'Faculty', 'Networking Staff', 'Plumber', 'Electrician', 'Software Developer'] },
];

function MainApp() {
  const { user, loading } = useAuth();
  const userRole = user?.role?.name || 'User';

  const userTabs = ALL_TABS.filter(tab => !tab.roles || tab.roles.includes(userRole)).map(tab => {
    if (tab.key === 'Complaints') {
      if (userRole === 'User') return { ...tab, label: 'My Tickets' };
      if (userRole === 'Superadmin') return { ...tab, label: 'Assign Tickets' };
      return { ...tab, label: 'Work Orders' };
    }
    return tab;
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [initialStatusFilter, setInitialStatusFilter] = useState('All');
  const [initialCategoryFilter, setInitialCategoryFilter] = useState(null);

  // Modal States
  const [serverModalVisible, setServerModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);

  // Complaints screen reload trigger
  const [reloadTrigger, setReloadTrigger] = useState(0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={styles.splashIconBox}>
          <Ionicons name="construct" size={48} color="#FFF" />
        </View>
        <Text style={styles.splashTitle}>TMS Portal</Text>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <LoginScreen onOpenServerConfig={() => setServerModalVisible(true)} />
        <ServerConfigModal
          visible={serverModalVisible}
          onClose={() => setServerModalVisible(false)}
        />
      </SafeAreaView>
    );
  }

  const navigateToTab = (tabKey, statusFilter = 'All') => {
    setActiveTab(tabKey);
    setInitialStatusFilter(statusFilter);
    setInitialCategoryFilter(null);
  };

  const selectCategoryFilter = (catName) => {
    setActiveTab('Complaints');
    setInitialStatusFilter('All');
    setInitialCategoryFilter(catName);
  };

  const handleOpenDetail = (complaint) => {
    setSelectedComplaint(complaint);
    setDetailModalVisible(true);
  };

  const handleOpenStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setStatusModalVisible(true);
  };

  const handleOpenAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignModalVisible(true);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await complaintAPI.updateStatus(id, status);
      if (selectedComplaint && selectedComplaint._id === id) {
        setSelectedComplaint(prev => ({ ...prev, status }));
      }
      setReloadTrigger(prev => prev + 1);
      Alert.alert('Updated', `Ticket status changed to ${status}`);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update status');
    }
  };

  const handleAssignStaff = async (id, staffId) => {
    try {
      const res = await complaintAPI.assign(id, staffId);
      if (res && res.complaint) {
        setSelectedComplaint(res.complaint);
      }
      setReloadTrigger(prev => prev + 1);
      Alert.alert('Success', 'Staff member assigned successfully');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to assign staff');
    }
  };

  const handleDeleteComplaint = async (id) => {
    Alert.alert(
      'Delete Ticket',
      'Are you sure you want to permanently delete this complaint?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await complaintAPI.delete(id);
              setDetailModalVisible(false);
              setReloadTrigger(prev => prev + 1);
              Alert.alert('Deleted', 'Ticket deleted successfully');
            } catch (e) {
              Alert.alert('Error', e.message || 'Failed to delete ticket');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.surface} />

      {/* Header */}
      <Header
        onOpenServerConfig={() => setServerModalVisible(true)}
        title={
          activeTab === 'Dashboard'
            ? 'TMS Overview'
            : activeTab === 'Complaints'
            ? 'Tickets List'
            : activeTab === 'Raise'
            ? 'New Complaint'
            : activeTab === 'Reports'
            ? 'Analytics'
            : activeTab === 'Masters'
            ? 'Campus Directory'
            : 'Settings'
        }
      />

      {/* Main Content Area */}
      <View style={styles.body}>
        {activeTab === 'Dashboard' && (
          <DashboardScreen
            onNavigateToTab={navigateToTab}
            onOpenComplaintDetail={handleOpenDetail}
            onSelectCategoryFilter={selectCategoryFilter}
          />
        )}

        {activeTab === 'Complaints' && (
          <ComplaintsScreen
            key={reloadTrigger}
            initialStatus={initialStatusFilter}
            initialCategory={initialCategoryFilter}
            onOpenComplaintDetail={handleOpenDetail}
            onNavigateToRaise={() => setActiveTab('Raise')}
          />
        )}

        {activeTab === 'Raise' && (
          <RaiseComplaintScreen
            onSuccess={() => {
              setActiveTab('Complaints');
              setInitialStatusFilter('All');
              setReloadTrigger(prev => prev + 1);
            }}
          />
        )}

        {activeTab === 'Reports' && <ReportsScreen />}

        {activeTab === 'Masters' && <MasterDataScreen />}

        {activeTab === 'Settings' && (
          <SettingsScreen onOpenServerConfig={() => setServerModalVisible(true)} />
        )}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {userTabs.map((tab) => {
          const isSelected = activeTab === tab.key;
          const iconName = isSelected ? tab.activeIcon : tab.icon;

          if (tab.isFab) {
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.fabTabBtn}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <View style={styles.fabInner}>
                  <Ionicons name="add" size={26} color="#FFF" />
                </View>
                <Text style={[styles.tabLabel, isSelected && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabBtn}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={isSelected ? colors.primaryLight : colors.textMuted}
              />
              <Text style={[styles.tabLabel, isSelected && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Global Modals */}
      <ServerConfigModal
        visible={serverModalVisible}
        onClose={() => setServerModalVisible(false)}
      />

      <ComplaintDetailModal
        visible={detailModalVisible}
        complaint={selectedComplaint}
        onClose={() => setDetailModalVisible(false)}
        onOpenStatusModal={handleOpenStatusModal}
        onOpenAssignModal={handleOpenAssignModal}
        onDeleteComplaint={handleDeleteComplaint}
      />

      <StatusModal
        visible={statusModalVisible}
        complaint={selectedComplaint}
        onClose={() => setStatusModalVisible(false)}
        onUpdateStatus={handleUpdateStatus}
      />

      <AssignModal
        visible={assignModalVisible}
        complaint={selectedComplaint}
        onClose={() => setAssignModalVisible(false)}
        onAssignStaff={handleAssignStaff}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  body: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    flex: 1,
  },
  fabTabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -16,
  },
  fabInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 3,
  },
  tabLabelActive: {
    color: colors.primaryLight,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  splashTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 16,
    letterSpacing: 0.5,
  },
});
