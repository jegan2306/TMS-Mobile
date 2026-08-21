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
import { programmeAPI, departmentAPI } from '../services/api';

const Programmes = () => {
  const [programmes, setProgrammes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ name: '', shortName: '', department: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [progResponse, deptResponse] = await Promise.all([
        programmeAPI.getAll(),
        departmentAPI.getAll(),
      ]);
      setProgrammes(progResponse.data);
      setDepartments(deptResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (programme = null) => {
    if (programme) {
      setEditData(programme);
      setFormData({
        name: programme.name,
        shortName: programme.shortName,
        department: programme.department?._id || programme.department,
      });
    } else {
      setEditData(null);
      setFormData({ name: '', shortName: '', department: '' });
    }
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditData(null);
    setFormData({ name: '', shortName: '', department: '' });
    setError('');
  };

  const handleSubmit = async () => {
    try {
      if (editData) {
        await programmeAPI.update(editData._id, formData);
      } else {
        await programmeAPI.create(formData);
      }
      fetchData();
      handleClose();
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Error saving programme');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this programme?')) {
      try {
        await programmeAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting programme:', error);
      }
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
          Programmes
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Programme
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Programme Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Short Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {programmes.map((programme) => (
                  <TableRow key={programme._id} hover>
                    <TableCell>{programme.name}</TableCell>
                    <TableCell>{programme.shortName}</TableCell>
                    <TableCell>{programme.department?.name || '-'}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpen(programme)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(programme._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {programmes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      No programmes found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editData ? 'Edit Programme' : 'Add Programme'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label="Programme Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Short Name"
            value={formData.shortName}
            onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth required>
            <InputLabel>Department</InputLabel>
            <Select
              value={formData.department}
              label="Department"
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              {departments.map((dept) => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept.name}
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

export default Programmes;
