const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('./models/Role');
const User = require('./models/User');
const Department = require('./models/Department');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ticket_management';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected Successfully');

    // Clear existing data
    await Role.deleteMany({});
    await User.deleteMany({});
    await Department.deleteMany({});

    console.log('Cleared existing data');

    // Create Roles
    const roles = [
      { name: 'Superadmin' },
      { name: 'User' },
      { name: 'Faculty' },
      { name: 'Networking Staff' },
      { name: 'Plumber' },
      { name: 'Electrician' },
      { name: 'Software Developer' }
    ];

    const createdRoles = await Role.insertMany(roles);
    console.log('Roles created:', createdRoles.map(r => r.name));

    // Create a default department
    const department = await Department.create({
      name: 'Computer Science',
      shortName: 'CS'
    });
    console.log('Default department created:', department.name);

    // Create SuperAdmin user
    const superAdminRole = createdRoles.find(r => r.name === 'Superadmin');
    const superAdmin = await User.create({
      username: 'superadmin',
      phone: '1234567890',
      email: 'superadmin@tms.com',
      password: 'superadmin123',
      role: superAdminRole._id,
      department: department._id
    });
    console.log('SuperAdmin created:', superAdmin.email);
    console.log('Password: superadmin123');

    console.log('\n=== Seed Data Created Successfully ===');
    console.log('You can now login with:');
    console.log('Email: superadmin@tms.com');
    console.log('Password: superadmin123\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
