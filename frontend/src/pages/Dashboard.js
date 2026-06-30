import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import {
  ConfirmationNumber as TicketIcon,
  PendingActions as PendingIcon,
  Assignment as AssignedIcon,
  CheckCircle as CompletedIcon,
  PlayCircle as InProgressIcon,
  PauseCircle as OnHoldIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const statCards = [
    { title: 'Total Complaints', value: stats?.totalComplaints || 0, icon: <TicketIcon />, color: '#4f46e5', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: 'Pending', value: stats?.pendingComplaints || 0, icon: <PendingIcon />, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' },
    { title: 'Assigned', value: stats?.assignedComplaints || 0, icon: <AssignedIcon />, color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' },
    { title: 'In Progress', value: stats?.inProgressComplaints || 0, icon: <InProgressIcon />, color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)' },
    { title: 'On Hold', value: stats?.onHoldComplaints || 0, icon: <OnHoldIcon />, color: '#f97316', gradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)' },
    { title: 'Completed', value: stats?.closedComplaints || 0, icon: <CompletedIcon />, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
  ];

  const statusData = stats ? [
    { name: 'Pending', value: stats.pendingComplaints, color: '#f59e0b' },
    { name: 'Assigned', value: stats.assignedComplaints, color: '#8b5cf6' },
    { name: 'In Progress', value: stats.inProgressComplaints, color: '#06b6d4' },
    { name: 'On Hold', value: stats.onHoldComplaints, color: '#f97316' },
    { name: 'Completed', value: stats.closedComplaints, color: '#10b981' },
  ] : [];

  const completionRate = stats?.totalComplaints ? ((stats.closedComplaints / stats.totalComplaints) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderRadius: 3
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={50} sx={{ color: '#4f46e5' }} />
          <Typography variant="body1" sx={{ mt: 2, color: '#64748b', fontWeight: 500 }}>
            Loading your dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100%',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      p: 3,
      borderRadius: 3
    }}>
      {/* Header Section */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        borderRadius: 3, 
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        color: 'white',
        boxShadow: '0 10px 40px rgba(79, 70, 229, 0.3)'
      }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Welcome back, {user?.username}! 👋
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
          Here's an overview of all your tickets and their current status.
        </Typography>
        <Box sx={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: 1, 
          mt: 2, 
          px: 2, 
          py: 1, 
          borderRadius: 2, 
          bgcolor: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <TimeIcon sx={{ fontSize: 18 }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Last updated: Just now
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                transition: 'all 0.3s ease',
                border: 'none',
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: stat.gradient,
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 1, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: stat.gradient,
                      color: 'white',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Status Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: 3,
            border: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <TrendingUpIcon sx={{ color: '#4f46e5' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Complaints by Status
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 8, 
                      border: 'none', 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      fontWeight: 600
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                {statusData.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
                      {item.name}: {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: 3,
            border: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <TrendingUpIcon sx={{ color: '#4f46e5' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Quick Overview
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 3, 
                    borderRadius: 3, 
                    background: `linear-gradient(135deg, ${getRoleColor(user?.role?.name)}20 0%, ${getRoleColor(user?.role?.name)}10 100%)`,
                    border: `1px solid ${getRoleColor(user?.role?.name)}30`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: 4,
                      height: '100%',
                      background: getRoleColor(user?.role?.name),
                    }
                  }}>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 0.5 }}>
                      Your Role
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: getRoleColor(user?.role?.name) }}>
                      {user?.role?.name}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ 
                    p: 2.5, 
                    borderRadius: 3, 
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    border: '1px solid #bae6fd',
                    textAlign: 'center'
                  }}>
                    <Typography variant="body2" sx={{ color: '#0369a1', fontWeight: 600, mb: 0.5 }}>
                      Total Tickets
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0369a1' }}>
                      {stats?.totalComplaints || 0}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ 
                    p: 2.5, 
                    borderRadius: 3, 
                    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                    border: '1px solid #6ee7b7',
                    textAlign: 'center'
                  }}>
                    <Typography variant="body2" sx={{ color: '#047857', fontWeight: 600, mb: 0.5 }}>
                      Completion Rate
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981' }}>
                      {completionRate}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
