import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, getStatusStyle } from '../theme/colors';

const STATUS_OPTIONS = [
  { label: 'Pending', desc: 'Waiting for review', icon: 'time-outline' },
  { label: 'Assigned', desc: 'Assigned to technician', icon: 'person-outline' },
  { label: 'In-Progress', desc: 'Work currently underway', icon: 'hammer-outline' },
  { label: 'Completed', desc: 'Issue resolved successfully', icon: 'checkmark-circle-outline' },
  { label: 'On-Hold', desc: 'Waiting for parts/spares', icon: 'pause-circle-outline' }
];

export default function StatusModal({ visible, complaint, onClose, onUpdateStatus }) {
  const [selectedStatus, setSelectedStatus] = useState(complaint?.status || 'Pending');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (complaint) {
      setSelectedStatus(complaint.status);
    }
  }, [complaint]);

  const handleSubmit = async () => {
    if (!complaint) return;
    setSubmitting(true);
    await onUpdateStatus(complaint._id, selectedStatus);
    setSubmitting(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="swap-vertical" size={20} color={colors.primaryLight} />
              <Text style={styles.title}>Update Ticket Status</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Select the current workflow status of this ticket:</Text>

          <View style={styles.optionsList}>
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = selectedStatus === opt.label;
              const statusStyle = getStatusStyle(opt.label);

              return (
                <TouchableOpacity
                  key={opt.label}
                  style={[
                    styles.optionCard,
                    isSelected && { borderColor: statusStyle.badge, backgroundColor: colors.surfaceLight }
                  ]}
                  onPress={() => setSelectedStatus(opt.label)}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: statusStyle.bg }
                    ]}
                  >
                    <Ionicons name={opt.icon} size={18} color={statusStyle.badge} />
                  </View>

                  <View style={styles.optionInfo}>
                    <Text style={[styles.optionLabel, isSelected && { color: statusStyle.badge }]}>
                      {opt.label}
                    </Text>
                    <Text style={styles.optionDesc}>{opt.desc}</Text>
                  </View>

                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={statusStyle.badge} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.confirmText}>Save Status</Text>
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
  optionsList: {
    gap: 10,
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  optionDesc: {
    fontSize: 12,
    color: colors.textMuted,
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
