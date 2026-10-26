export const initialDepartments = [
  { _id: 'dept_cs', name: 'Computer Science', shortName: 'CS' },
  { _id: 'dept_it', name: 'Information Technology', shortName: 'IT' },
  { _id: 'dept_ece', name: 'Electronics & Communication', shortName: 'ECE' },
  { _id: 'dept_eee', name: 'Electrical & Electronics', shortName: 'EEE' },
  { _id: 'dept_me', name: 'Mechanical Engineering', shortName: 'ME' }
];

export const initialProgrammes = [
  { _id: 'prog_btcs', name: 'B.Tech Computer Science', shortName: 'B.Tech CS', department: 'dept_cs' },
  { _id: 'prog_mtse', name: 'M.Tech Software Engineering', shortName: 'M.Tech SE', department: 'dept_cs' },
  { _id: 'prog_btit', name: 'B.Tech Information Technology', shortName: 'B.Tech IT', department: 'dept_it' },
  { _id: 'prog_btece', name: 'B.Tech Electronics & Communication', shortName: 'B.Tech ECE', department: 'dept_ece' },
  { _id: 'prog_bteee', name: 'B.Tech Electrical Engineering', shortName: 'B.Tech EEE', department: 'dept_eee' },
  { _id: 'prog_btme', name: 'B.Tech Mechanical Engineering', shortName: 'B.Tech ME', department: 'dept_me' }
];

export const initialBlocks = [
  { _id: 'blk_1', name: 'APJ Abdul Kalam IT Block', department: initialDepartments[0], programme: initialProgrammes[0] },
  { _id: 'blk_2', name: 'CV Raman Science Block', department: initialDepartments[2], programme: initialProgrammes[3] },
  { _id: 'blk_3', name: 'Visvesvaraya Tech Block', department: initialDepartments[3], programme: initialProgrammes[4] },
  { _id: 'blk_4', name: 'Main Academic Building', department: initialDepartments[1], programme: initialProgrammes[2] },
  { _id: 'blk_5', name: 'Ramanujan Computing Complex', department: initialDepartments[0], programme: initialProgrammes[1] }
];

export const initialRooms = [
  { _id: 'rm_1', roomNumber: 'Lab 101 - AI & ML Lab', block: initialBlocks[0], department: initialDepartments[0] },
  { _id: 'rm_2', roomNumber: 'Room 204 - Lecture Hall', block: initialBlocks[0], department: initialDepartments[0] },
  { _id: 'rm_3', roomNumber: 'Server Room 102', block: initialBlocks[3], department: initialDepartments[1] },
  { _id: 'rm_4', roomNumber: 'Electronics Lab 301', block: initialBlocks[1], department: initialDepartments[2] },
  { _id: 'rm_5', roomNumber: 'Electrical Workshop 105', block: initialBlocks[2], department: initialDepartments[3] },
  { _id: 'rm_6', roomNumber: 'Cisco Networking Lab 305', block: initialBlocks[3], department: initialDepartments[1] },
  { _id: 'rm_7', roomNumber: 'CAD/CAM Software Lab 202', block: initialBlocks[2], department: initialDepartments[4] },
  { _id: 'rm_8', roomNumber: 'Seminar Hall A', block: initialBlocks[4], department: initialDepartments[0] },
  { _id: 'rm_9', roomNumber: 'Faculty Cabin 104', block: initialBlocks[1], department: initialDepartments[2] }
];

export const initialUsers = [
  { _id: 'usr_super', username: 'superadmin', email: 'superadmin@tms.com', phone: '1234567890', role: { name: 'Superadmin' }, department: initialDepartments[0] },
  { _id: 'usr_student', username: 'user', email: 'user@tms.com', phone: '9876543210', role: { name: 'User' }, department: initialDepartments[0] },
  { _id: 'usr_faculty', username: 'dr_sharma', email: 'faculty@tms.com', phone: '9876543211', role: { name: 'Faculty' }, department: initialDepartments[0] },
  { _id: 'usr_network', username: 'alex_network', email: 'network@tms.com', phone: '9876543212', role: { name: 'Networking Staff' }, department: initialDepartments[1] },
  { _id: 'usr_plumber', username: 'ramesh_plumber', email: 'plumber@tms.com', phone: '9876543213', role: { name: 'Plumber' }, department: initialDepartments[4] },
  { _id: 'usr_elec', username: 'suresh_electrician', email: 'electrician@tms.com', phone: '9876543214', role: { name: 'Electrician' }, department: initialDepartments[3] },
  { _id: 'usr_dev', username: 'vikram_developer', email: 'dev@tms.com', phone: '9876543215', role: { name: 'Software Developer' }, department: initialDepartments[0] }
];

export let mockComplaints = [
  {
    _id: 'cmp_1',
    block: initialBlocks[0],
    room: initialRooms[0],
    complaintType: 'PC Hardware',
    remarks: 'Monitor display flickering and PC 12 power supply failure during lab session.',
    status: 'Pending',
    raisedBy: initialUsers[1],
    department: initialDepartments[0],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    _id: 'cmp_2',
    block: initialBlocks[3],
    room: initialRooms[2],
    complaintType: 'Network',
    remarks: 'High network latency and intermittent ethernet disconnections on Rack 4, Switch B.',
    status: 'Assigned',
    raisedBy: initialUsers[2],
    assignedTo: initialUsers[3],
    department: initialDepartments[1],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    _id: 'cmp_3',
    block: initialBlocks[0],
    room: initialRooms[1],
    complaintType: 'Electrical',
    remarks: 'Ceiling projector power socket is damaged and short-circuiting.',
    status: 'In-Progress',
    raisedBy: initialUsers[2],
    assignedTo: initialUsers[5],
    department: initialDepartments[3],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    _id: 'cmp_4',
    block: initialBlocks[1],
    room: initialRooms[3],
    complaintType: 'Plumbing',
    remarks: 'Water pipe leakage under washbasin counter in electronics lab.',
    status: 'Completed',
    raisedBy: initialUsers[1],
    assignedTo: initialUsers[4],
    department: initialDepartments[4],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    _id: 'cmp_5',
    block: initialBlocks[0],
    room: initialRooms[0],
    complaintType: 'PC Software',
    remarks: 'PyTorch and CUDA drivers crash during GPU matrix multiplication.',
    status: 'Assigned',
    raisedBy: initialUsers[1],
    assignedTo: initialUsers[6],
    department: initialDepartments[0],
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString()
  },
  {
    _id: 'cmp_6',
    block: initialBlocks[3],
    room: initialRooms[5],
    complaintType: 'Network',
    remarks: 'Wi-Fi Access Point 03 not emitting 5GHz signal for students.',
    status: 'Pending',
    raisedBy: initialUsers[1],
    department: initialDepartments[1],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    _id: 'cmp_7',
    block: initialBlocks[2],
    room: initialRooms[6],
    complaintType: 'Application Issues',
    remarks: 'AutoCAD license server connection error on systems 15 to 25.',
    status: 'In-Progress',
    raisedBy: initialUsers[2],
    assignedTo: initialUsers[6],
    department: initialDepartments[0],
    createdAt: new Date(Date.now() - 3600000 * 60).toISOString()
  },
  {
    _id: 'cmp_8',
    block: initialBlocks[4],
    room: initialRooms[7],
    complaintType: 'Electronics',
    remarks: 'Podium wireless microphone audio cuts out repeatedly during lectures.',
    status: 'On-Hold',
    raisedBy: initialUsers[2],
    assignedTo: initialUsers[3],
    department: initialDepartments[2],
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
  }
];

export const addMockComplaint = (complaintData, currentUser) => {
  const block = initialBlocks.find(b => b._id === complaintData.block) || { name: 'Main Block' };
  const room = initialRooms.find(r => r._id === complaintData.room) || { roomNumber: 'Room 101' };
  const dept = initialDepartments.find(d => d._id === complaintData.department) || initialDepartments[0];

  const newC = {
    _id: 'cmp_' + Date.now(),
    block,
    room,
    complaintType: complaintData.complaintType || 'Other',
    remarks: complaintData.remarks,
    status: 'Pending',
    raisedBy: currentUser,
    department: dept,
    createdAt: new Date().toISOString()
  };
  mockComplaints.unshift(newC);
  return newC;
};

export const updateMockComplaintStatus = (id, newStatus) => {
  const item = mockComplaints.find(c => c._id === id);
  if (item) {
    item.status = newStatus;
  }
  return item;
};

export const assignMockComplaint = (id, assignedToId) => {
  const item = mockComplaints.find(c => c._id === id);
  const staff = initialUsers.find(u => u._id === assignedToId);
  if (item) {
    item.assignedTo = staff;
    item.status = 'Assigned';
  }
  return item;
};

// Department Helpers
export const addMockDepartment = (deptData) => {
  const newDept = {
    _id: 'dept_' + Date.now(),
    name: deptData.name,
    shortName: deptData.shortName || deptData.name.slice(0, 4).toUpperCase()
  };
  initialDepartments.unshift(newDept);
  return newDept;
};

export const deleteMockDepartment = (id) => {
  const idx = initialDepartments.findIndex(d => d._id === id);
  if (idx !== -1) initialDepartments.splice(idx, 1);
  return { message: 'Department deleted' };
};

// Block Helpers
export const addMockBlock = (blockData) => {
  const dept = initialDepartments.find(d => d._id === blockData.department) || initialDepartments[0];
  const prog = initialProgrammes.find(p => p._id === blockData.programme) || initialProgrammes[0];
  const newBlock = {
    _id: 'blk_' + Date.now(),
    name: blockData.name,
    department: dept,
    programme: prog
  };
  initialBlocks.unshift(newBlock);
  return newBlock;
};

export const deleteMockBlock = (id) => {
  const idx = initialBlocks.findIndex(b => b._id === id);
  if (idx !== -1) initialBlocks.splice(idx, 1);
  return { message: 'Block deleted' };
};

// Room Helpers
export const addMockRoom = (roomData) => {
  const blk = initialBlocks.find(b => b._id === roomData.block) || initialBlocks[0];
  const dept = initialDepartments.find(d => d._id === roomData.department) || blk.department || initialDepartments[0];
  const prog = initialProgrammes.find(p => p._id === roomData.programme) || blk.programme || initialProgrammes[0];
  const newRoom = {
    _id: 'rm_' + Date.now(),
    roomNumber: roomData.roomNumber,
    block: blk,
    department: dept,
    programme: prog
  };
  initialRooms.unshift(newRoom);
  return newRoom;
};

export const deleteMockRoom = (id) => {
  const idx = initialRooms.findIndex(r => r._id === id);
  if (idx !== -1) initialRooms.splice(idx, 1);
  return { message: 'Room deleted' };
};

// User Helpers
export const addMockUser = (userData) => {
  const dept = initialDepartments.find(d => d._id === userData.department) || initialDepartments[0];
  const newUser = {
    _id: 'usr_' + Date.now(),
    username: userData.username,
    email: userData.email,
    phone: userData.phone || '9999999999',
    role: { name: userData.role || 'User' },
    department: dept
  };
  initialUsers.unshift(newUser);
  return newUser;
};

export const deleteMockUser = (id) => {
  const idx = initialUsers.findIndex(u => u._id === id);
  if (idx !== -1) initialUsers.splice(idx, 1);
  return { message: 'User deleted' };
};
