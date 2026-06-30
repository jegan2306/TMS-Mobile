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
  Stack,
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
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['Superadmin', 'User', 'Networking Staff', 'Plumber', 'Electrician', 'Software Developer'] },
  { text: 'Departments', icon: <DepartmentIcon />, path: '/departments', roles: ['Superadmin'] },
  { text: 'Programmes', icon: <ProgrammeIcon />, path: '/programmes', roles: ['Superadmin'] },
  { text: 'Blocks', icon: <BlockIcon />, path: '/blocks', roles: ['Superadmin'] },
  { text: 'Rooms', icon: <RoomIcon />, path: '/rooms', roles: ['Superadmin'] },
  { text: 'Roles', icon: <RoleIcon />, path: '/roles', roles: ['Superadmin'] },
  { text: 'Users', icon: <UserIcon />, path: '/users', roles: ['Superadmin'] },
  { text: 'Complaints', icon: <ComplaintIcon />, path: '/complaints', roles: ['Superadmin', 'User', 'Networking Staff', 'Plumber', 'Electrician', 'Software Developer'] },
  { text: 'Raise Complaint', icon: <RaiseIcon />, path: '/raise-complaint', roles: ['Superadmin', 'User'] },
  { text: 'Reports', icon: <ReportIcon />, path: '/reports', roles: ['Superadmin'] },
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

  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'Superadmin': return '#4f46e5';
      case 'User': return '#06b6d4';
      case 'Networking Staff': return '#10b981';
      case 'Plumber': return '#f59e0b';
      case 'Electrician': return '#f97316';
      case 'Software Developer': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const isSelected = (path) => location.pathname === path;

  const drawerContent = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
      color: '#e0e7ff',
      position: 'relative',
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
      <Box sx={{ p: 3, position: 'relative' }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          mb: 2,
          p: 2,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
        }}>
          <Avatar 
            sx={{ 
              bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
              width: 48, 
              height: 48, 
              fontSize: 20,
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
            }}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
              {user?.username}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: getRoleColor(user?.role?.name), 
                fontWeight: 600, 
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
      
      <List sx={{ flex: 1, px: 2, py: 2, position: 'relative' }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isSelected(item.path)}
              sx={{
                borderRadius: 2,
                py: 1.5,
                transition: 'all 0.2s ease',
                background: isSelected(item.path) 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : 'transparent',
                boxShadow: isSelected(item.path) 
                  ? '0 4px 14px rgba(79, 70, 229, 0.4)' 
                  : 'none',
                '&:hover': {
                  background: isSelected(item.path)
                    ? 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)'
                    : 'rgba(255, 255, 255, 0.08)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: isSelected(item.path) ? '#fff' : 'rgba(255,255,255,0.6)', 
                minWidth: 44,
                transition: 'color 0.2s ease'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  sx: { 
                    color: isSelected(item.path) ? '#fff' : 'rgba(255,255,255,0.7)', 
                    fontWeight: isSelected(item.path) ? 600 : 500,
                    fontSize: '0.875rem'
                  } 
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', position: 'relative' }} />
      
      <List sx={{ px: 2, py: 2, position: 'relative' }}>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleLogout} 
            sx={{ 
              borderRadius: 2, 
              py: 1.5,
              transition: 'all 0.2s ease',
              '&:hover': { 
                bgcolor: 'rgba(239, 68, 68, 0.15)',
                '& .logout-icon': { color: '#ef4444' }
              } 
            }}
          >
            <ListItemIcon sx={{ color: 'rgba(255,255,255,0.6)', minWidth: 44 }} className="logout-icon">
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ 
                sx: { 
                  color: 'rgba(255,255,255,0.7)', 
                  fontWeight: 500,
                  fontSize: '0.875rem'
                } 
              }} 
            />
          </ListItemButton>
        </ListItem>
      </List>
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
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', border: 'none' },
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
            boxShadow: '4px 0 24px rgba(0,0,0,0.08)'
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
