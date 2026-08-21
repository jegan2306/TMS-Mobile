import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { userAPI, roleAPI, departmentAPI, programmeAPI } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    role: '',
    department: '',
    programme: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userResponse, roleResponse, deptResponse, progResponse] = await Promise.all([
        userAPI.getAll(),
        roleAPI.getAll(),
        departmentAPI.getAll(),
        programmeAPI.getAll(),
      ]);
      setUsers(userResponse.data);
      setRoles(roleResponse.data);
      setDepartments(deptResponse.data);
      setProgrammes(progResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (user = null) => {
    if (user) {
      setEditData(user);
      setFormData({
        username: user.username,
        phone: user.phone,
        email: user.email,
        password: '',
        role: user.role?._id || user.role,
        department: user.department?._id || user.department || '',
        programme: user.programme?._id || user.programme || '',
      });
    } else {
      setEditData(null);
      setFormData({
        username: '',
        phone: '',
        email: '',
        password: '',
        role: '',
        department: '',
        programme: '',
      });
    }
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditData(null);
    setFormData({
      username: '',
      phone: '',
      email: '',
      password: '',
      role: '',
      department: '',
      programme: '',
    });
    setError('');
  };

  const handleSubmit = async () => {
    try {
      const submitData = { ...formData };
      if (editData && !submitData.password) {
        delete submitData.password;
      }
      
      if (editData) {
        await userAPI.update(editData._id, submitData);
      } else {
        await userAPI.create(submitData);
      }
      fetchData();
      handleClose();
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Error saving user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'Superadmin': return '#d32f2f';
      case 'User': return '#1976d2';
      case 'Faculty': return '#ec4899';
      case 'Networking Staff': return '#388e3c';
      case 'Plumber': return '#0288d1';
      case 'Electrician': return '#f57c00';
      case 'Software Developer': return '#7b1fa2';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Users
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add User
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: `${getRoleColor(user.role?.name)}15`,
                          color: getRoleColor(user.role?.name),
                          fontWeight: 500,
                          display: 'inline-block',
                        }}
                      >
                        {user.role?.name}
                      </Box>
                    </TableCell>
                    <TableCell>{user.department?.name || '-'}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpen(user)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(user._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editData ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!editData}
            helperText={editData ? 'Leave blank to keep current password' : ''}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              {roles.map((role) => (
                <MenuItem key={role._id} value={role._id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={formData.department}
              label="Department"
              onChange={(e) => setFormData({ ...formData, department: e.target.value, programme: '' })}
            >
              <MenuItem value="">None</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Programme</InputLabel>
            <Select
              value={formData.programme}
              label="Programme"
              onChange={(e) => setFormData({ ...formData, programme: e.target.value })}
            >
              <MenuItem value="">None</MenuItem>
              {programmes.filter(p => !formData.department || p.department?._id === formData.department || p.department === formData.department).map((prog) => (
                <MenuItem key={prog._id} value={prog._id}>
                  {prog.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
