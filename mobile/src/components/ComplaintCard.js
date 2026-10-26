import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, getStatusStyle } from '../theme/colors';

const getCategoryIcon = (type) => {
  switch (type) {
    case 'PC Hardware':
      return { lib: 'Ionicons', name: 'hardware-chip-outline', color: '#EC4899' };
    case 'PC Software':
      return { lib: 'Ionicons', name: 'code-slash', color: '#8B5CF6' };
    case 'Application Issues':
      return { lib: 'Ionicons', name: 'apps', color: '#6366F1' };
    case 'Network':
      return { lib: 'Ionicons', name: 'wifi', color: '#0EA5E9' };
    case 'Electronics':
      return { lib: 'Ionicons', name: 'flash', color: '#F59E0B' };
    case 'Plumbing':
      return { lib: 'Ionicons', name: 'water', color: '#06B6D4' };
    case 'Electrical':
      return { lib: 'Ionicons', name: 'bulb', color: '#EAB308' };
    default:
      return { lib: 'Ionicons', name: 'help-circle-outline', color: '#94A3B8' };
  }
};

export default function ComplaintCard({ complaint, onPress }) {
  const statusStyle = getStatusStyle(complaint.status);
  const iconInfo = getCategoryIcon(complaint.complaintType);

  const blockName = complaint.block?.name || 'Block';
  const roomName = complaint.room?.roomNumber || 'Room';
  const deptName = complaint.department?.shortName || complaint.department?.name || '';
  const assignedName = complaint.assignedTo?.username || null;
  const timeStr = complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : '';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress && onPress(complaint)}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <View style={styles.categoryBadge}>
          <Ionicons name={iconInfo.name} size={15} color={iconInfo.color} />
          <Text style={[styles.categoryText, { color: iconInfo.color }]}>
            {complaint.complaintType}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {complaint.status}
          </Text>
        </View>
      </View>

      <Text style={styles.remarks} numberOfLines={2}>
        {complaint.remarks}
      </Text>

      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={14} color={colors.textMuted} />
        <Text style={styles.locationText} numberOfLines={1}>
          {roomName} • {blockName} {deptName ? `(${deptName})` : ''}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.assigneeContainer}>
          <Ionicons
            name={assignedName ? "person" : "person-outline"}
            size={13}
            color={assignedName ? colors.primaryLight : colors.textMuted}
          />
          <Text
            style={[
              styles.assigneeText,
              { color: assignedName ? colors.primaryLight : colors.textMuted }
            ]}
          >
            {assignedName ? `Assigned: ${assignedName}` : 'Unassigned'}
          </Text>
        </View>

        <View style={styles.dateContainer}>
          <Ionicons name="time-outline" size={13} color={colors.textMuted} />
          <Text style={styles.dateText}>{timeStr}</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.textMuted} style={{ marginLeft: 2 }} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  remarks: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 10,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 10,
  },
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  assigneeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
