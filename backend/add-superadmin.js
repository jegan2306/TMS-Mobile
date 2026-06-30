const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('./models/Role');
const User = require('./models/User');
const Department = require('./models/Department');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ticket_management';

async function ensureSuperadmin() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const roleName = 'Superadmin';
  // case-insensitive search for role
  let role = await Role.findOne({ name: new RegExp('^' + roleName + '$', 'i') });
  if (!role) {
    role = await Role.create({ name: roleName });
    console.log('Created role:', role.name);
  } else {
    console.log('Role already exists:', role.name);
  }

  // Ensure there's at least one department
  let department = await Department.findOne();
  if (!department) {
    department = await Department.create({ name: 'Computer Science', shortName: 'CS' });
    console.log('Created default department:', department.name);
  } else {
    console.log('Using existing department:', department.name);
  }

  // Create superadmin user if not exists
  const adminEmail = 'superadmin@tms.com';
  let user = await User.findOne({ email: adminEmail });
  if (!user) {
    user = new User({
      username: 'superadmin',
      phone: '1234567890',
      email: adminEmail,
      password: 'superadmin123',
      role: role._id,
      department: department._id
    });
    await user.save();
    console.log('Created Superadmin user:', adminEmail);
    console.log('Password: superadmin123');
  } else {
    console.log('Superadmin user already exists:', adminEmail);
  }

  await mongoose.disconnect();
}

ensureSuperadmin()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
