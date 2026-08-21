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
import { blockAPI, programmeAPI, departmentAPI } from '../services/api';

const Blocks = () => {
  const [blocks, setBlocks] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ name: '', department: '', programme: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [blockResponse, progResponse, deptResponse] = await Promise.all([
        blockAPI.getAll(),
        programmeAPI.getAll(),
        departmentAPI.getAll(),
      ]);
      setBlocks(blockResponse.data);
      setProgrammes(progResponse.data);
      setDepartments(deptResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (block = null) => {
    if (block) {
      setEditData(block);
      setFormData({
        name: block.name,
        department: block.department?._id || block.department,
        programme: block.programme?._id || block.programme,
      });
    } else {
      setEditData(null);
      setFormData({ name: '', department: '', programme: '' });
    }
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditData(null);
    setFormData({ name: '', department: '', programme: '' });
    setError('');
  };

  const handleDepartmentChange = (deptId) => {
    setFormData({ ...formData, department: deptId, programme: '' });
  };

  const handleSubmit = async () => {
    try {
      if (editData) {
        await blockAPI.update(editData._id, formData);
      } else {
        await blockAPI.create(formData);
      }
      fetchData();
      handleClose();
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Error saving block');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this block?')) {
      try {
        await blockAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting block:', error);
      }
    }
  };

  const filteredProgrammes = programmes.filter(p => !formData.department || p.department?._id === formData.department || p.department === formData.department);

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
          Blocks
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Block
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Block Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Programme</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {blocks.map((block) => (
                  <TableRow key={block._id} hover>
                    <TableCell>{block.name}</TableCell>
                    <TableCell>{block.department?.name || '-'}</TableCell>
                    <TableCell>{block.programme?.name || '-'}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpen(block)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(block._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {blocks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      No blocks found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editData ? 'Edit Block' : 'Add Block'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label="Block Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            sx={{ mt: 2, mb: 2 }}
          />
          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={formData.department}
              label="Department"
              onChange={(e) => handleDepartmentChange(e.target.value)}
            >
              {departments.map((dept) => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required>
            <InputLabel>Programme</InputLabel>
            <Select
              value={formData.programme}
              label="Programme"
              onChange={(e) => setFormData({ ...formData, programme: e.target.value })}
              disabled={!formData.department}
            >
              {filteredProgrammes.map((prog) => (
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

export default Blocks;
