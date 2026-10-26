import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TextField,
  InputAdornment,
  Grid,
  Alert,
  Avatar,
  Radio,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Assignment as AssignIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  ConfirmationNumber as TicketIcon,
  HourglassEmpty as PendingIcon,
  Build as ProgressIcon,
  CheckCircle as CompletedIcon,
  PlayArrow as StartWorkIcon,
  DoneAll as DoneIcon,
  Person as PersonIcon,
  Engineering as EngineeringIcon,
  ElectricalServices as ElectricalIcon,
  Plumbing as PlumbingIcon,
  Lan as NetworkIcon,
  Computer as ComputerIcon,
  Layers as CategoryIcon,
} from '@mui/icons-material';
import { complaintAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Map complaint categories to matching staff roles
const COMPLAINT_TYPE_TO_ROLE = {
  'Plumbing': 'Plumber',
  'Electrical': 'Electrician',
  'Electronics': 'Electrician',
  'Network': 'Networking Staff',
  'PC Hardware': 'Software Developer',
  'PC Software': 'Software Developer',
  'Application Issues': 'Software Developer',
  'Other': 'ALL',
};

const CATEGORY_CONFIG = {
  'Plumbing': { color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', icon: <PlumbingIcon fontSize="small" /> },
  'Electrical': { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: <ElectricalIcon fontSize="small" /> },
  'Electronics': { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: <ElectricalIcon fontSize="small" /> },
  'Network': { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: <NetworkIcon fontSize="small" /> },
  'PC Hardware': { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: <ComputerIcon fontSize="small" /> },
  'PC Software': { color: '#9333ea', bg: '#faf5ff', border: '#e9d5ff', icon: <ComputerIcon fontSize="small" /> },
  'Application Issues': { color: '#c026d3', bg: '#fdf4ff', border: '#f5d0fe', icon: <ComputerIcon fontSize="small" /> },
  'Other': { color: '#475569', bg: '#f8fafc', border: '#cbd5e1', icon: <CategoryIcon fontSize="small" /> },
};

const Complaints = () => {
  const navigate = useNavigate();
  const { user, isSuperAdmin, isUser, isStaff } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  
  // Assign Dialog State
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignCategoryFilter, setAssignCategoryFilter] = useState('ALL');
  const [assignData, setAssignData] = useState({ assignedTo: '', status: 'Assigned' });

  // Feedback Snackbar
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    fetchComplaints();
    if (isSuperAdmin) {
      fetchStaff();
    }
  }, [isSuperAdmin]);

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
      const staffRoles = ['Networking Staff', 'Plumber', 'Electrician', 'Software Developer', 'Faculty'];
      setStaff(response.data.filter(u => staffRoles.includes(u.role?.name)));
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  // Calculate active workload (tickets in-progress or assigned) for each staff member
  const staffWorkload = useMemo(() => {
    const counts = {};
    complaints.forEach((c) => {
      const staffId = c.assignedTo?._id || c.assignedTo;
      if (staffId && c.status !== 'Completed') {
        counts[staffId] = (counts[staffId] || 0) + 1;
      }
    });
    return counts;
  }, [complaints]);

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

  // Open the intelligent Assign Dialog with suggested category
  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    const suggestedRole = COMPLAINT_TYPE_TO_ROLE[complaint.complaintType] || 'ALL';
    setAssignCategoryFilter(suggestedRole);
    setAssignData({
      assignedTo: complaint?.assignedTo?._id || '',
      status: complaint?.status === 'Pending' ? 'Assigned' : (complaint?.status || 'Assigned'),
    });
    setAssignOpen(true);
    handleMenuClose();
  };

  const handleAssignSubmit = async () => {
    try {
      if (assignData.assignedTo) {
        await complaintAPI.assign(selectedComplaint._id, assignData.assignedTo);
      }
      if (assignData.status) {
        await complaintAPI.updateStatus(selectedComplaint._id, assignData.status);
      }
      const assignedStaffObj = staff.find(s => s._id === assignData.assignedTo);
      const staffLabel = assignedStaffObj ? `${assignedStaffObj.username} (${assignedStaffObj.role?.name})` : 'Staff';
      setFeedback({
        open: true,
        message: `Complaint #${selectedComplaint._id.slice(-6).toUpperCase()} successfully assigned to ${staffLabel}!`,
        severity: 'success',
      });
      fetchComplaints();
      setAssignOpen(false);
    } catch (error) {
      console.error('Error assigning complaint:', error);
      setFeedback({
        open: true,
        message: error.response?.data?.message || 'Error assigning complaint',
        severity: 'error',
      });
    }
  };

  const handleStatusUpdate = async (complaintId, status) => {
    try {
      await complaintAPI.updateStatus(complaintId, status);
      setFeedback({
        open: true,
        message: `Status updated to ${status}!`,
        severity: 'success',
      });
      fetchComplaints();
    } catch (error) {
      console.error('Error updating status:', error);
      setFeedback({
        open: true,
        message: error.response?.data?.message || 'Error updating status',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id) => {
    const complaintId = id || selectedComplaint?._id;
    if (!complaintId) return;

    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await complaintAPI.delete(complaintId);
        setFeedback({
          open: true,
          message: 'Complaint deleted successfully',
          severity: 'info',
        });
        fetchComplaints();
        handleMenuClose();
        setViewOpen(false);
      } catch (error) {
        console.error('Error deleting complaint:', error);
        setFeedback({
          open: true,
          message: error.response?.data?.message || 'Error deleting complaint',
          severity: 'error',
        });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ed6c02';
      case 'Assigned': return '#9333ea';
      case 'In-Progress': return '#0284c7';
      case 'On-Hold': return '#f57c00';
      case 'Completed': return '#16a34a';
      default: return '#757575';
    }
  };

  const canDelete = (complaint) => {
    if (!complaint) return false;
    if (isSuperAdmin) return true;
    const currentUserId = user?.id || user?._id;
    const creatorId = complaint.raisedBy?._id || complaint.raisedBy;
    return Boolean(currentUserId && creatorId && String(currentUserId) === String(creatorId) && complaint.status === 'Pending');
  };

  // Filter staff according to chosen category filter inside the Assign Modal
  const modalFilteredStaff = useMemo(() => {
    if (assignCategoryFilter === 'ALL') {
      return staff;
    }
    return staff.filter(s => s.role?.name === assignCategoryFilter);
  }, [staff, assignCategoryFilter]);

  // Filtered Complaints List for the table
  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.complaintType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.block?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.room?.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.remarks?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.raisedBy?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.assignedTo?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.assignedTo?.role?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || item.complaintType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [complaints, searchQuery, statusFilter, typeFilter]);

  // Statistics Summary
  const stats = useMemo(() => {
    return {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'Pending').length,
      assigned: complaints.filter(c => c.status === 'Assigned').length,
      inProgress: complaints.filter(c => c.status === 'In-Progress').length,
      completed: complaints.filter(c => c.status === 'Completed').length,
    };
  }, [complaints]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Title & Role-Specific Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}
          >
            {isUser && 'My Raised Complaints'}
            {isSuperAdmin && 'Complaints Management & Category Assignment'}
            {isStaff && `Assigned Work Orders (${user?.role?.name || 'Staff'})`}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {isUser && 'Track the status and resolution progress of tickets you have submitted.'}
            {isSuperAdmin && 'Review user-raised complaints and assign them to matching category staff.'}
            {isStaff && 'Work orders assigned to your category. Update status as you investigate and resolve.'}
          </Typography>
        </Box>

        {/* User Role: Only User raises complaints */}
        {isUser && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/raise-complaint')}
            sx={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
              px: 3,
              py: 1.2,
              fontWeight: 700,
              borderRadius: 2.5,
              textTransform: 'none',
              fontSize: '0.95rem',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(79, 70, 229, 0.5)',
              }
            }}
          >
            Raise New Complaint
          </Button>
        )}
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {isUser ? 'My Total Tickets' : isStaff ? 'My Assigned Total' : 'Total Complaints'}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e3a8a', mt: 0.5 }}>
                  {stats.total}
                </Typography>
              </Box>
              <TicketIcon sx={{ fontSize: 38, color: '#3b82f6', opacity: 0.85 }} />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '1px solid #fed7aa' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#c2410c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {isSuperAdmin ? 'Pending Assignment' : 'Pending'}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#9a3412', mt: 0.5 }}>
                  {stats.pending}
                </Typography>
              </Box>
              <PendingIcon sx={{ fontSize: 38, color: '#f97316', opacity: 0.85 }} />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', border: '1px solid #ddd6fe' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6d28d9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Assigned / In-Progress
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#5b21b6', mt: 0.5 }}>
                  {stats.assigned + stats.inProgress}
                </Typography>
              </Box>
              <ProgressIcon sx={{ fontSize: 38, color: '#8b5cf6', opacity: 0.85 }} />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Completed / Resolved
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#166534', mt: 0.5 }}>
                  {stats.completed}
                </Typography>
              </Box>
              <CompletedIcon sx={{ fontSize: 38, color: '#22c55e', opacity: 0.85 }} />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Filter and Search Bar */}
      <Card sx={{ mb: 3, p: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by ID, category, room, remarks, user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={3.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="Pending">Pending Assignment</MenuItem>
                <MenuItem value="Assigned">Assigned</MenuItem>
                <MenuItem value="In-Progress">In-Progress</MenuItem>
                <MenuItem value="On-Hold">On-Hold</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter Category</InputLabel>
              <Select
                value={typeFilter}
                label="Filter Category"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Categories</MenuItem>
                <MenuItem value="Plumbing">Plumbing</MenuItem>
                <MenuItem value="Electrical">Electrical</MenuItem>
                <MenuItem value="Network">Network</MenuItem>
                <MenuItem value="PC Hardware">PC Hardware</MenuItem>
                <MenuItem value="PC Software">PC Software</MenuItem>
                <MenuItem value="Application Issues">Application Issues</MenuItem>
                <MenuItem value="Electronics">Electronics</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Main Table */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 750 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Ticket ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Location (Block & Room)</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Raised By</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Assigned Category Staff</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#334155' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredComplaints.map((complaint) => {
                  const catCfg = CATEGORY_CONFIG[complaint.complaintType] || CATEGORY_CONFIG['Other'];
                  const isAssigned = Boolean(complaint.assignedTo);

                  return (
                    <TableRow
                      key={complaint._id}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      {/* Ticket ID */}
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#4f46e5' }}>
                        #{complaint._id.slice(-6).toUpperCase()}
                      </TableCell>

                      {/* Complaint Category */}
                      <TableCell>
                        <Chip
                          icon={catCfg.icon}
                          label={complaint.complaintType}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            bgcolor: catCfg.bg,
                            color: catCfg.color,
                            border: `1px solid ${catCfg.border}`,
                            '& .MuiChip-icon': { color: catCfg.color }
                          }}
                        />
                      </TableCell>

                      {/* Location */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {complaint.room?.roomNumber || 'Room N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {complaint.block?.name || 'Block N/A'}
                        </Typography>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          label={complaint.status}
                          size="small"
                          sx={{
                            bgcolor: `${getStatusColor(complaint.status)}15`,
                            color: getStatusColor(complaint.status),
                            fontWeight: 700,
                            borderRadius: '6px',
                            border: `1px solid ${getStatusColor(complaint.status)}40`
                          }}
                        />
                      </TableCell>

                      {/* Raised By */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {complaint.raisedBy?.username || '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {complaint.raisedBy?.email || ''}
                        </Typography>
                      </TableCell>

                      {/* Assigned Category Staff */}
                      <TableCell>
                        {isAssigned ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: 13, bgcolor: '#4f46e5', fontWeight: 700 }}>
                              {complaint.assignedTo?.username?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
                                {complaint.assignedTo?.username}
                              </Typography>
                              <Chip
                                label={complaint.assignedTo?.role?.name || 'Staff'}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  bgcolor: '#f1f5f9',
                                  color: '#475569'
                                }}
                              />
                            </Box>
                          </Box>
                        ) : (
                          <Chip
                            label="Unassigned"
                            size="small"
                            sx={{
                              bgcolor: '#fff7ed',
                              color: '#c2410c',
                              border: '1px dashed #fed7aa',
                              fontWeight: 700,
                              fontSize: '0.72rem'
                            }}
                          />
                        )}
                      </TableCell>

                      {/* Date */}
                      <TableCell sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                          {/* Superadmin: Assign button for pending/unassigned */}
                          {isSuperAdmin && !isAssigned && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<AssignIcon fontSize="small" />}
                              onClick={() => openAssignModal(complaint)}
                              sx={{
                                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: 2,
                                px: 1.8,
                                py: 0.6,
                                fontSize: '0.78rem',
                                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
                              }}
                            >
                              Assign
                            </Button>
                          )}

                          {/* Superadmin: Reassign button for assigned */}
                          {isSuperAdmin && isAssigned && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => openAssignModal(complaint)}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: 2,
                                px: 1.4,
                                py: 0.5,
                                fontSize: '0.75rem',
                                borderColor: '#cbd5e1',
                                color: '#475569',
                                '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' }
                              }}
                            >
                              Reassign
                            </Button>
                          )}

                          {/* Staff: Direct Status Actions */}
                          {isStaff && complaint.status === 'Assigned' && (
                            <Button
                              variant="contained"
                              size="small"
                              color="info"
                              startIcon={<StartWorkIcon fontSize="small" />}
                              onClick={() => handleStatusUpdate(complaint._id, 'In-Progress')}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: 2,
                                fontSize: '0.75rem',
                                px: 1.5,
                              }}
                            >
                              Start Work
                            </Button>
                          )}

                          {isStaff && complaint.status === 'In-Progress' && (
                            <Button
                              variant="contained"
                              size="small"
                              color="success"
                              startIcon={<DoneIcon fontSize="small" />}
                              onClick={() => handleStatusUpdate(complaint._id, 'Completed')}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: 2,
                                fontSize: '0.75rem',
                                px: 1.5,
                              }}
                            >
                              Complete
                            </Button>
                          )}

                          {/* View details */}
                          <Tooltip title="View Details">
                            <IconButton onClick={() => { setSelectedComplaint(complaint); setViewOpen(true); }} size="small">
                              <ViewIcon fontSize="small" color="action" />
                            </IconButton>
                          </Tooltip>

                          {/* Additional menu */}
                          <IconButton onClick={(e) => handleMenuOpen(e, complaint)} size="small">
                            <MoreIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredComplaints.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography variant="h6" color="text.secondary">
                        No matching complaints found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {isStaff ? 'No tickets are currently assigned to your category.' : 'Try adjusting your search query or filters.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Row Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleView}>
          <ViewIcon fontSize="small" sx={{ mr: 1, color: '#4f46e5' }} /> View Full Details
        </MenuItem>
        {isSuperAdmin && (
          <MenuItem onClick={() => openAssignModal(selectedComplaint)}>
            <AssignIcon fontSize="small" sx={{ mr: 1, color: '#0284c7' }} /> Assign to Staff
          </MenuItem>
        )}
        {isStaff && (
          <MenuItem onClick={() => { handleMenuClose(); handleStatusUpdate(selectedComplaint?._id, 'In-Progress'); }}>
            <StartWorkIcon fontSize="small" sx={{ mr: 1, color: '#0284c7' }} /> Mark In-Progress
          </MenuItem>
        )}
        {isStaff && (
          <MenuItem onClick={() => { handleMenuClose(); handleStatusUpdate(selectedComplaint?._id, 'Completed'); }}>
            <DoneIcon fontSize="small" sx={{ mr: 1, color: '#16a34a' }} /> Mark Completed
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
        <DialogTitle sx={{ fontWeight: 800, pb: 1, background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          Complaint Details - #{selectedComplaint?._id?.slice(-6).toUpperCase()}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedComplaint && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Complaint Category</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b', mt: 0.5 }}>
                  {selectedComplaint.complaintType}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Status</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={selectedComplaint.status}
                    size="small"
                    sx={{
                      bgcolor: `${getStatusColor(selectedComplaint.status)}15`,
                      color: getStatusColor(selectedComplaint.status),
                      fontWeight: 700,
                    }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Block</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedComplaint.block?.name || 'N/A'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Room</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedComplaint.room?.roomNumber || 'N/A'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Raised By</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e40af' }}>
                  {selectedComplaint.raisedBy?.username} ({selectedComplaint.raisedBy?.email})
                </Typography>
                {selectedComplaint.raisedBy?.phone && (
                  <Typography variant="caption" color="text.secondary">
                    Contact: {selectedComplaint.raisedBy.phone}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Assigned Staff</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: selectedComplaint.assignedTo ? '#15803d' : '#94a3b8' }}>
                  {selectedComplaint.assignedTo
                    ? `${selectedComplaint.assignedTo.username} (${selectedComplaint.assignedTo.role?.name || 'Staff'})`
                    : 'Not Assigned Yet'}
                </Typography>
                {selectedComplaint.assignedTo?.email && (
                  <Typography variant="caption" color="text.secondary">
                    {selectedComplaint.assignedTo.email} {selectedComplaint.assignedTo.phone ? `| ${selectedComplaint.assignedTo.phone}` : ''}
                  </Typography>
                )}
              </Box>

              <Box sx={{ gridColumn: '1 / -1', bgcolor: '#f8fafc', p: 2.5, borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Remarks & Description
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-line', color: '#1e293b' }}>
                  {selectedComplaint.remarks}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Date Submitted</Typography>
                <Typography variant="body2">{new Date(selectedComplaint.createdAt).toLocaleString()}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          {isSuperAdmin && (
            <Button
              variant="contained"
              startIcon={<AssignIcon />}
              onClick={() => { setViewOpen(false); openAssignModal(selectedComplaint); }}
              sx={{ textTransform: 'none', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
            >
              Assign This Complaint
            </Button>
          )}
          {canDelete(selectedComplaint) && (
            <Button color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(selectedComplaint?._id)}>
              Delete Complaint
            </Button>
          )}
          <Button variant="outlined" onClick={() => setViewOpen(false)} sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* INTELLIGENT CATEGORY ASSIGN DIALOG (Superadmin Only) */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1, borderBottom: '1px solid #e2e8f0' }}>
          Assign Complaint #{selectedComplaint?._id?.slice(-6).toUpperCase()}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedComplaint && (
            <Box sx={{ mb: 3 }}>
              {/* Ticket Summary Card */}
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0', mb: 2.5 }}>
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Complaint Category</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#4f46e5' }}>
                      {selectedComplaint.complaintType}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Location</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedComplaint.block?.name || 'Block'} — {selectedComplaint.room?.roomNumber || 'Room'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Remarks</Typography>
                    <Typography variant="body2" sx={{ color: '#334155', fontStyle: 'italic' }}>
                      "{selectedComplaint.remarks}"
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Category Routing Helper Alert */}
              {COMPLAINT_TYPE_TO_ROLE[selectedComplaint.complaintType] && COMPLAINT_TYPE_TO_ROLE[selectedComplaint.complaintType] !== 'ALL' && (
                <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2, border: '1px solid #bfdbfe', '& .MuiAlert-icon': { color: '#2563eb' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Auto-Matched Category: <strong>{COMPLAINT_TYPE_TO_ROLE[selectedComplaint.complaintType]}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Staff list below is filtered to matching specialists for {selectedComplaint.complaintType}.
                  </Typography>
                </Alert>
              )}

              {/* Category Filter Selector */}
              <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
                <InputLabel>Filter Staff by Category</InputLabel>
                <Select
                  value={assignCategoryFilter}
                  label="Filter Staff by Category"
                  onChange={(e) => setAssignCategoryFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Categories / All Staff</MenuItem>
                  <MenuItem value="Plumber">Plumber (Plumbing issues)</MenuItem>
                  <MenuItem value="Electrician">Electrician (Electrical & Electronics)</MenuItem>
                  <MenuItem value="Networking Staff">Networking Staff (Network & Wi-Fi)</MenuItem>
                  <MenuItem value="Software Developer">Software Developer (PC & Applications)</MenuItem>
                  <MenuItem value="Faculty">Faculty</MenuItem>
                </Select>
              </FormControl>

              {/* Staff Member Selection List */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#334155' }}>
                Select Staff Member to Assign:
              </Typography>

              <Box sx={{ maxHeight: 220, overflowY: 'auto', pr: 0.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {modalFilteredStaff.map((s) => {
                  const isSelected = assignData.assignedTo === s._id;
                  const workload = staffWorkload[s._id] || 0;

                  return (
                    <Box
                      key={s._id}
                      onClick={() => setAssignData({ ...assignData, assignedTo: s._id })}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: isSelected ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                        bgcolor: isSelected ? '#eef2ff' : '#ffffff',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          borderColor: '#6366f1',
                          bgcolor: isSelected ? '#eef2ff' : '#f8fafc',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Radio checked={isSelected} size="small" sx={{ p: 0, color: '#4f46e5' }} />
                        <Avatar sx={{ width: 34, height: 34, bgcolor: '#4f46e5', fontWeight: 700, fontSize: 14 }}>
                          {s.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            {s.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {s.email}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={s.role?.name}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            bgcolor: isSelected ? '#4f46e5' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : '#334155'
                          }}
                        />
                        <Chip
                          label={`${workload} active`}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.65rem',
                            color: workload > 2 ? '#d97706' : '#16a34a',
                            borderColor: workload > 2 ? '#fcd34d' : '#86efac',
                            bgcolor: workload > 2 ? '#fffbeb' : '#f0fdf4'
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}

                {modalFilteredStaff.length === 0 && (
                  <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      No staff members found under "{assignCategoryFilter}".
                    </Typography>
                    <Button size="small" onClick={() => setAssignCategoryFilter('ALL')} sx={{ mt: 1, textTransform: 'none' }}>
                      Show All Staff
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Status Selection */}
              <FormControl fullWidth size="small" sx={{ mt: 2.5 }}>
                <InputLabel>Status After Assignment</InputLabel>
                <Select
                  value={assignData.status}
                  label="Status After Assignment"
                  onChange={(e) => setAssignData({ ...assignData, status: e.target.value })}
                >
                  <MenuItem value="Assigned">Assigned (Default)</MenuItem>
                  <MenuItem value="In-Progress">In-Progress</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAssignOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAssignSubmit}
            disabled={!assignData.assignedTo}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
            }}
          >
            Confirm & Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification Feedback */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={() => setFeedback({ ...feedback, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setFeedback({ ...feedback, open: false })}
          severity={feedback.severity}
          sx={{ width: '100%', borderRadius: 2.5, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Complaints;
