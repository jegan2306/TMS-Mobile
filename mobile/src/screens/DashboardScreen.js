import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, complaintAPI } from '../services/api';
import ComplaintCard from '../components/ComplaintCard';

const CATEGORIES = [
  { name: 'PC Hardware', icon: 'hardware-chip-outline', color: '#EC4899' },
  { name: 'PC Software', icon: 'code-slash', color: '#8B5CF6' },
  { name: 'Network', icon: 'wifi', color: '#0EA5E9' },
  { name: 'Electrical', icon: 'bulb-outline', color: '#EAB308' },
  { name: 'Plumbing', icon: 'water-outline', color: '#06B6D4' },
  { name: 'Electronics', icon: 'flash-outline', color: '#F59E0B' },
  { name: 'Application Issues', icon: 'apps-outline', color: '#6366F1' },
];

export default function DashboardScreen({
  onNavigateToTab,
  onOpenComplaintDetail,
  onSelectCategoryFilter
}) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    completedComplaints: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, complaintsData] = await Promise.all([
        dashboardAPI.getStats(),
        complaintAPI.getAll()
      ]);
      if (statsData) setStats(statsData);
      if (Array.isArray(complaintsData)) {
        setRecentComplaints(complaintsData.slice(0, 4));
      }
    } catch (err) {
      console.warn('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Banner */}
      <View style={styles.welcomeBanner}>
        <View style={styles.welcomeLeft}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.username || 'User'}</Text>
          <View style={styles.userRoleBadge}>
            <Ionicons name="shield-checkmark" size={12} color={colors.primaryLight} />
            <Text style={styles.userRoleText}>{user?.role?.name || 'Standard User'}</Text>
          </View>
        </View>

        {user?.role?.name === 'User' && (
          <TouchableOpacity
            style={styles.raiseBtnHeader}
            onPress={() => onNavigateToTab('Raise')}
          >
            <Ionicons name="add" size={20} color="#FFF" />
            <Text style={styles.raiseBtnHeaderText}>New Ticket</Text>
          </TouchableOpacity>
        )}

        {user?.role?.name === 'Superadmin' && (
          <TouchableOpacity
            style={[styles.raiseBtnHeader, { backgroundColor: '#4F46E5' }]}
            onPress={() => onNavigateToTab('Complaints', 'Pending')}
          >
            <Ionicons name="person-add" size={18} color="#FFF" />
            <Text style={styles.raiseBtnHeaderText}>Assign Tickets</Text>
          </TouchableOpacity>
        )}

        {['Networking Staff', 'Plumber', 'Electrician', 'Software Developer'].includes(user?.role?.name) && (
          <TouchableOpacity
            style={[styles.raiseBtnHeader, { backgroundColor: '#10B981' }]}
            onPress={() => onNavigateToTab('Complaints')}
          >
            <Ionicons name="hammer" size={18} color="#FFF" />
            <Text style={styles.raiseBtnHeaderText}>Work Orders</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* KPI Stats Grid */}
      <View style={styles.statsGrid}>
        <TouchableOpacity
          style={[styles.statCard, { borderLeftColor: colors.primary }]}
          onPress={() => onNavigateToTab('Complaints', 'All')}
        >
          <View style={[styles.statIconCircle, { backgroundColor: '#6366F120' }]}>
            <Ionicons name="folder-open" size={20} color={colors.primary} />
          </View>
          <Text style={styles.statNumber}>{stats.totalComplaints || 0}</Text>
          <Text style={styles.statLabel}>Total Tickets</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}
          onPress={() => onNavigateToTab('Complaints', 'Pending')}
        >
          <View style={[styles.statIconCircle, { backgroundColor: '#F59E0B20' }]}>
            <Ionicons name="time" size={20} color="#F59E0B" />
          </View>
          <Text style={styles.statNumber}>{stats.pendingComplaints || 0}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, { borderLeftColor: '#8B5CF6' }]}
          onPress={() => onNavigateToTab('Complaints', 'In-Progress')}
        >
          <View style={[styles.statIconCircle, { backgroundColor: '#8B5CF620' }]}>
            <Ionicons name="hammer" size={20} color="#8B5CF6" />
          </View>
          <Text style={styles.statNumber}>{stats.inProgressComplaints || 0}</Text>
          <Text style={styles.statLabel}>In-Progress</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, { borderLeftColor: '#10B981' }]}
          onPress={() => onNavigateToTab('Complaints', 'Completed')}
        >
          <View style={[styles.statIconCircle, { backgroundColor: '#10B98120' }]}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          </View>
          <Text style={styles.statNumber}>{stats.completedComplaints || 0}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </TouchableOpacity>
      </View>

      {/* Categories Horizontal / Grid */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Issue Categories</Text>
          <Text style={styles.sectionSubtitle}>Tap to filter tickets</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.name}
              style={styles.catCard}
              onPress={() => onSelectCategoryFilter && onSelectCategoryFilter(cat.name)}
            >
              <View style={[styles.catIconWrap, { backgroundColor: `${cat.color}20` }]}>
                <Ionicons name={cat.icon} size={22} color={cat.color} />
              </View>
              <Text style={styles.catName} numberOfLines={1}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recent Complaints Feed */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => onNavigateToTab('Complaints')}>
            <Text style={styles.seeAllText}>View All →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : recentComplaints.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle-outline" size={44} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Complaints Found</Text>
            <Text style={styles.emptySub}>All systems are running normally.</Text>
          </View>
        ) : (
          recentComplaints.map((item) => (
            <ComplaintCard
              key={item._id}
              complaint={item}
              onPress={() => onOpenComplaintDetail(item)}
            />
          ))
        )}
      </View>
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
    paddingBottom: 32,
  },
  welcomeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  welcomeLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  userRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  userRoleText: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  raiseBtnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  raiseBtnHeaderText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    width: '48%',
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  seeAllText: {
    fontSize: 13,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  catScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  catCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    width: 100,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  catIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  catName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptyState: {
    backgroundColor: colors.card,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
});
