import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { masterAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TABS = ['Blocks', 'Rooms', 'Departments', 'Users'];

export default function MasterDataScreen() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.name === 'Superadmin';

  const [activeTab, setActiveTab] = useState(0);
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlockFilter, setSelectedBlockFilter] = useState('All');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // 'block', 'room', 'dept', 'user'
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formShortName, setFormShortName] = useState('');
  const [formRoomNumber, setFormRoomNumber] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formDeptId, setFormDeptId] = useState('');
  const [formProgId, setFormProgId] = useState('');
  const [formBlockId, setFormBlockId] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [blockList, roomList, deptList, progList, userList, roleList] = await Promise.all([
        masterAPI.getBlocks(),
        masterAPI.getRooms(),
        masterAPI.getDepartments(),
        masterAPI.getProgrammes(),
        masterAPI.getUsers(),
        masterAPI.getRoles()
      ]);
      setBlocks(blockList || []);
      setRooms(roomList || []);
      setDepartments(deptList || []);
      setProgrammes(progList || []);
      setUsers(userList || []);
      setRoles(roleList || []);
    } catch (e) {
      console.warn('MasterData load error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Open Add Modal
  const handleOpenAdd = (type) => {
    setModalType(type);
    setEditingItem(null);
    setFormName('');
    setFormShortName('');
    setFormRoomNumber('');
    setFormEmail('');
    setFormPassword('123456');
    setFormRole(roles[0]?.name || 'User');
    setFormDeptId(departments[0]?._id || '');
    setFormProgId(programmes[0]?._id || '');
    setFormBlockId(blocks[0]?._id || '');
    setModalVisible(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (type, item) => {
    setModalType(type);
    setEditingItem(item);
    if (type === 'block') {
      setFormName(item.name || '');
      setFormDeptId(item.department?._id || item.department || departments[0]?._id || '');
      setFormProgId(item.programme?._id || item.programme || programmes[0]?._id || '');
    } else if (type === 'room') {
      setFormRoomNumber(item.roomNumber || '');
      setFormBlockId(item.block?._id || item.block || blocks[0]?._id || '');
      setFormDeptId(item.department?._id || item.department || departments[0]?._id || '');
      setFormProgId(item.programme?._id || item.programme || programmes[0]?._id || '');
    } else if (type === 'dept') {
      setFormName(item.name || '');
      setFormShortName(item.shortName || '');
    } else if (type === 'user') {
      setFormName(item.username || '');
      setFormEmail(item.email || '');
      setFormPassword('');
      setFormRole(item.role?.name || 'User');
      setFormDeptId(item.department?._id || item.department || departments[0]?._id || '');
    }
    setModalVisible(true);
  };

  // Handle Form Submission (Create or Update)
  const handleSubmitForm = async () => {
    setSubmitting(true);
    try {
      if (modalType === 'block') {
        if (!formName.trim()) {
          Alert.alert('Validation', 'Block name is required.');
          setSubmitting(false);
          return;
        }
        const payload = {
          name: formName.trim(),
          department: formDeptId || departments[0]?._id,
          programme: formProgId || programmes[0]?._id
        };
        if (editingItem) {
          await masterAPI.updateBlock(editingItem._id, payload);
          Alert.alert('Success', 'Block updated successfully');
        } else {
          await masterAPI.createBlock(payload);
          Alert.alert('Success', 'Block created successfully');
        }
      } else if (modalType === 'room') {
        if (!formRoomNumber.trim()) {
          Alert.alert('Validation', 'Room number is required.');
          setSubmitting(false);
          return;
        }
        const payload = {
          roomNumber: formRoomNumber.trim(),
          block: formBlockId || blocks[0]?._id,
          department: formDeptId || departments[0]?._id,
          programme: formProgId || programmes[0]?._id
        };
        if (editingItem) {
          await masterAPI.updateRoom(editingItem._id, payload);
          Alert.alert('Success', 'Room updated successfully');
        } else {
          await masterAPI.createRoom(payload);
          Alert.alert('Success', 'Room created successfully');
        }
      } else if (modalType === 'dept') {
        if (!formName.trim() || !formShortName.trim()) {
          Alert.alert('Validation', 'Department name and short name are required.');
          setSubmitting(false);
          return;
        }
        const payload = {
          name: formName.trim(),
          shortName: formShortName.trim()
        };
        if (editingItem) {
          await masterAPI.updateDepartment(editingItem._id, payload);
          Alert.alert('Success', 'Department updated successfully');
        } else {
          await masterAPI.createDepartment(payload);
          Alert.alert('Success', 'Department created successfully');
        }
      } else if (modalType === 'user') {
        if (!formName.trim() || !formEmail.trim()) {
          Alert.alert('Validation', 'Username and email are required.');
          setSubmitting(false);
          return;
        }
        const matchedRole = roles.find(r => r.name === formRole);
        const payload = {
          username: formName.trim(),
          email: formEmail.trim(),
          password: formPassword || '123456',
          role: matchedRole?._id || formRole,
          department: formDeptId || departments[0]?._id
        };
        if (editingItem) {
          await masterAPI.updateUser(editingItem._id, payload);
          Alert.alert('Success', 'User updated successfully');
        } else {
          await masterAPI.createUser(payload);
          Alert.alert('Success', 'User created successfully');
        }
      }

      setModalVisible(false);
      loadAllData();
    } catch (err) {
      Alert.alert('Error', err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handlers with Confirmation
  const handleDeleteItem = (type, item) => {
    const title = type === 'block' ? `Delete Block: ${item.name}`
      : type === 'room' ? `Delete Room: ${item.roomNumber}`
      : type === 'dept' ? `Delete Department: ${item.name}`
      : `Delete User: ${item.username}`;

    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this ${type}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (type === 'block') await masterAPI.deleteBlock(item._id);
              else if (type === 'room') await masterAPI.deleteRoom(item._id);
              else if (type === 'dept') await masterAPI.deleteDepartment(item._id);
              else if (type === 'user') await masterAPI.deleteUser(item._id);

              Alert.alert('Deleted', `${type.toUpperCase()} removed successfully`);
              loadAllData();
            } catch (err) {
              Alert.alert('Delete Failed', err.message || 'Could not delete item');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Segmented Tabs */}
      <View style={styles.tabContainer}>
        {TABS.map((tab, idx) => {
          const isSelected = activeTab === idx;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
              onPress={() => {
                setActiveTab(idx);
                setSearchQuery('');
              }}
            >
              <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Action Bar (Search & Add Button) */}
      <View style={styles.actionBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${TABS[activeTab]}...`}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {isSuperAdmin && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              const types = ['block', 'room', 'dept', 'user'];
              handleOpenAdd(types[activeTab]);
            }}
          >
            <Ionicons name="add" size={18} color="#FFF" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading campus master data...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* TAB 0: BLOCKS */}
          {activeTab === 0 && (
            <View style={styles.section}>
              <Text style={styles.countHeader}>
                {blocks.length} Campus Blocks Registered
              </Text>

              {blocks
                .filter(b => (b.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
                .map((b) => {
                  const bRooms = rooms.filter(r => (r.block?._id || r.block) === b._id);
                  return (
                    <View key={b._id} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <View style={styles.iconCircle}>
                          <Ionicons name="business" size={20} color={colors.primaryLight} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cardTitle}>{b.name}</Text>
                          <Text style={styles.cardSub}>
                            Dept: {b.department?.name || 'All'} • Prog: {b.programme?.name || 'All'}
                          </Text>
                        </View>
                        {isSuperAdmin && (
                          <View style={styles.actionButtons}>
                            <TouchableOpacity
                              style={styles.actionIconBtn}
                              onPress={() => handleOpenEdit('block', b)}
                            >
                              <Ionicons name="pencil" size={16} color={colors.primaryLight} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.actionIconBtn, styles.deleteBtn]}
                              onPress={() => handleDeleteItem('block', b)}
                            >
                              <Ionicons name="trash-outline" size={16} color="#EF4444" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>

                      {/* Room chips */}
                      <View style={styles.roomBadgeRow}>
                        <Text style={styles.roomBadgeLabel}>{bRooms.length} Rooms in this block:</Text>
                      </View>
                      <View style={styles.roomChipsWrapper}>
                        {bRooms.length === 0 ? (
                          <Text style={styles.emptySubText}>No rooms added yet</Text>
                        ) : (
                          bRooms.map(r => (
                            <View key={r._id} style={styles.roomChip}>
                              <Ionicons name="location-outline" size={12} color={colors.secondary} />
                              <Text style={styles.roomChipText}>{r.roomNumber}</Text>
                            </View>
                          ))
                        )}
                      </View>
                    </View>
                  );
                })}
            </View>
          )}

          {/* TAB 1: ROOMS */}
          {activeTab === 1 && (
            <View style={styles.section}>
              {/* Block Filter Chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <TouchableOpacity
                  style={[styles.filterChip, selectedBlockFilter === 'All' && styles.filterChipActive]}
                  onPress={() => setSelectedBlockFilter('All')}
                >
                  <Text style={[styles.filterChipText, selectedBlockFilter === 'All' && styles.filterChipTextActive]}>
                    All Blocks ({rooms.length})
                  </Text>
                </TouchableOpacity>
                {blocks.map(b => (
                  <TouchableOpacity
                    key={b._id}
                    style={[styles.filterChip, selectedBlockFilter === b._id && styles.filterChipActive]}
                    onPress={() => setSelectedBlockFilter(b._id)}
                  >
                    <Text style={[styles.filterChipText, selectedBlockFilter === b._id && styles.filterChipTextActive]}>
                      {b.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.countHeader}>
                {rooms.length} Campus Rooms & Laboratories
              </Text>

              {rooms
                .filter(r => {
                  const matchSearch = (r.roomNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (r.block?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
                  const matchBlock = selectedBlockFilter === 'All' || (r.block?._id || r.block) === selectedBlockFilter;
                  return matchSearch && matchBlock;
                })
                .map((r) => (
                  <View key={r._id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={[styles.iconCircle, { backgroundColor: '#0EA5E920' }]}>
                        <Ionicons name="location" size={20} color="#0EA5E9" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{r.roomNumber}</Text>
                        <Text style={styles.cardSub}>
                          Block: {r.block?.name || 'Unassigned'}
                        </Text>
                        <Text style={styles.cardSubMinor}>
                          Dept: {r.department?.name || 'General'}
                        </Text>
                      </View>
                      {isSuperAdmin && (
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={styles.actionIconBtn}
                            onPress={() => handleOpenEdit('room', r)}
                          >
                            <Ionicons name="pencil" size={16} color={colors.primaryLight} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionIconBtn, styles.deleteBtn]}
                            onPress={() => handleDeleteItem('room', r)}
                          >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
            </View>
          )}

          {/* TAB 2: DEPARTMENTS */}
          {activeTab === 2 && (
            <View style={styles.section}>
              <Text style={styles.countHeader}>{departments.length} Academic Departments</Text>
              {departments
                .filter(d => (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (d.shortName || '').toLowerCase().includes(searchQuery.toLowerCase()))
                .map((d) => (
                  <View key={d._id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={[styles.iconCircle, { backgroundColor: '#10B98120' }]}>
                        <Text style={styles.deptShort}>{d.shortName || 'D'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{d.name}</Text>
                        <Text style={styles.cardSub}>Code: {d.shortName || 'N/A'}</Text>
                      </View>
                      {isSuperAdmin && (
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={styles.actionIconBtn}
                            onPress={() => handleOpenEdit('dept', d)}
                          >
                            <Ionicons name="pencil" size={16} color={colors.primaryLight} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionIconBtn, styles.deleteBtn]}
                            onPress={() => handleDeleteItem('dept', d)}
                          >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
            </View>
          )}

          {/* TAB 3: USERS */}
          {activeTab === 3 && (
            <View style={styles.section}>
              {/* Role Filter Chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {['All', 'Superadmin', 'User', 'Faculty', 'Networking Staff', 'Electrician', 'Plumber', 'Software Developer'].map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.filterChip, selectedRoleFilter === r && styles.filterChipActive]}
                    onPress={() => setSelectedRoleFilter(r)}
                  >
                    <Text style={[styles.filterChipText, selectedRoleFilter === r && styles.filterChipTextActive]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.countHeader}>
                {users.length} Registered Users & Technicians
              </Text>

              {users
                .filter(u => {
                  const matchSearch = (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
                  const userRole = u.role?.name || 'User';
                  const matchRole = selectedRoleFilter === 'All' || userRole === selectedRoleFilter;
                  return matchSearch && matchRole;
                })
                .map((u) => (
                  <View key={u._id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.userAvatar}>
                        <Ionicons name="person" size={20} color={colors.primaryLight} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{u.username}</Text>
                        <Text style={styles.cardSub}>{u.email}</Text>
                        <View style={styles.userBadgeRow}>
                          <View style={styles.roleTag}>
                            <Text style={styles.roleTagText}>{u.role?.name || 'User'}</Text>
                          </View>
                          {u.department?.name && (
                            <Text style={styles.deptSubText}>• {u.department.name}</Text>
                          )}
                        </View>
                      </View>
                      {isSuperAdmin && (
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={styles.actionIconBtn}
                            onPress={() => handleOpenEdit('user', u)}
                          >
                            <Ionicons name="pencil" size={16} color={colors.primaryLight} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionIconBtn, styles.deleteBtn]}
                            onPress={() => handleDeleteItem('user', u)}
                          >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* CRUD MODAL FOR ADD / EDIT */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Edit' : 'Add New'} {modalType.toUpperCase()}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* BLOCK FORM */}
              {modalType === 'block' && (
                <View>
                  <Text style={styles.label}>Block Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Ramanujan Complex, APJ Block"
                    placeholderTextColor={colors.textMuted}
                    value={formName}
                    onChangeText={setFormName}
                  />

                  <Text style={styles.label}>Department</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                    {departments.map(d => (
                      <TouchableOpacity
                        key={d._id}
                        style={[styles.pickerChip, formDeptId === d._id && styles.pickerChipActive]}
                        onPress={() => setFormDeptId(d._id)}
                      >
                        <Text style={[styles.pickerChipText, formDeptId === d._id && styles.pickerChipTextActive]}>
                          {d.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* ROOM FORM */}
              {modalType === 'room' && (
                <View>
                  <Text style={styles.label}>Room Number / Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Lab 101, Seminar Hall 2"
                    placeholderTextColor={colors.textMuted}
                    value={formRoomNumber}
                    onChangeText={setFormRoomNumber}
                  />

                  <Text style={styles.label}>Select Block *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                    {blocks.map(b => (
                      <TouchableOpacity
                        key={b._id}
                        style={[styles.pickerChip, formBlockId === b._id && styles.pickerChipActive]}
                        onPress={() => setFormBlockId(b._id)}
                      >
                        <Text style={[styles.pickerChipText, formBlockId === b._id && styles.pickerChipTextActive]}>
                          {b.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* DEPARTMENT FORM */}
              {modalType === 'dept' && (
                <View>
                  <Text style={styles.label}>Department Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Computer Science & Engineering"
                    placeholderTextColor={colors.textMuted}
                    value={formName}
                    onChangeText={setFormName}
                  />

                  <Text style={styles.label}>Short Name / Code *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. CSE, IT, ECE"
                    placeholderTextColor={colors.textMuted}
                    value={formShortName}
                    onChangeText={setFormShortName}
                    autoCapitalize="characters"
                  />
                </View>
              )}

              {/* USER FORM */}
              {modalType === 'user' && (
                <View>
                  <Text style={styles.label}>Username *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. john_doe"
                    placeholderTextColor={colors.textMuted}
                    value={formName}
                    onChangeText={setFormName}
                  />

                  <Text style={styles.label}>Email Address *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. john@tms.com"
                    placeholderTextColor={colors.textMuted}
                    value={formEmail}
                    onChangeText={setFormEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  {!editingItem && (
                    <>
                      <Text style={styles.label}>Password *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Default: 123456"
                        placeholderTextColor={colors.textMuted}
                        value={formPassword}
                        onChangeText={setFormPassword}
                        secureTextEntry
                      />
                    </>
                  )}

                  <Text style={styles.label}>Role *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                    {['Superadmin', 'User', 'Faculty', 'Networking Staff', 'Electrician', 'Plumber', 'Software Developer'].map(r => (
                      <TouchableOpacity
                        key={r}
                        style={[styles.pickerChip, formRole === r && styles.pickerChipActive]}
                        onPress={() => setFormRole(r)}
                      >
                        <Text style={[styles.pickerChipText, formRole === r && styles.pickerChipTextActive]}>
                          {r}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSubmitForm}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {editingItem ? 'Save Changes' : 'Create'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 3,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 13,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 10,
    gap: 6,
  },
  addBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 12,
  },
  content: {
    padding: 14,
    paddingBottom: 40,
  },
  section: {
    gap: 12,
  },
  countHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight + '25',
    borderColor: colors.primaryLight,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  filterChipTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deptShort: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 12,
    color: colors.textMuted,
  },
  cardSubMinor: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    borderColor: '#EF444450',
    backgroundColor: '#EF444415',
  },
  roomBadgeRow: {
    marginTop: 10,
    marginBottom: 6,
  },
  roomBadgeLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  roomChipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  emptySubText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  roomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  roomChipText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  roleTag: {
    backgroundColor: colors.primary + '25',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary + '50',
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  deptSubText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  modalBody: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFF',
    fontSize: 14,
  },
  chipRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  pickerChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  pickerChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  pickerChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  pickerChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 14,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
