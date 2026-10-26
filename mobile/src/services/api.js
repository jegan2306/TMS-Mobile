import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl, getCurrentCachedApiUrl } from '../config/apiConfig';
import {
  initialDepartments,
  initialProgrammes,
  initialBlocks,
  initialRooms,
  initialUsers,
  mockComplaints,
  addMockComplaint,
  updateMockComplaintStatus,
  assignMockComplaint,
  addMockDepartment,
  deleteMockDepartment,
  addMockBlock,
  deleteMockBlock,
  addMockRoom,
  deleteMockRoom,
  addMockUser,
  deleteMockUser
} from './mockData';

let authToken = null;
let isOfflineMode = false;
let onUnauthorizedCallback = null;

export const setOnUnauthorizedCallback = (callback) => {
  onUnauthorizedCallback = callback;
};

export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => authToken;
export const getIsOfflineMode = () => isOfflineMode;

const makeRequest = async (endpoint, options = {}) => {
  const baseUrl = await getApiBaseUrl();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    isOfflineMode = false;

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        setAuthToken(null);
        AsyncStorage.removeItem('@tms_auth_token').catch(() => {});
        AsyncStorage.removeItem('@tms_auth_user').catch(() => {});
        if (onUnauthorizedCallback) {
          try {
            onUnauthorizedCallback();
          } catch (e) {
            console.warn('Error in onUnauthorizedCallback:', e);
          }
        }
      }
      const err = new Error(errData.message || `Request failed with status ${response.status}`);
      err.status = response.status;
      err.data = errData;
      throw err;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[TMS API] Network call to ${baseUrl}${endpoint} failed:`, error.message);
    isOfflineMode = true;
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    try {
      const data = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (data && data.token) {
        setAuthToken(data.token);
      }
      return data;
    } catch (err) {
      // If server unreachable, check mock credentials
      console.log('Falling back to local mock authentication...');
      const user = initialUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        const dummyToken = 'mock_token_' + user._id;
        setAuthToken(dummyToken);
        return {
          message: 'Login successful (Offline Demo Mode)',
          token: dummyToken,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role,
            department: user.department
          },
          isMock: true
        };
      }
      throw err;
    }
  },

  getMe: async () => {
    try {
      return await makeRequest('/api/auth/me');
    } catch (err) {
      if (err.status === 401) {
        throw err;
      }
      return null;
    }
  }
};

// Complaints API
export const complaintAPI = {
  getAll: async (params = {}) => {
    try {
      let queryString = '';
      if (params.status && params.status !== 'All') {
        queryString += `?status=${encodeURIComponent(params.status)}`;
      }
      const data = await makeRequest(`/api/complaints${queryString}`);
      return data;
    } catch (err) {
      // Return filtered mock data
      let list = [...mockComplaints];
      if (params.status && params.status !== 'All') {
        list = list.filter(c => c.status === params.status);
      }
      return list;
    }
  },

  getById: async (id) => {
    try {
      return await makeRequest(`/api/complaints/${id}`);
    } catch (err) {
      return mockComplaints.find(c => c._id === id) || null;
    }
  },

  create: async (complaintData, currentUser) => {
    try {
      return await makeRequest('/api/complaints', {
        method: 'POST',
        body: JSON.stringify(complaintData)
      });
    } catch (err) {
      const newC = addMockComplaint(complaintData, currentUser);
      return {
        message: 'Complaint raised successfully (Offline Mode)',
        complaint: newC
      };
    }
  },

  updateStatus: async (id, status) => {
    try {
      return await makeRequest(`/api/complaints/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    } catch (err) {
      const updated = updateMockComplaintStatus(id, status);
      return {
        message: 'Complaint status updated (Offline Mode)',
        complaint: updated
      };
    }
  },

  assign: async (id, assignedTo) => {
    try {
      return await makeRequest(`/api/complaints/${id}/assign`, {
        method: 'PUT',
        body: JSON.stringify({ assignedTo })
      });
    } catch (err) {
      const updated = assignMockComplaint(id, assignedTo);
      return {
        message: 'Complaint assigned successfully (Offline Mode)',
        complaint: updated
      };
    }
  },

  delete: async (id) => {
    try {
      return await makeRequest(`/api/complaints/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      const idx = mockComplaints.findIndex(c => c._id === id);
      if (idx !== -1) mockComplaints.splice(idx, 1);
      return { message: 'Complaint deleted (Offline Mode)' };
    }
  }
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    try {
      return await makeRequest('/api/dashboard/stats');
    } catch (err) {
      // Calculate stats from mock data
      const total = mockComplaints.length;
      const pending = mockComplaints.filter(c => c.status === 'Pending').length;
      const assigned = mockComplaints.filter(c => c.status === 'Assigned').length;
      const inProgress = mockComplaints.filter(c => c.status === 'In-Progress').length;
      const completed = mockComplaints.filter(c => c.status === 'Completed').length;
      const onHold = mockComplaints.filter(c => c.status === 'On-Hold').length;

      return {
        totalComplaints: total,
        pendingComplaints: pending,
        assignedComplaints: assigned,
        inProgressComplaints: inProgress,
        completedComplaints: completed,
        onHoldComplaints: onHold
      };
    }
  }
};

// Master Data APIs
export const masterAPI = {
  // Departments
  getDepartments: async () => {
    try {
      return await makeRequest('/api/departments');
    } catch (err) {
      return initialDepartments;
    }
  },

  createDepartment: async (deptData) => {
    try {
      return await makeRequest('/api/departments', {
        method: 'POST',
        body: JSON.stringify(deptData)
      });
    } catch (err) {
      const newD = addMockDepartment(deptData);
      return { message: 'Department created (Offline Mode)', department: newD };
    }
  },

  updateDepartment: async (id, deptData) => {
    try {
      return await makeRequest(`/api/departments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(deptData)
      });
    } catch (err) {
      const found = initialDepartments.find(d => d._id === id);
      if (found) {
        found.name = deptData.name || found.name;
        found.shortName = deptData.shortName || found.shortName;
      }
      return { message: 'Department updated (Offline Mode)', department: found };
    }
  },

  deleteDepartment: async (id) => {
    try {
      return await makeRequest(`/api/departments/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      return deleteMockDepartment(id);
    }
  },

  // Programmes
  getProgrammes: async (departmentId) => {
    try {
      const q = departmentId ? `?departmentId=${departmentId}` : '';
      return await makeRequest(`/api/programmes${q}`);
    } catch (err) {
      if (departmentId) {
        return initialProgrammes.filter(p => p.department === departmentId || p.department?._id === departmentId);
      }
      return initialProgrammes;
    }
  },

  createProgramme: async (progData) => {
    try {
      return await makeRequest('/api/programmes', {
        method: 'POST',
        body: JSON.stringify(progData)
      });
    } catch (err) {
      const newP = {
        _id: 'prog_' + Date.now(),
        name: progData.name,
        shortName: progData.shortName || progData.name.slice(0, 5),
        department: progData.department
      };
      initialProgrammes.unshift(newP);
      return { message: 'Programme created (Offline Mode)', programme: newP };
    }
  },

  deleteProgramme: async (id) => {
    try {
      return await makeRequest(`/api/programmes/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      const idx = initialProgrammes.findIndex(p => p._id === id);
      if (idx !== -1) initialProgrammes.splice(idx, 1);
      return { message: 'Programme deleted (Offline Mode)' };
    }
  },

  // Blocks
  getBlocks: async (deptId, progId) => {
    try {
      const params = new URLSearchParams();
      if (deptId) params.append('departmentId', deptId);
      if (progId) params.append('programmeId', progId);
      const q = params.toString() ? `?${params.toString()}` : '';
      return await makeRequest(`/api/blocks${q}`);
    } catch (err) {
      return initialBlocks;
    }
  },

  createBlock: async (blockData) => {
    try {
      return await makeRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify(blockData)
      });
    } catch (err) {
      const newB = addMockBlock(blockData);
      return { message: 'Block created (Offline Mode)', block: newB };
    }
  },

  updateBlock: async (id, blockData) => {
    try {
      return await makeRequest(`/api/blocks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(blockData)
      });
    } catch (err) {
      const found = initialBlocks.find(b => b._id === id);
      if (found) {
        found.name = blockData.name || found.name;
      }
      return { message: 'Block updated (Offline Mode)', block: found };
    }
  },

  deleteBlock: async (id) => {
    try {
      return await makeRequest(`/api/blocks/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      return deleteMockBlock(id);
    }
  },

  // Rooms
  getRooms: async (blockId) => {
    try {
      const q = blockId ? `?blockId=${blockId}` : '';
      return await makeRequest(`/api/rooms${q}`);
    } catch (err) {
      if (blockId) {
        return initialRooms.filter(r => (r.block?._id || r.block) === blockId);
      }
      return initialRooms;
    }
  },

  createRoom: async (roomData) => {
    try {
      return await makeRequest('/api/rooms', {
        method: 'POST',
        body: JSON.stringify(roomData)
      });
    } catch (err) {
      const newR = addMockRoom(roomData);
      return { message: 'Room created (Offline Mode)', room: newR };
    }
  },

  updateRoom: async (id, roomData) => {
    try {
      return await makeRequest(`/api/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(roomData)
      });
    } catch (err) {
      const found = initialRooms.find(r => r._id === id);
      if (found) {
        found.roomNumber = roomData.roomNumber || found.roomNumber;
      }
      return { message: 'Room updated (Offline Mode)', room: found };
    }
  },

  deleteRoom: async (id) => {
    try {
      return await makeRequest(`/api/rooms/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      return deleteMockRoom(id);
    }
  },

  // Users
  getUsers: async (roleName) => {
    try {
      const q = roleName ? `?role=${roleName}` : '';
      return await makeRequest(`/api/users${q}`);
    } catch (err) {
      if (roleName) {
        return initialUsers.filter(u => u.role?.name === roleName);
      }
      return initialUsers;
    }
  },

  createUser: async (userData) => {
    try {
      return await makeRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    } catch (err) {
      const newU = addMockUser(userData);
      return { message: 'User created (Offline Mode)', user: newU };
    }
  },

  updateUser: async (id, userData) => {
    try {
      return await makeRequest(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
    } catch (err) {
      const found = initialUsers.find(u => u._id === id);
      if (found) {
        found.username = userData.username || found.username;
        found.email = userData.email || found.email;
      }
      return { message: 'User updated (Offline Mode)', user: found };
    }
  },

  deleteUser: async (id) => {
    try {
      return await makeRequest(`/api/users/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      return deleteMockUser(id);
    }
  },

  // Roles
  getRoles: async () => {
    try {
      return await makeRequest('/api/roles');
    } catch (err) {
      return [
        { _id: 'r_super', name: 'Superadmin' },
        { _id: 'r_user', name: 'User' },
        { _id: 'r_fac', name: 'Faculty' },
        { _id: 'r_net', name: 'Networking Staff' },
        { _id: 'r_elec', name: 'Electrician' },
        { _id: 'r_plum', name: 'Plumber' },
        { _id: 'r_dev', name: 'Software Developer' }
      ];
    }
  }
};
