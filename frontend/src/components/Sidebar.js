import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as DepartmentIcon,
  School as ProgrammeIcon,
  MeetingRoom as BlockIcon,
  Room as RoomIcon,
  AdminPanelSettings as RoleIcon,
  People as UserIcon,
  ConfirmationNumber as ComplaintIcon,
  AddCircle as RaiseIcon,
  Assessment as ReportIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['Superadmin', 'User', 'Faculty', 'Networking Staff', 'Plumber', 'Electrician', 'Software Developer'] },
  { text: 'Departments', icon: <DepartmentIcon />, path: '/departments', roles: ['Superadmin'] },
  { text: 'Programmes', icon: <ProgrammeIcon />, path: '/programmes', roles: ['Superadmin'] },
  { text: 'Blocks', icon: <BlockIcon />, path: '/blocks', roles: ['Superadmin'] },
  { text: 'Rooms', icon: <RoomIcon />, path: '/rooms', roles: ['Superadmin'] },
  { text: 'Roles', icon: <RoleIcon />, path: '/roles', roles: ['Superadmin'] },
  { text: 'Users', icon: <UserIcon />, path: '/users', roles: ['Superadmin'] },
  { text: 'Complaints', icon: <ComplaintIcon />, path: '/complaints', roles: ['Superadmin', 'User', 'Faculty', 'Networking Staff', 'Plumber', 'Electrician', 'Software Developer'] },
  { text: 'Raise Complaint', icon: <RaiseIcon />, path: '/raise-complaint', roles: ['User'] },
  { text: 'Reports', icon: <ReportIcon />, path: '/reports', roles: ['Superadmin', 'Faculty'] },
];

const Sidebar = ({ drawerWidth, mobileOpen, onClose, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role?.name)
  );

  const getDynamicTitle = (item) => {
    if (item.path === '/complaints') {
      if (user?.role?.name === 'User') return 'My Complaints';
      if (user?.role?.name === 'Superadmin') return 'Complaints & Assign';
      return 'Assigned Complaints';
    }
    return item.text;
  };

  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'Superadmin': return '#818cf8';
      case 'User': return '#38bdf8';
      case 'Faculty': return '#f472b6';
      case 'Networking Staff': return '#34d399';
      case 'Plumber': return '#fbbf24';
      case 'Electrician': return '#fb923c';
      case 'Software Developer': return '#c084fc';
      default: return '#94a3b8';
    }
  };

  const isSelected = (path) => location.pathname === path;

  const drawerContent = (
    <Box sx={{ 
      minHeight: '100vh', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
      color: '#e0e7ff',
      position: 'relative',
      overflowY: 'auto',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 20%, rgba(79, 70, 229, 0.15) 0%, transparent 50%)',
        pointerEvents: 'none',
      }
    }}>
      <Box sx={{ p: 2.5, position: 'relative' }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          p: 1.5,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.07)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Avatar 
            sx={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              width: 42, 
              height: 42, 
              fontSize: 18,
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
            }}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
              {user?.username}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: getRoleColor(user?.role?.name), 
                fontWeight: 700, 
                textTransform: 'uppercase',
                fontSize: '0.65rem',
                letterSpacing: '0.5px'
              }}
            >
              {user?.role?.name}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', position: 'relative' }} />
      
      <List sx={{ flex: 1, px: 2, py: 1.5, position: 'relative' }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isSelected(item.path)}
              sx={{
                borderRadius: 2,
                py: 1.2,
                transition: 'all 0.2s ease',
                background: isSelected(item.path) 
                  ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
                  : 'transparent',
                boxShadow: isSelected(item.path) 
                  ? '0 4px 14px rgba(79, 70, 229, 0.4)' 
                  : 'none',
                '&:hover': {
                  background: isSelected(item.path)
                    ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                    : 'rgba(255, 255, 255, 0.08)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: isSelected(item.path) ? '#fff' : 'rgba(255,255,255,0.7)', 
                minWidth: 40,
                transition: 'color 0.2s ease'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={getDynamicTitle(item)} 
                primaryTypographyProps={{ 
                  sx: { 
                    color: isSelected(item.path) ? '#fff' : 'rgba(255,255,255,0.85)', 
                    fontWeight: isSelected(item.path) ? 700 : 500,
                    fontSize: '0.875rem'
                  } 
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', position: 'relative' }} />
      
      <Box sx={{ p: 2, position: 'relative', bgcolor: 'transparent' }}>
        <ListItemButton 
          onClick={handleLogout} 
          sx={{ 
            borderRadius: 2.5, 
            py: 1.2,
            px: 2,
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            transition: 'all 0.2s ease',
            '&:hover': { 
              background: 'rgba(239, 68, 68, 0.25)',
              borderColor: 'rgba(239, 68, 68, 0.5)',
              transform: 'translateY(-1px)',
            } 
          }}
        >
          <ListItemIcon sx={{ color: '#f87171', minWidth: 36 }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            primaryTypographyProps={{ 
              sx: { 
                color: '#f87171', 
                fontWeight: 700,
                fontSize: '0.875rem'
              } 
            }} 
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box', 
            border: 'none',
            bgcolor: '#1e1b4b' 
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box', 
            border: 'none',
            bgcolor: '#1e1b4b',
            boxShadow: '4px 0 24px rgba(0,0,0,0.12)'
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
