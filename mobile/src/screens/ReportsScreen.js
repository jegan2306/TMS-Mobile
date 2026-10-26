import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { complaintAPI, dashboardAPI } from '../services/api';

export default function ReportsScreen() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await complaintAPI.getAll();
      if (Array.isArray(data)) {
        setComplaints(data);
      }
    } catch (e) {
      console.warn('Reports load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const total = complaints.length || 1;
  const statusCounts = {
    Pending: complaints.filter(c => c.status === 'Pending').length,
    Assigned: complaints.filter(c => c.status === 'Assigned').length,
    'In-Progress': complaints.filter(c => c.status === 'In-Progress').length,
    Completed: complaints.filter(c => c.status === 'Completed').length,
    'On-Hold': complaints.filter(c => c.status === 'On-Hold').length,
  };

  // Category counts
  const categoryCounts = {};
  complaints.forEach(c => {
    const t = c.complaintType || 'Other';
    categoryCounts[t] = (categoryCounts[t] || 0) + 1;
  });

  const resolutionRate = Math.round((statusCounts.Completed / total) * 100);

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
      <View style={styles.header}>
        <Text style={styles.title}>Reports & Analytics</Text>
        <Text style={styles.subtitle}>Overview of service tickets and campus maintenance</Text>
      </View>

      {/* Resolution Rate Card */}
      <View style={styles.rateCard}>
        <View style={styles.rateLeft}>
          <Text style={styles.rateLabel}>Issue Resolution Rate</Text>
          <Text style={styles.rateValue}>{resolutionRate}%</Text>
          <Text style={styles.rateDesc}>
            {statusCounts.Completed} out of {complaints.length} complaints completed
          </Text>
        </View>
        <View style={styles.rateBadge}>
          <Ionicons name="pie-chart" size={40} color={colors.primaryLight} />
        </View>
      </View>

      {/* Status Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Breakdown</Text>
        <View style={styles.breakdownCard}>
          {Object.entries(statusCounts).map(([status, count]) => {
            const pct = Math.round((count / total) * 100);
            let barColor = colors.primary;
            if (status === 'Pending') barColor = '#F59E0B';
            else if (status === 'Assigned') barColor = '#0EA5E9';
            else if (status === 'In-Progress') barColor = '#8B5CF6';
            else if (status === 'Completed') barColor = '#10B981';
            else if (status === 'On-Hold') barColor = '#F97316';

            return (
              <View key={status} style={styles.statusRow}>
                <View style={styles.statusRowHeader}>
                  <Text style={styles.statusName}>{status}</Text>
                  <Text style={styles.statusCount}>
                    {count} ({pct}%)
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${pct}%`, backgroundColor: barColor }
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Category Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>By Complaint Type</Text>
        <View style={styles.categoryCard}>
          {Object.entries(categoryCounts).map(([cat, count]) => (
            <View key={cat} style={styles.catItem}>
              <View style={styles.catDot} />
              <Text style={styles.catName} numberOfLines={1}>{cat}</Text>
              <Text style={styles.catCount}>{count} tickets</Text>
            </View>
          ))}
        </View>
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rateCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 20,
  },
  rateLeft: {
    flex: 1,
  },
  rateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  rateValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#10B981',
    marginTop: 2,
  },
  rateDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  rateBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryLight,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  breakdownCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 14,
  },
  statusRow: {},
  statusRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statusName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statusCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.card,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 12,
  },
  catItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 10,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  catName: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  catCount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
