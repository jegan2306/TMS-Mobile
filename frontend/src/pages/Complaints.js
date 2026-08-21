import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { MoreVert as MoreIcon, Visibility as ViewIcon, Assignment as AssignIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { complaintAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Complaints = () => {
  const { user, isSuperAdmin, isFaculty, isStaff } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignData, setAssignData] = useState({ assignedTo: '', status: '' });

  useEffect(() => {
    fetchComplaints();
    if (isSuperAdmin || isFaculty) {
      fetchStaff();
    }
  }, [isSuperAdmin, isFaculty]);

  const fetchComplaints = async () => {
    try {
      const response = await complaintAPI.getAll();
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await userAPI.getAll();
      const staffRoles = ['Faculty', 'Networking Staff', 'Plumber', 'Electrician', 'Software Developer'];
      setStaff(response.data.filter(u => staffRoles.includes(u.role?.name)));
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleMenuOpen = (event, complaint) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedComplaint(complaint);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleView = () => {
    setViewOpen(true);
    handleMenuClose();
  };

  const handleAssign = () => {
    setAssignData({ assignedTo: selectedComplaint?.assignedTo?._id || '', status: selectedComplaint?.status || '' });
    setAssignOpen(true);
    handleMenuClose();
  };

  const handleAssignSubmit = async () => {
    try {
      if (assignData.assignedTo) {
        await complaintAPI.assign(selectedComplaint._id, assignData.assignedTo);
      }
      if (assignData.status && isStaff) {
        await complaintAPI.updateStatus(selectedComplaint._id, assignData.status);
      }
      fetchComplaints();
      setAssignOpen(false);
    } catch (error) {
      console.error('Error assigning complaint:', error);
    }
  };

  const handleStatusUpdate = async (complaintId, status) => {
    try {
      await complaintAPI.updateStatus(complaintId, status);
      fetchComplaints();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id) => {
    const complaintId = id || selectedComplaint?._id;
    if (!complaintId) return;

    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await complaintAPI.delete(complaintId);
        fetchComplaints();
        handleMenuClose();
        setViewOpen(false);
      } catch (error) {
        console.error('Error deleting complaint:', error);
        alert(error.response?.data?.message || error.message || 'Error deleting complaint');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ed6c02';
      case 'Assigned': return '#9c27b0';
      case 'In-Progress': return '#0288d1';
      case 'On-Hold': return '#f57c00';
      case 'Completed': return '#2e7d32';
      default: return '#757575';
    }
  };

  const canDelete = (complaint) => {
    if (!complaint) return false;
    if (isSuperAdmin) return true;
    const currentUserId = user?.id || user?._id;
    const creatorId = complaint.raisedBy?._id || complaint.raisedBy;
    return Boolean(currentUserId && creatorId && String(currentUserId) === String(creatorId));
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
          Complaints
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Block</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Room</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Raised By</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {complaints.map((complaint) => (
                  <TableRow key={complaint._id} hover sx={{ cursor: 'pointer' }}>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{complaint._id.slice(-6)}</TableCell>
                    <TableCell>{complaint.complaintType}</TableCell>
                    <TableCell>{complaint.block?.name || '-'}</TableCell>
                    <TableCell>{complaint.room?.roomNumber || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={complaint.status}
                        size="small"
                        sx={{
                          bgcolor: `${getStatusColor(complaint.status)}15`,
                          color: getStatusColor(complaint.status),
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>{complaint.raisedBy?.username || '-'}</TableCell>
                    <TableCell>{complaint.assignedTo?.username || '-'}</TableCell>
                    <TableCell>{new Date(complaint.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton onClick={(e) => handleMenuOpen(e, complaint)}>
                        <MoreIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {complaints.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      No complaints found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleView}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} /> View Details
        </MenuItem>
        {(isSuperAdmin || isFaculty) && (
          <MenuItem onClick={handleAssign}>
            <AssignIcon fontSize="small" sx={{ mr: 1 }} /> Assign/Reassign
          </MenuItem>
        )}
        {isStaff && (
          <MenuItem onClick={() => {
            handleMenuClose();
            handleStatusUpdate(selectedComplaint?._id, 'In-Progress');
          }}>
            Mark In-Progress
          </MenuItem>
        )}
        {isStaff && (
          <MenuItem onClick={() => {
            handleMenuClose();
            handleStatusUpdate(selectedComplaint?._id, 'Completed');
          }}>
            Mark Completed
          </MenuItem>
        )}
        {canDelete(selectedComplaint) && (
          <MenuItem onClick={() => handleDelete(selectedComplaint?._id)} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete Complaint
          </MenuItem>
        )}
      </Menu>

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Complaint Details</DialogTitle>
        <DialogContent>
          {selectedComplaint && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Complaint Type</Typography>
                <Typography variant="body1">{selectedComplaint.complaintType}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip
                  label={selectedComplaint.status}
                  size="small"
                  sx={{
                    bgcolor: `${getStatusColor(selectedComplaint.status)}15`,
                    color: getStatusColor(selectedComplaint.status),
                  }}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Block</Typography>
                <Typography variant="body1">{selectedComplaint.block?.name}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Room</Typography>
                <Typography variant="body1">{selectedComplaint.room?.roomNumber}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Raised By</Typography>
                <Typography variant="body1">{selectedComplaint.raisedBy?.username}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Assigned To</Typography>
                <Typography variant="body1">{selectedComplaint.assignedTo?.username || 'Not Assigned'}</Typography>
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="subtitle2" color="text.secondary">Remarks</Typography>
                <Typography variant="body1">{selectedComplaint.remarks}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                <Typography variant="body1">{new Date(selectedComplaint.createdAt).toLocaleString()}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {canDelete(selectedComplaint) && (
            <Button color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(selectedComplaint?._id)}>
              Delete
            </Button>
          )}
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Complaint</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Assign To</InputLabel>
            <Select
              value={assignData.assignedTo}
              label="Assign To"
              onChange={(e) => setAssignData({ ...assignData, assignedTo: e.target.value })}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {staff.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.username} - {s.role?.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={assignData.status}
              label="Status"
              onChange={(e) => setAssignData({ ...assignData, status: e.target.value })}
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Assigned">Assigned</MenuItem>
              <MenuItem value="In-Progress">In-Progress</MenuItem>
              <MenuItem value="On-Hold">On-Hold</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignSubmit}>Assign</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Complaints;
