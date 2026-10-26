import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ComplaintCard from '../components/ComplaintCard';

const STATUS_TABS = ['All', 'Pending', 'Assigned', 'In-Progress', 'Completed', 'On-Hold'];

export default function ComplaintsScreen({
  initialStatus = 'All',
  initialCategory = null,
  onOpenComplaintDetail,
  onNavigateToRaise
}) {
  const { user } = useAuth();
  const isUser = user?.role?.name === 'User';
  const [complaints, setComplaints] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [activeTab, setActiveTab] = useState(initialStatus);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setActiveTab(initialStatus || 'All');
  }, [initialStatus]);

  useEffect(() => {
    setActiveCategory(initialCategory || null);
  }, [initialCategory]);

  useEffect(() => {
    fetchComplaints();
  }, [activeTab]);

  useEffect(() => {
    filterComplaints();
  }, [complaints, searchQuery, activeCategory]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await complaintAPI.getAll({ status: activeTab });
      if (Array.isArray(data)) {
        setComplaints(data);
      }
    } catch (err) {
      console.warn('Failed to load complaints:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterComplaints = () => {
    let result = [...complaints];

    // Filter by category if set
    if (activeCategory) {
      result = result.filter(c => c.complaintType === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c => {
        const remarks = (c.remarks || '').toLowerCase();
        const type = (c.complaintType || '').toLowerCase();
        const room = (c.room?.roomNumber || '').toLowerCase();
        const block = (c.block?.name || '').toLowerCase();
        const user = (c.raisedBy?.username || '').toLowerCase();
        const staff = (c.assignedTo?.username || '').toLowerCase();
        return (
          remarks.includes(q) ||
          type.includes(q) ||
          room.includes(q) ||
          block.includes(q) ||
          user.includes(q) ||
          staff.includes(q)
        );
      });
    }

    setFilteredList(result);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by issue, room, staff or block..."
          placeholderTextColor={colors.textMuted}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category filter banner if active */}
      {activeCategory && (
        <View style={styles.activeCategoryBanner}>
          <Text style={styles.activeCategoryText}>
            Showing: <Text style={{ fontWeight: '700' }}>{activeCategory}</Text>
          </Text>
          <TouchableOpacity onPress={() => setActiveCategory(null)} style={styles.removeCatBtn}>
            <Ionicons name="close" size={14} color="#FFF" />
            <Text style={styles.removeCatText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Status Filter Horizontal Tabs */}
      <View style={styles.tabsWrapper}>
        <FlatList
          data={STATUS_TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.tabsList}
          renderItem={({ item }) => {
            const isSelected = activeTab === item;
            return (
              <TouchableOpacity
                style={[
                  styles.tabChip,
                  isSelected && styles.tabChipActive
                ]}
                onPress={() => setActiveTab(item)}
              >
                <Text
                  style={[
                    styles.tabChipText,
                    isSelected && styles.tabChipTextActive
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Complaints List */}
      {loading && !refreshing ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching Tickets...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={56} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Matching Tickets</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search terms or filter status.
              </Text>
              {isUser && (
                <TouchableOpacity style={styles.emptyActionBtn} onPress={onNavigateToRaise}>
                  <Ionicons name="add-circle" size={18} color="#FFF" />
                  <Text style={styles.emptyActionText}>Raise a New Complaint</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <ComplaintCard
              complaint={item}
              onPress={() => onOpenComplaintDetail(item)}
            />
          )}
        />
      )}

      {/* Floating Action Button (User only) */}
      {isUser && (
        <TouchableOpacity
          style={styles.fab}
          onPress={onNavigateToRaise}
          accessibilityLabel="Raise Ticket"
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    paddingVertical: 10,
  },
  clearSearchBtn: {
    padding: 4,
  },
  activeCategoryBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  activeCategoryText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  removeCatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 2,
  },
  removeCatText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  tabsWrapper: {
    marginBottom: 8,
  },
  tabsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabChip: {
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tabChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabChipTextActive: {
    color: '#FFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  emptyActionText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
