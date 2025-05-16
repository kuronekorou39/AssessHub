import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { 
  caseService, 
  customerService, 
  investigationService, 
  targetService 
} from '../services/api';

interface SummaryData {
  totalCases: number;
  totalCustomers: number;
  totalInvestigations: number;
  totalTargets: number;
  caseStatusDistribution: { name: string; value: number; }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalCases: 0,
    totalCustomers: 0,
    totalInvestigations: 0,
    totalTargets: 0,
    caseStatusDistribution: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const casesResponse = await caseService.getAllCases(1, 1);
        const customersResponse = await customerService.getAllCustomers(1, 1);
        const investigationsResponse = await investigationService.getAllInvestigations(1, 1);
        const targetsResponse = await targetService.getAllTargets(1, 1);
        
        const allCases = await caseService.getAllCases(1, 100);
        const statusCounts: Record<string, number> = {};
        
        allCases.data.cases.forEach((caseItem: any) => {
          statusCounts[caseItem.status] = (statusCounts[caseItem.status] || 0) + 1;
        });
        
        const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
          name: t(`common.${name}`),
          value
        }));
        
        setSummaryData({
          totalCases: casesResponse.data.pagination.total,
          totalCustomers: customersResponse.data.pagination.total,
          totalInvestigations: investigationsResponse.data.pagination.total,
          totalTargets: targetsResponse.data.pagination.total,
          caseStatusDistribution: statusDistribution
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [t]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        {t('dashboard.title')}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              {t('dashboard.totalCases')}
            </Typography>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {summaryData.totalCases}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              {t('dashboard.totalCustomers')}
            </Typography>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {summaryData.totalCustomers}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              {t('dashboard.totalInvestigations')}
            </Typography>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {summaryData.totalInvestigations}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              {t('dashboard.totalTargets')}
            </Typography>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {summaryData.totalTargets}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Status Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.statusDistribution')}
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summaryData.caseStatusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {summaryData.caseStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Quick Links */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.quickLinks')}
            </Typography>
            <List>
              <ListItem button component="a" href="/cases">
                <ListItemText primary={t('common.cases')} />
              </ListItem>
              <Divider />
              <ListItem button component="a" href="/customers">
                <ListItemText primary={t('common.customers')} />
              </ListItem>
              <Divider />
              <ListItem button component="a" href="/investigations">
                <ListItemText primary={t('common.investigations')} />
              </ListItem>
              <Divider />
              <ListItem button component="a" href="/targets">
                <ListItemText primary={t('common.targets')} />
              </ListItem>
              <Divider />
              <ListItem button component="a" href="/search">
                <ListItemText primary={t('common.advancedSearch')} />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
