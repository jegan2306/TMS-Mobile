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
import { roomAPI, blockAPI, programmeAPI, departmentAPI } from '../services/api';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ roomNumber: '', department: '', programme: '', block: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [roomResponse, blockResponse, progResponse, deptResponse] = await Promise.all([
        roomAPI.getAll(),
        blockAPI.getAll(),
        programmeAPI.getAll(),
        departmentAPI.getAll(),
      ]);
      setRooms(roomResponse.data);
      setBlocks(blockResponse.data);
      setProgrammes(progResponse.data);
      setDepartments(deptResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (room = null) => {
    if (room) {
      setEditData(room);
      setFormData({
        roomNumber: room.roomNumber,
        department: room.department?._id || room.department,
        programme: room.programme?._id || room.programme,
        block: room.block?._id || room.block,
      });
    } else {
      setEditData(null);
      setFormData({ roomNumber: '', department: '', programme: '', block: '' });
    }
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditData(null);
    setFormData({ roomNumber: '', department: '', programme: '', block: '' });
    setError('');
  };

  const handleDepartmentChange = (deptId) => {
    setFormData({ ...formData, department: deptId, programme: '', block: '' });
  };

  const handleProgrammeChange = (progId) => {
    setFormData({ ...formData, programme: progId, block: '' });
  };

  const handleSubmit = async () => {
    try {
      if (editData) {
        await roomAPI.update(editData._id, formData);
      } else {
        await roomAPI.create(formData);
      }
      fetchData();
      handleClose();
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Error saving room');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await roomAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  const filteredProgrammes = programmes.filter(p => 
    !formData.department || p.department?._id === formData.department || p.department === formData.department
  );
  
  const filteredBlocks = blocks.filter(b => 
    !formData.programme || b.programme?._id === formData.programme || b.programme === formData.programme
  );

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
          Rooms
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Room
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Room Number</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Programme</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Block</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room._id} hover>
                    <TableCell>{room.roomNumber}</TableCell>
                    <TableCell>{room.department?.name || '-'}</TableCell>
                    <TableCell>{room.programme?.name || '-'}</TableCell>
                    <TableCell>{room.block?.name || '-'}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpen(room)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(room._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {rooms.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      No rooms found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editData ? 'Edit Room' : 'Add Room'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label="Room Number"
            value={formData.roomNumber}
            onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
            required
            sx={{ mt: 2, mb: 2 }}
            placeholder="e.g., 123"
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
          <FormControl fullWidth required sx={{ mb: 2 }} disabled={!formData.department}>
            <InputLabel>Programme</InputLabel>
            <Select
              value={formData.programme}
              label="Programme"
              onChange={(e) => handleProgrammeChange(e.target.value)}
            >
              {filteredProgrammes.map((prog) => (
                <MenuItem key={prog._id} value={prog._id}>
                  {prog.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required disabled={!formData.programme}>
            <InputLabel>Block</InputLabel>
            <Select
              value={formData.block}
              label="Block"
              onChange={(e) => setFormData({ ...formData, block: e.target.value })}
            >
              {filteredBlocks.map((block) => (
                <MenuItem key={block._id} value={block._id}>
                  {block.name}
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

export default Rooms;
