import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { Download as DownloadIcon, Assessment as ReportIcon } from '@mui/icons-material';
import { reportAPI, departmentAPI, programmeAPI, userAPI } from '../services/api';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [staff, setStaff] = useState([]);
  const [filters, setFilters] = useState({
    department: '',
    programme: '',
    complaintType: '',
    status: '',
    assignee: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptResponse, progResponse, userResponse] = await Promise.all([
        departmentAPI.getAll(),
        programmeAPI.getAll(),
        userAPI.getAll(),
      ]);
      setDepartments(deptResponse.data);
      setProgrammes(progResponse.data);
      const staffRoles = ['Networking Staff', 'Plumber', 'Electrician', 'Software Developer'];
      setStaff(userResponse.data.filter(u => staffRoles.includes(u.role?.name)));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const params = {};
      if (filters.department) params.department = filters.department;
      if (filters.programme) params.programme = filters.programme;
      if (filters.complaintType) params.complaintType = filters.complaintType;
      if (filters.status) params.status = filters.status;
      if (filters.assignee) params.assignee = filters.assignee;

      const response = await reportAPI.generate(params);
      setReportData(response.data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.department) params.department = filters.department;
      if (filters.programme) params.programme = filters.programme;
      if (filters.complaintType) params.complaintType = filters.complaintType;
      if (filters.status) params.status = filters.status;
      if (filters.assignee) params.assignee = filters.assignee;

      const response = await reportAPI.export(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'complaint_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setLoading(false);
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

  const statuses = ['Pending', 'Assigned', 'In-Progress', 'On-Hold', 'Completed'];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Reports
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Generate and export complaint reports with various filters.
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={filters.department}
                  label="Department"
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select
                  value={filters.programme}
                  label="Programme"
                  onChange={(e) => setFilters({ ...filters, programme: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  {programmes.map((prog) => (
                    <MenuItem key={prog._id} value={prog._id}>
                      {prog.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Complaint Type</InputLabel>
                <Select
                  value={filters.complaintType}
                  label="Complaint Type"
                  onChange={(e) => setFilters({ ...filters, complaintType: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  {complaintTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Assignee</InputLabel>
                <Select
                  value={filters.assignee}
                  label="Assignee"
                  onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  {staff.map((s) => (
                    <MenuItem key={s._id} value={s._id}>
                      {s.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleGenerate}
                  disabled={generating}
                  startIcon={generating ? <CircularProgress size={20} /> : <ReportIcon />}
                >
                  Generate
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleExport}
                  disabled={loading || !reportData}
                  startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
                >
                  Export
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                    {reportData.totalComplaints}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#ed6c02' }}>
                    {reportData.pendingComplaints}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                    {reportData.assignedComplaints}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assigned
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#0288d1' }}>
                    {reportData.inProgressComplaints}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#f57c00' }}>
                    {reportData.onHoldComplaints}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    On Hold
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                    {reportData.completedComplaints}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Complaints Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Complaint Details
              </Typography>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Block</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Room</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Raised By</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.complaints.map((complaint) => (
                      <TableRow key={complaint._id} hover>
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
                      </TableRow>
                    ))}
                    {reportData.complaints.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          No complaints found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default Reports;
