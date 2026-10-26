const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('./models/Role');
const User = require('./models/User');
const Department = require('./models/Department');
const Programme = require('./models/Programme');
const Block = require('./models/Block');
const Room = require('./models/Room');
const Complaint = require('./models/Complaint');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ticket_management';

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected Successfully');

    // Clear existing data
    await Complaint.deleteMany({});
    await Room.deleteMany({});
    await Block.deleteMany({});
    await Programme.deleteMany({});
    await Department.deleteMany({});
    await User.deleteMany({});
    await Role.deleteMany({});

    console.log('Cleared existing data.');

    // 1. Create Roles
    const roleList = [
      { name: 'Superadmin' },
      { name: 'User' },
      { name: 'Faculty' },
      { name: 'Networking Staff' },
      { name: 'Plumber' },
      { name: 'Electrician' },
      { name: 'Software Developer' }
    ];
    const roles = await Role.insertMany(roleList);
    console.log('Created Roles:', roles.map(r => r.name).join(', '));

    const roleMap = {};
    roles.forEach(r => { roleMap[r.name] = r._id; });

    // 2. Create Departments
    const deptList = [
      { name: 'Computer Science', shortName: 'CS' },
      { name: 'Information Technology', shortName: 'IT' },
      { name: 'Electronics & Communication', shortName: 'ECE' },
      { name: 'Electrical & Electronics', shortName: 'EEE' },
      { name: 'Mechanical Engineering', shortName: 'ME' }
    ];
    const departments = await Department.insertMany(deptList);
    console.log('Created Departments:', departments.map(d => d.shortName).join(', '));

    const deptMap = {};
    departments.forEach(d => { deptMap[d.shortName] = d._id; });

    // 3. Create Programmes
    const progList = [
      { name: 'B.Tech Computer Science', shortName: 'B.Tech CS', department: deptMap['CS'] },
      { name: 'M.Tech Software Engineering', shortName: 'M.Tech SE', department: deptMap['CS'] },
      { name: 'B.Tech Information Technology', shortName: 'B.Tech IT', department: deptMap['IT'] },
      { name: 'B.Tech Electronics & Communication', shortName: 'B.Tech ECE', department: deptMap['ECE'] },
      { name: 'B.Tech Electrical Engineering', shortName: 'B.Tech EEE', department: deptMap['EEE'] },
      { name: 'B.Tech Mechanical Engineering', shortName: 'B.Tech ME', department: deptMap['ME'] }
    ];
    const programmes = await Programme.insertMany(progList);
    console.log('Created Programmes:', programmes.map(p => p.shortName).join(', '));

    const progMap = {};
    programmes.forEach(p => { progMap[p.shortName] = p._id; });

    // 4. Create Blocks
    const blockList = [
      { name: 'APJ Abdul Kalam IT Block', department: deptMap['CS'], programme: progMap['B.Tech CS'] },
      { name: 'CV Raman Science Block', department: deptMap['ECE'], programme: progMap['B.Tech ECE'] },
      { name: 'Visvesvaraya Tech Block', department: deptMap['EEE'], programme: progMap['B.Tech EEE'] },
      { name: 'Main Academic Building', department: deptMap['IT'], programme: progMap['B.Tech IT'] },
      { name: 'Ramanujan Computing Complex', department: deptMap['CS'], programme: progMap['M.Tech SE'] }
    ];
    const blocks = await Block.insertMany(blockList);
    console.log('Created Blocks:', blocks.map(b => b.name).join(', '));

    const blockMap = {};
    blocks.forEach(b => { blockMap[b.name] = b._id; });

    // 5. Create Rooms
    const roomList = [
      { roomNumber: 'Lab 101 - AI & ML Lab', department: deptMap['CS'], programme: progMap['B.Tech CS'], block: blockMap['APJ Abdul Kalam IT Block'] },
      { roomNumber: 'Room 204 - Lecture Hall', department: deptMap['CS'], programme: progMap['B.Tech CS'], block: blockMap['APJ Abdul Kalam IT Block'] },
      { roomNumber: 'Server Room 102', department: deptMap['IT'], programme: progMap['B.Tech IT'], block: blockMap['Main Academic Building'] },
      { roomNumber: 'Electronics Lab 301', department: deptMap['ECE'], programme: progMap['B.Tech ECE'], block: blockMap['CV Raman Science Block'] },
      { roomNumber: 'Electrical Workshop 105', department: deptMap['EEE'], programme: progMap['B.Tech EEE'], block: blockMap['Visvesvaraya Tech Block'] },
      { roomNumber: 'Cisco Networking Lab 305', department: deptMap['IT'], programme: progMap['B.Tech IT'], block: blockMap['Main Academic Building'] },
      { roomNumber: 'CAD/CAM Software Lab 202', department: deptMap['ME'], programme: progMap['B.Tech ME'], block: blockMap['Visvesvaraya Tech Block'] },
      { roomNumber: 'Seminar Hall A', department: deptMap['CS'], programme: progMap['M.Tech SE'], block: blockMap['Ramanujan Computing Complex'] },
      { roomNumber: 'Faculty Cabin 104', department: deptMap['ECE'], programme: progMap['B.Tech ECE'], block: blockMap['CV Raman Science Block'] }
    ];
    const rooms = await Room.insertMany(roomList);
    console.log('Created Rooms:', rooms.map(r => r.roomNumber).join(', '));

    const roomMap = {};
    rooms.forEach(r => { roomMap[r.roomNumber] = r._id; });

    // 6. Create Users
    const userList = [
      { username: 'superadmin', email: 'superadmin@tms.com', phone: '1234567890', password: 'superadmin123', role: roleMap['Superadmin'], department: deptMap['CS'], programme: progMap['B.Tech CS'] },
      { username: 'user', email: 'user@tms.com', phone: '9876543210', password: 'user123', role: roleMap['User'], department: deptMap['CS'], programme: progMap['B.Tech CS'] },
      { username: 'rahul_student', email: 'rahul@tms.com', phone: '9876543220', password: 'user123', role: roleMap['User'], department: deptMap['IT'], programme: progMap['B.Tech IT'] },
      { username: 'priya_student', email: 'priya@tms.com', phone: '9876543221', password: 'user123', role: roleMap['User'], department: deptMap['ECE'], programme: progMap['B.Tech ECE'] },
      { username: 'dr_sharma', email: 'faculty@tms.com', phone: '9876543211', password: 'faculty123', role: roleMap['Faculty'], department: deptMap['CS'], programme: progMap['B.Tech CS'] },
      { username: 'prof_verma', email: 'verma@tms.com', phone: '9876543222', password: 'faculty123', role: roleMap['Faculty'], department: deptMap['ECE'], programme: progMap['B.Tech ECE'] },
      { username: 'alex_network', email: 'network@tms.com', phone: '9876543212', password: 'staff123', role: roleMap['Networking Staff'], department: deptMap['IT'] },
      { username: 'ramesh_plumber', email: 'plumber@tms.com', phone: '9876543213', password: 'staff123', role: roleMap['Plumber'], department: deptMap['ME'] },
      { username: 'suresh_electrician', email: 'electrician@tms.com', phone: '9876543214', password: 'staff123', role: roleMap['Electrician'], department: deptMap['EEE'] },
      { username: 'vikram_developer', email: 'dev@tms.com', phone: '9876543215', password: 'staff123', role: roleMap['Software Developer'], department: deptMap['CS'] }
    ];

    const users = [];
    for (const u of userList) {
      const newUser = new User(u);
      await newUser.save();
      users.push(newUser);
    }
    console.log('Created Users:', users.map(u => u.username).join(', '));

    const userMap = {};
    users.forEach(u => { userMap[u.username] = u._id; });

    // 7. Create Complaints
    const complaintList = [
      {
        block: blockMap['APJ Abdul Kalam IT Block'],
        room: roomMap['Lab 101 - AI & ML Lab'],
        complaintType: 'PC Hardware',
        remarks: 'Monitor display flickering and PC 12 power supply failure during lab session.',
        status: 'Pending',
        raisedBy: userMap['user'],
        department: deptMap['CS']
      },
      {
        block: blockMap['Main Academic Building'],
        room: roomMap['Server Room 102'],
        complaintType: 'Network',
        remarks: 'High network latency and intermittent ethernet disconnections on Rack 4, Switch B.',
        status: 'Assigned',
        raisedBy: userMap['dr_sharma'],
        assignedTo: userMap['alex_network'],
        department: deptMap['IT']
      },
      {
        block: blockMap['APJ Abdul Kalam IT Block'],
        room: roomMap['Room 204 - Lecture Hall'],
        complaintType: 'Electrical',
        remarks: 'Ceiling projector power socket is damaged and short-circuiting.',
        status: 'In-Progress',
        raisedBy: userMap['dr_sharma'],
        assignedTo: userMap['suresh_electrician'],
        department: deptMap['EEE']
      },
      {
        block: blockMap['CV Raman Science Block'],
        room: roomMap['Electronics Lab 301'],
        complaintType: 'Plumbing',
        remarks: 'Water pipe leakage under washbasin counter in electronics lab.',
        status: 'Completed',
        raisedBy: userMap['priya_student'],
        assignedTo: userMap['ramesh_plumber'],
        department: deptMap['ME']
      },
      {
        block: blockMap['APJ Abdul Kalam IT Block'],
        room: roomMap['Lab 101 - AI & ML Lab'],
        complaintType: 'PC Software',
        remarks: 'PyTorch and CUDA drivers crash during GPU matrix multiplication.',
        status: 'Assigned',
        raisedBy: userMap['user'],
        assignedTo: userMap['vikram_developer'],
        department: deptMap['CS']
      },
      {
        block: blockMap['Main Academic Building'],
        room: roomMap['Cisco Networking Lab 305'],
        complaintType: 'Network',
        remarks: 'Wi-Fi Access Point 03 not emitting 5GHz signal for students.',
        status: 'Pending',
        raisedBy: userMap['rahul_student'],
        department: deptMap['IT']
      },
      {
        block: blockMap['Visvesvaraya Tech Block'],
        room: roomMap['CAD/CAM Software Lab 202'],
        complaintType: 'Application Issues',
        remarks: 'AutoCAD license server connection error on systems 15 to 25.',
        status: 'In-Progress',
        raisedBy: userMap['dr_sharma'],
        assignedTo: userMap['vikram_developer'],
        department: deptMap['CS']
      },
      {
        block: blockMap['Ramanujan Computing Complex'],
        room: roomMap['Seminar Hall A'],
        complaintType: 'Electronics',
        remarks: 'Podium wireless microphone audio cuts out repeatedly during lectures.',
        status: 'On-Hold',
        raisedBy: userMap['prof_verma'],
        assignedTo: userMap['alex_network'],
        department: deptMap['ECE']
      },
      {
        block: blockMap['Visvesvaraya Tech Block'],
        room: roomMap['Electrical Workshop 105'],
        complaintType: 'Electrical',
        remarks: 'Main circuit breaker trips whenever transformer unit 2 is turned on.',
        status: 'Assigned',
        raisedBy: userMap['prof_verma'],
        assignedTo: userMap['suresh_electrician'],
        department: deptMap['EEE']
      },
      {
        block: blockMap['CV Raman Science Block'],
        room: roomMap['Faculty Cabin 104'],
        complaintType: 'Other',
        remarks: 'Door lock cylinder stuck and key not turning smoothly.',
        status: 'Completed',
        raisedBy: userMap['prof_verma'],
        assignedTo: userMap['ramesh_plumber'],
        department: deptMap['ECE']
      }
    ];

    await Complaint.insertMany(complaintList);
    console.log('Created Complaints count:', complaintList.length);

    console.log('\n========================================');
    console.log('=== All Categories Seeded Successfully ===');
    console.log('========================================\n');
    console.log('Login credentials:');
    console.log('1. Superadmin: superadmin@tms.com / superadmin123');
    console.log('2. User:       user@tms.com / user123');
    console.log('3. Faculty:    faculty@tms.com / faculty123');
    console.log('4. Network:    network@tms.com / staff123');
    console.log('5. Electrician:electrician@tms.com / staff123');
    console.log('6. Plumber:    plumber@tms.com / staff123');
    console.log('7. Developer:  dev@tms.com / staff123\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
