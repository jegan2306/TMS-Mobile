import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { complaintAPI, blockAPI, roomAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RaiseComplaint = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    block: '',
    room: '',
    complaintType: '',
    remarks: '',
  });

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      const response = await blockAPI.getAll();
      setBlocks(response.data);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchRooms = async (blockId) => {
    try {
      const response = await roomAPI.getAll({ blockId });
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleBlockChange = (blockId) => {
    setFormData({ ...formData, block: blockId, room: '' });
    if (blockId) {
      fetchRooms(blockId);
    } else {
      setRooms([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await complaintAPI.create(formData);
      setSuccess('Complaint raised successfully!');
      setFormData({
        block: '',
        room: '',
        complaintType: '',
        remarks: '',
      });
      setRooms([]);
      setTimeout(() => {
        navigate('/complaints');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error raising complaint');
    } finally {
      setLoading(false);
    }
  };

  const complaintTypes = [
    'PC Hardware',
    'PC Software',
    'Application Issues',
    'Network',
    'Electronics',
    'Plumbing',
    'Electrical',
    'Other',
  ];

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Raise Complaint
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Submit a new complaint for any issue you're experiencing.
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Block Name</InputLabel>
                  <Select
                    value={formData.block}
                    label="Block Name"
                    onChange={(e) => handleBlockChange(e.target.value)}
                  >
                    {blocks.map((block) => (
                      <MenuItem key={block._id} value={block._id}>
                        {block.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required disabled={!formData.block}>
                  <InputLabel>Room Number</InputLabel>
                  <Select
                    value={formData.room}
                    label="Room Number"
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  >
                    {rooms.map((room) => (
                      <MenuItem key={room._id} value={room._id}>
                        {room.roomNumber}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Complaint Type</InputLabel>
                  <Select
                    value={formData.complaintType}
                    label="Complaint Type"
                    onChange={(e) => setFormData({ ...formData, complaintType: e.target.value })}
                  >
                    {complaintTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Raised By"
                  value={user?.username || ''}
                  disabled
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Complaint Remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  required
                  multiline
                  rows={4}
                  placeholder="Describe the issue in detail..."
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                  sx={{ px: 4, py: 1.5 }}
                >
                  {loading ? 'Submitting...' : 'Submit Complaint'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RaiseComplaint;
