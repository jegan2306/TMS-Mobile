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
  Chip,
  Stack,
} from '@mui/material';
import { Add as AddIcon, ArrowBack as BackIcon, Speed as QuickIcon } from '@mui/icons-material';
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
      setSuccess('Complaint submitted successfully! Redirecting to complaints list...');
      setFormData({
        block: '',
        room: '',
        complaintType: '',
        remarks: '',
      });
      setRooms([]);
      setTimeout(() => {
        navigate('/complaints');
      }, 1500);
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

  const quickRemarks = [
    'System not powering on',
    'Internet disconnections on Ethernet port',
    'Projector display flickering',
    'Software crashing during startup',
    'Water leakage in washroom counter',
    'AC cooling insufficient'
  ];

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (user?.role?.name !== 'User') {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6, p: 4, textAlign: 'center', bgcolor: '#fff', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <Typography variant="h5" color="error" sx={{ fontWeight: 800, mb: 1.5 }}>
          Access Restricted
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          In this project, only Users can raise complaints. Superadmins assign complaints and category staff resolve them.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/complaints')}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
        >
          Go to Complaints Management
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          onClick={() => navigate('/complaints')}
          startIcon={<BackIcon />}
          sx={{ textTransform: 'none', color: 'text.secondary' }}
        >
          Back to Complaints
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 0.5 }}>
          Raise New Complaint
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Report technical, infrastructure, or maintenance issues for prompt resolution.
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 4, boxShadow: '0 8px 30px rgba(0,0,0,0.06)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Select Block</InputLabel>
                  <Select
                    value={formData.block}
                    label="Select Block"
                    onChange={(e) => handleBlockChange(e.target.value)}
                    sx={{ borderRadius: 2 }}
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
                  <InputLabel>Select Room</InputLabel>
                  <Select
                    value={formData.room}
                    label="Select Room"
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    sx={{ borderRadius: 2 }}
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
                  <InputLabel>Complaint Category / Type</InputLabel>
                  <Select
                    value={formData.complaintType}
                    label="Complaint Category / Type"
                    onChange={(e) => setFormData({ ...formData, complaintType: e.target.value })}
                    sx={{ borderRadius: 2 }}
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
                  value={`${user?.username || ''} (${user?.role?.name || ''})`}
                  disabled
                  sx={{ borderRadius: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                  Quick Suggestions for Remarks:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                  {quickRemarks.map((remark) => (
                    <Chip
                      key={remark}
                      label={remark}
                      onClick={() => setFormData({ ...formData, remarks: remark })}
                      size="small"
                      icon={<QuickIcon fontSize="small" />}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: '#e0e7ff',
                        color: '#3730a3',
                        fontWeight: 500,
                        '&:hover': { bgcolor: '#c7d2fe' }
                      }}
                    />
                  ))}
                </Stack>
                <TextField
                  fullWidth
                  label="Complaint Description / Remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  required
                  multiline
                  rows={4}
                  placeholder="Provide details about the issue (e.g., system number, symptoms, location inside room)..."
                  sx={{ borderRadius: 2 }}
                />
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 1 }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/complaints')}
                  sx={{ px: 3, borderRadius: 2, textTransform: 'none' }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                  sx={{
                    px: 4,
                    py: 1.2,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                  }}
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
