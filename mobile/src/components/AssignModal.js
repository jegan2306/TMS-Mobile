import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { masterAPI } from '../services/api';

const COMPLAINT_TYPE_TO_ROLE = {
  'Plumbing': 'Plumber',
  'Electrical': 'Electrician',
  'Electronics': 'Electrician',
  'Network': 'Networking Staff',
  'PC Hardware': 'Software Developer',
  'PC Software': 'Software Developer',
  'Application Issues': 'Software Developer',
  'Other': 'All',
};

const CATEGORY_TABS = ['Suggested', 'All', 'Plumber', 'Electrician', 'Networking Staff', 'Software Developer', 'Faculty'];

export default function AssignModal({ visible, complaint, onClose, onAssignStaff }) {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(complaint?.assignedTo?._id || null);
  const [categoryFilter, setCategoryFilter] = useState('Suggested');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const suggestedRole = complaint?.complaintType ? (COMPLAINT_TYPE_TO_ROLE[complaint.complaintType] || 'All') : 'All';

  useEffect(() => {
    if (visible) {
      loadStaff();
      setSelectedStaffId(complaint?.assignedTo?._id || null);
      setCategoryFilter('Suggested');
    }
  }, [visible, complaint]);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const allUsers = await masterAPI.getUsers();
      // Filter users whose role is staff or faculty
      const filtered = allUsers.filter(u => {
        const r = u.role?.name;
        return ['Networking Staff', 'Plumber', 'Electrician', 'Software Developer', 'Faculty'].includes(r);
      });
      setStaffList(filtered);
    } catch (e) {
      console.warn('Failed to load staff list:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaffList = staffList.filter((staff) => {
    if (categoryFilter === 'Suggested') {
      if (suggestedRole === 'All') return true;
      return staff.role?.name === suggestedRole;
    }
    if (categoryFilter === 'All') return true;
    return staff.role?.name === categoryFilter;
  });

  const handleAssign = async () => {
    if (!complaint || !selectedStaffId) return;
    setSubmitting(true);
    await onAssignStaff(complaint._id, selectedStaffId);
    setSubmitting(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="person-add" size={20} color={colors.primaryLight} />
              <Text style={styles.title}>Assign Specialist Staff</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {complaint?.complaintType && (
            <View style={styles.categoryBadge}>
              <Ionicons name="pricetag-outline" size={14} color={colors.primaryLight} />
              <Text style={styles.categoryBadgeText}>
                Complaint Category: <Text style={{ fontWeight: '700', color: '#FFF' }}>{complaint.complaintType}</Text>
                {suggestedRole !== 'All' ? `  ➔  Target: ${suggestedRole}` : ''}
              </Text>
            </View>
          )}

          {/* Category Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterScrollContent}>
            {CATEGORY_TABS.map((cat) => {
              const isActive = categoryFilter === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setCategoryFilter(cat)}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {cat === 'Suggested' && suggestedRole !== 'All' ? `Suggested (${suggestedRole})` : cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 30 }} />
          ) : (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {filteredStaffList.map((staff) => {
                const isSelected = selectedStaffId === staff._id;
                return (
                  <TouchableOpacity
                    key={staff._id}
                    style={[
                      styles.staffCard,
                      isSelected && styles.selectedStaffCard
                    ]}
                    onPress={() => setSelectedStaffId(staff._id)}
                  >
                    <View style={styles.avatar}>
                      <Ionicons
                        name="person"
                        size={18}
                        color={isSelected ? '#FFF' : colors.primaryLight}
                      />
                    </View>

                    <View style={styles.staffInfo}>
                      <Text style={[styles.staffName, isSelected && { color: '#FFF' }]}>
                        {staff.username}
                      </Text>
                      <Text style={styles.staffRole}>
                        {staff.role?.name || 'Staff'} {staff.department?.name ? `• ${staff.department.name}` : ''}
                      </Text>
                    </View>

                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color={colors.primaryLight} />
                    )}
                  </TouchableOpacity>
                );
              })}

              {filteredStaffList.length === 0 && (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                    No staff found in this category.
                  </Text>
                  <TouchableOpacity onPress={() => setCategoryFilter('All')} style={{ marginTop: 8 }}>
                    <Text style={{ color: colors.primaryLight, fontWeight: '600', fontSize: 13 }}>
                      Show All Staff
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, !selectedStaffId && { opacity: 0.5 }]}
              onPress={handleAssign}
              disabled={submitting || !selectedStaffId}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.confirmText}>Confirm Assignment</Text>
              )}
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    marginBottom: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: colors.primaryLight,
  },
  filterScroll: {
    marginBottom: 14,
  },
  filterScrollContent: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  list: {
    maxHeight: 280,
    marginBottom: 16,
  },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 10,
    gap: 12,
  },
  selectedStaffCard: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  staffRole: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cancelText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  confirmText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
