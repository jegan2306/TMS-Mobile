import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, getStatusStyle } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function ComplaintDetailModal({
  visible,
  complaint,
  onClose,
  onOpenStatusModal,
  onOpenAssignModal,
  onDeleteComplaint
}) {
  const { user } = useAuth();
  if (!complaint) return null;

  const roleName = user?.role?.name || '';
  const isSuperadmin = roleName === 'Superadmin';
  const isFaculty = roleName === 'Faculty';
  const isStaff = ['Networking Staff', 'Plumber', 'Electrician', 'Software Developer'].includes(roleName);
  const isOwner = user && complaint.raisedBy && (complaint.raisedBy._id === user.id || complaint.raisedBy._id === user._id);

  const canUpdateStatus = isSuperadmin || isFaculty || isStaff;
  const canAssign = isSuperadmin;
  const canDelete = isSuperadmin || isOwner;

  const statusStyle = getStatusStyle(complaint.status);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.ticketId}>
                Ticket #{complaint._id ? complaint._id.slice(-6).toUpperCase() : 'TICKET'}
              </Text>
              <Text style={styles.title}>{complaint.complaintType}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Status & Category */}
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                  {complaint.status}
                </Text>
              </View>
              <Text style={styles.dateText}>
                {complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : ''}
              </Text>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Problem Remarks / Description</Text>
              <View style={styles.descBox}>
                <Text style={styles.descText}>{complaint.remarks}</Text>
              </View>
            </View>

            {/* Location Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location Details</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <Ionicons name="business-outline" size={16} color={colors.primaryLight} />
                  <Text style={styles.infoLabel}>Block:</Text>
                  <Text style={styles.infoValue}>{complaint.block?.name || 'N/A'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={16} color={colors.primaryLight} />
                  <Text style={styles.infoLabel}>Room:</Text>
                  <Text style={styles.infoValue}>{complaint.room?.roomNumber || 'N/A'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="school-outline" size={16} color={colors.primaryLight} />
                  <Text style={styles.infoLabel}>Department:</Text>
                  <Text style={styles.infoValue}>
                    {complaint.department?.name || complaint.department?.shortName || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>

            {/* People Involved */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>People Involved</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <Ionicons name="person-circle-outline" size={16} color={colors.secondary} />
                  <Text style={styles.infoLabel}>Reported By:</Text>
                  <Text style={styles.infoValue}>
                    {complaint.raisedBy?.username || 'User'} ({complaint.raisedBy?.email || ''})
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="shield-checkmark-outline" size={16} color="#10B981" />
                  <Text style={styles.infoLabel}>Assigned Staff:</Text>
                  <Text style={[styles.infoValue, { color: complaint.assignedTo ? '#10B981' : colors.textMuted }]}>
                    {complaint.assignedTo
                      ? `${complaint.assignedTo.username} (${complaint.assignedTo.role?.name || 'Staff'})`
                      : 'Unassigned'}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footerActions}>
            {canUpdateStatus && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.statusBtn]}
                onPress={() => onOpenStatusModal(complaint)}
              >
                <Ionicons name="checkmark-done" size={16} color="#FFF" />
                <Text style={styles.actionBtnText}>Update Status</Text>
              </TouchableOpacity>
            )}

            {canAssign && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.assignBtn]}
                onPress={() => onOpenAssignModal(complaint)}
              >
                <Ionicons name="person-add" size={16} color="#FFF" />
                <Text style={styles.actionBtnText}>
                  {complaint.assignedTo ? 'Reassign' : 'Assign Staff'}
                </Text>
              </TouchableOpacity>
            )}

            {canDelete && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={() => {
                  onDeleteComplaint(complaint._id);
                  onClose();
                }}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: 14,
  },
  ticketId: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryLight,
    letterSpacing: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginVertical: 14,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  descText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  infoGrid: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 95,
  },
  infoValue: {
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 14,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  statusBtn: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  assignBtn: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  deleteBtn: {
    width: 44,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
});
