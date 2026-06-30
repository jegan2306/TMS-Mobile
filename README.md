# Ticket Management System (TMS)

A full-stack web application for managing complaints related to hardware, software, and various other issues in an organization.

## Technology Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Token)

## Features

### Week 1-3: Master Screens
- Department Management
- Programme Management
- Block Management
- Room Number Management
- Role Management
- User Management

### Week 4: Transaction Screens
- Complaints Raising Screen (for Users and Superadmin)

### Week 5: Dashboard & List
- Complaints Dashboard with statistics
- Complaints List Screen

### Week 6-8: Role-Based Access Control
- **Superadmin**: Full access, can assign/reassign complaints
- **User**: Can raise complaints and view their own
- **Staff** (Networking, Plumber, Electrician, Software Developer): View assigned complaints, update status

### Week 9: Reports
- Generate complaint reports with filters (Department, Programme, Type, Status, Assignee)
- Export reports to CSV

## Project Structure

```
TMS-10/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── seed.js         # Seed data script
│   ├── server.js       # Main server file
│   ├── .env            # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── context/    # Auth context
│   │   ├── services/   # API services
│   │   ├── App.js      # Main App component
│   │   └── index.js    # Entry point
│   ├── public/
│   └── package.json
├── README.md
└── TODO.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Make sure MongoDB is running locally or update the MONGO_URI in `.env` file

4. Run the seed script to create initial data:
   ```bash
   node seed.js
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

   The server will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The app will open at http://localhost:3000

## Default Login Credentials

- **Email**: superadmin@tms.com
- **Password**: superadmin123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Master Screens
- `GET/POST /api/departments` - Department CRUD
- `GET/POST /api/programmes` - Programme CRUD
- `GET/POST /api/blocks` - Block CRUD
- `GET/POST /api/rooms` - Room CRUD
- `GET/POST /api/roles` - Role CRUD
- `GET/POST /api/users` - User CRUD

### Complaints
- `GET /api/complaints` - Get all complaints
- `POST /api/complaints` - Create complaint
- `PUT /api/complaints/:id/assign` - Assign complaint
- `PUT /api/complaints/:id/status` - Update status

### Dashboard & Reports
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/reports` - Generate report
- `GET /api/reports/export` - Export report to CSV

## Role Permissions

| Feature | Superadmin | User | Staff |
|---------|------------|------|-------|
| Master Screens | ✓ | ✗ | ✗ |
| Raise Complaint | ✓ | ✓ | ✗ |
| View All Complaints | ✓ | Own Only | Assigned Only |
| Assign Complaints | ✓ | ✗ | ✗ |
| Update Status | ✓ | ✗ | ✓ |
| View Dashboard | ✓ | ✓ | ✓ |
| Generate Reports | ✓ | ✗ | ✗ |

## License

MIT
