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
├── mobile/            # React Native Mobile & Web (Expo)
│   ├── assets/          # Icons, QR Code & Images
│   ├── src/
│   │   ├── components/  # Mobile Components & Modals
│   │   ├── config/      # API LAN Configuration
│   │   ├── context/     # Auth Context & Quick Logins
│   │   ├── screens/     # Dashboard, Complaints, Raise, Reports, Masters, Settings
│   │   ├── services/    # API & Offline Mock sync
│   │   └── theme/       # Color palette & styling
│   ├── App.js           # Root Mobile App with Navigation
│   ├── scan-qr.html     # Browser QR Scanner page
│   └── package.json
├── README.md
└── TODO.md
```

## Mobile & Web Application (React Native & Expo Go)

### Prerequisites for Mobile
- Install **Expo Go** from Google Play Store (Android) or App Store (iOS) on your mobile phone.
- Make sure your mobile phone and PC are connected to the **same Wi-Fi network**.

### How to Run and Scan in Expo Go:

1. **Start the backend server:**
   ```bash
   npm run backend
   ```
   The backend runs on `http://192.168.209.11:5000` (and `http://localhost:5000`).

2. **Start the Expo development server:**
   ```bash
   npm run mobile
   ```
   Or navigate to `mobile/` and run `npx expo start`.

3. **Open on Mobile:**
   - **Android**: Open **Expo Go**, tap **"Scan QR code"**, and scan the QR code in your terminal or open `mobile/scan-qr.html` in your browser to scan from screen.
   - **iOS**: Open default **Camera app**, point at the QR code, and tap the Expo Go prompt.
   - **Direct URL**: In Expo Go, you can also manually enter: `exp://192.168.209.11:8081`

4. **Run as Web Application in Browser:**
   ```bash
   npm run mobile:web
   ```
   Or visit `http://localhost:8081` in your browser.


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

- **Superadmin**: `superadmin@tms.com` / `superadmin123`
- **User**: `user@tms.com` / `user123`
- **Plumber**: `plumber@tms.com` / `staff123`
- **Electrician**: `electrician@tms.com` / `staff123`
- **Network Staff**: `network@tms.com` / `staff123`
- **Software Dev**: `dev@tms.com` / `staff123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Master Screens (SuperAdmin Only)
- `GET/POST /api/departments` - Department CRUD (SuperAdmin Only for create/edit/delete)
- `GET/POST /api/programmes` - Programme CRUD (SuperAdmin Only for create/edit/delete)
- `GET/POST /api/blocks` - Block CRUD (SuperAdmin Only for create/edit/delete)
- `GET/POST /api/rooms` - Room CRUD (SuperAdmin Only for create/edit/delete)
- `GET/POST /api/roles` - Role CRUD (SuperAdmin Only for create/edit/delete)
- `GET/POST /api/users` - User CRUD (SuperAdmin Only for create/edit/delete)

### Complaints
- `GET /api/complaints` - Get complaints (filtered by role)
- `POST /api/complaints` - Raise complaint (User Only)
- `PUT /api/complaints/:id/assign` - Assign complaint (SuperAdmin Only)
- `PUT /api/complaints/:id/status` - Update status (Staff & SuperAdmin Only)

### Dashboard & Reports
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/reports` - Generate report (SuperAdmin & Faculty)
- `GET /api/reports/export` - Export report to CSV

## Role Permissions Matrix

| Feature | Superadmin | User | Category Staff |
|:---|:---:|:---:|:---:|
| **Master Data (Departments, Blocks, Rooms)** | ✓ (Add/Edit/Delete) | ✗ | ✗ |
| **Raise Complaint** | ✗ | ✓ (User Only) | ✗ |
| **Assign Complaint to Category Staff** | ✓ (Superadmin Only) | ✗ | ✗ |
| **View Complaints** | ✓ (All Campus) | ✓ (Own Only) | ✓ (Assigned Only) |
| **Update Complaint Status** | ✓ | ✗ | ✓ (In-Progress / Completed) |
| **View Dashboard** | ✓ (Campus Stats) | ✓ (Own Stats) | ✓ (Work Order Stats) |
| **Generate Reports** | ✓ | ✗ | ✗ |

## License

MIT
