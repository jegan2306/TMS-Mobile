import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { masterAPI, complaintAPI } from '../services/api';

const COMPLAINT_TYPES = [
  { name: 'PC Hardware', icon: 'hardware-chip-outline', color: '#EC4899', desc: 'Display, mouse, CPU, keyboard' },
  { name: 'PC Software', icon: 'code-slash', color: '#8B5CF6', desc: 'OS crash, compiler, driver error' },
  { name: 'Application Issues', icon: 'apps-outline', color: '#6366F1', desc: 'AutoCAD, MATLAB, LMS portal' },
  { name: 'Network', icon: 'wifi', color: '#0EA5E9', desc: 'Wi-Fi, LAN port, latency, IP' },
  { name: 'Electrical', icon: 'bulb-outline', color: '#EAB308', desc: 'Socket, lights, switchboard' },
  { name: 'Plumbing', icon: 'water-outline', color: '#06B6D4', desc: 'Water leakage, tap, restroom' },
  { name: 'Electronics', icon: 'flash-outline', color: '#F59E0B', desc: 'Projector, mic, amplifier, AC' },
  { name: 'Other', icon: 'help-circle-outline', color: '#94A3B8', desc: 'Desk, furniture, physical lock' },
];

export default function RaiseComplaintScreen({ onSuccess }) {
  const { user } = useAuth();

  const [complaintType, setComplaintType] = useState('PC Hardware');
  const [remarks, setRemarks] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState(user?.department?._id || '');
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  const [departments, setDepartments] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [pickerModal, setPickerModal] = useState({ visible: false, type: '', data: [] });
  const [submitting, setSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    if (selectedBlockId) {
      loadRooms(selectedBlockId);
    }
  }, [selectedBlockId]);

  const loadMasterData = async () => {
    try {
      const [deptList, blockList] = await Promise.all([
        masterAPI.getDepartments(),
        masterAPI.getBlocks()
      ]);
      setDepartments(deptList || []);
      setBlocks(blockList || []);

      if (blockList && blockList.length > 0) {
        setSelectedBlockId(blockList[0]._id);
      }
      if (deptList && deptList.length > 0 && !selectedDeptId) {
        setSelectedDeptId(deptList[0]._id);
      }
    } catch (e) {
      console.warn('Failed to load master data for form:', e);
    }
  };

  const loadRooms = async (blockId) => {
    try {
      const roomList = await masterAPI.getRooms(blockId);
      setRooms(roomList || []);
      if (roomList && roomList.length > 0) {
        setSelectedRoomId(roomList[0]._id);
      } else {
        setSelectedRoomId('');
      }
    } catch (e) {
      console.warn('Failed to load rooms:', e);
    }
  };

  const handleSubmit = async () => {
    if (!complaintType) {
      Alert.alert('Required', 'Please select a complaint category.');
      return;
    }
    if (!selectedBlockId) {
      Alert.alert('Required', 'Please select a campus block.');
      return;
    }
    if (!selectedRoomId) {
      Alert.alert('Required', 'Please select a room.');
      return;
    }
    if (!remarks.trim()) {
      Alert.alert('Required', 'Please describe the problem or issue.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        complaintType,
        block: selectedBlockId,
        room: selectedRoomId,
        department: selectedDeptId,
        remarks: remarks.trim()
      };

      const res = await complaintAPI.create(payload, user);
      setCreatedTicket(res.complaint || payload);
      setSuccessModal(true);
      // Reset form
      setRemarks('');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedBlockName = () => {
    const b = blocks.find((item) => item._id === selectedBlockId);
    return b ? b.name : 'Select Block';
  };

  const getSelectedRoomName = () => {
    const r = rooms.find((item) => item._id === selectedRoomId);
    return r ? r.roomNumber : 'Select Room';
  };

  const getSelectedDeptName = () => {
    const d = departments.find((item) => item._id === selectedDeptId);
    return d ? (d.shortName ? `${d.name} (${d.shortName})` : d.name) : 'Select Department';
  };

  const openPicker = (type, list) => {
    setPickerModal({ visible: true, type, data: list });
  };

  const handleSelectItem = (id) => {
    if (pickerModal.type === 'Department') {
      setSelectedDeptId(id);
    } else if (pickerModal.type === 'Block') {
      setSelectedBlockId(id);
    } else if (pickerModal.type === 'Room') {
      setSelectedRoomId(id);
    }
    setPickerModal({ visible: false, type: '', data: [] });
  };

  if (user?.role?.name !== 'User') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: colors.background }}>
        <Ionicons name="shield-alert-outline" size={56} color="#F59E0B" />
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 14 }}>
          Access Restricted
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
          Only users can raise complaints. Superadmins assign complaints and staff members work on them.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <View style={styles.iconCircle}>
          <Ionicons name="add-circle" size={24} color={colors.primaryLight} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Raise a Maintenance Ticket</Text>
          <Text style={styles.subtitle}>
            Submit issues related to computers, network, lab hardware, or campus facilities.
          </Text>
        </View>
      </View>

      {/* 1. Category Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Select Issue Category</Text>
        <View style={styles.categoryGrid}>
          {COMPLAINT_TYPES.map((cat) => {
            const isSelected = complaintType === cat.name;
            return (
              <TouchableOpacity
                key={cat.name}
                style={[
                  styles.categoryCard,
                  isSelected && { borderColor: cat.color, backgroundColor: `${cat.color}15` }
                ]}
                onPress={() => setComplaintType(cat.name)}
              >
                <View style={[styles.catIconWrap, { backgroundColor: `${cat.color}25` }]}>
                  <Ionicons name={cat.icon} size={20} color={cat.color} />
                </View>
                <Text style={[styles.catName, isSelected && { color: cat.color, fontWeight: '700' }]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 2. Location Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Location Information</Text>

        {/* Department */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Department</Text>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => openPicker('Department', departments)}
          >
            <Ionicons name="school-outline" size={18} color={colors.primaryLight} />
            <Text style={styles.selectBtnText} numberOfLines={1}>
              {getSelectedDeptName()}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Block */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Campus Block</Text>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => openPicker('Block', blocks)}
          >
            <Ionicons name="business-outline" size={18} color={colors.primaryLight} />
            <Text style={styles.selectBtnText} numberOfLines={1}>
              {getSelectedBlockName()}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Room */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Room / Lab Number</Text>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => openPicker('Room', rooms)}
          >
            <Ionicons name="location-outline" size={18} color={colors.primaryLight} />
            <Text style={styles.selectBtnText} numberOfLines={1}>
              {getSelectedRoomName()}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Description / Remarks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Problem Description</Text>
        <TextInput
          style={styles.textArea}
          value={remarks}
          onChangeText={setRemarks}
          placeholder="Please describe the malfunction, error messages, or affected equipment numbers..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <>
            <Ionicons name="paper-plane" size={18} color="#FFF" />
            <Text style={styles.submitBtnText}>Submit Complaint Ticket</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Selection Modal */}
      <Modal visible={pickerModal.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {pickerModal.type}</Text>
              <TouchableOpacity
                onPress={() => setPickerModal({ visible: false, type: '', data: [] })}
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {pickerModal.data.map((item) => {
                const label = item.roomNumber || item.name || '';
                return (
                  <TouchableOpacity
                    key={item._id}
                    style={styles.modalItem}
                    onPress={() => handleSelectItem(item._id)}
                  >
                    <Text style={styles.modalItemText}>{label}</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successBox}>
            <View style={styles.successIconWrap}>
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Ticket Raised Successfully!</Text>
            <Text style={styles.successDesc}>
              Your ticket has been logged and queued for assignment to maintenance staff.
            </Text>

            <TouchableOpacity
              style={styles.successDoneBtn}
              onPress={() => {
                setSuccessModal(false);
                if (onSuccess) onSuccess();
              }}
            >
              <Text style={styles.successDoneText}>View My Tickets</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 20,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 10,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  catIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  catName: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  selectBtnText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
  },
  textArea: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    color: colors.textPrimary,
    fontSize: 14,
    minHeight: 100,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: 12,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  modalItemText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  successBox: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  successIconWrap: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  successDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  successDoneBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  successDoneText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
