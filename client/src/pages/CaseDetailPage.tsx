import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { caseService, customerService, investigationService } from '../services/api';
import {
  Box,
  Button,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`case-tabpanel-${index}`}
      aria-labelledby={`case-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const CaseDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  
  const [caseData, setCaseData] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedCase, setEditedCase] = useState<any>({
    name: '',
    description: '',
    status: ''
  });
  
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('edit') === 'true' && isAdmin) {
      setIsEditMode(true);
    }
  }, [location.search, isAdmin]);
  
  useEffect(() => {
    const fetchCaseData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError('');
        
        const response = await caseService.getCaseById(parseInt(id));
        setCaseData(response.data.case);
        setEditedCase({
          name: response.data.case.name,
          description: response.data.case.description,
          status: response.data.case.status
        });
        
        const customersResponse = await customerService.getCustomersByCase(parseInt(id));
        setCustomers(customersResponse.data.customers);
        
        const investigationsResponse = await investigationService.getInvestigationsByCase(parseInt(id));
        setInvestigations(investigationsResponse.data.investigations);
      } catch (err) {
        console.error('Error fetching case data:', err);
        setError(t('errors.serverError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchCaseData();
  }, [id, t]);
  
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleEditToggle = () => {
    if (isEditMode) {
      setEditedCase({
        name: caseData.name,
        description: caseData.description,
        status: caseData.status
      });
    }
    setIsEditMode(!isEditMode);
  };
  
  const handleUpdateCase = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await caseService.updateCase(parseInt(id), editedCase);
      setCaseData(response.data.case);
      setIsEditMode(false);
    } catch (err) {
      console.error('Error updating case:', err);
      setError(t('errors.serverError'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };
  
  const handleDeleteCase = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      await caseService.deleteCase(parseInt(id));
      navigate('/cases');
    } catch (err) {
      console.error('Error deleting case:', err);
      setError(t('errors.serverError'));
    } finally {
      setLoading(false);
      handleCloseDeleteDialog();
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'primary';
      case 'in_progress':
        return 'warning';
      case 'closed':
        return 'success';
      case 'on_hold':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const getStatusText = (status: string) => {
    return t(`common.${status}`);
  };
  
  if (loading && !caseData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error && !caseData) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!caseData) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {t('cases.caseNotFound')}
      </Alert>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/cases')}
          sx={{ mr: 2 }}
        >
          {t('common.back')}
        </Button>
        
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {t('cases.caseDetails')}
        </Typography>
        
        {isAdmin && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isEditMode ? (
              <>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<CancelIcon />}
                  onClick={handleEditToggle}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleUpdateCase}
                >
                  {t('common.save')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={handleEditToggle}
                >
                  {t('common.edit')}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleOpenDeleteDialog}
                >
                  {t('common.delete')}
                </Button>
              </>
            )}
          </Box>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={2} sx={{ mb: 3, p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {isEditMode ? (
              <TextField
                fullWidth
                label={t('cases.caseName')}
                value={editedCase.name}
                onChange={(e) => setEditedCase({ ...editedCase, name: e.target.value })}
                margin="normal"
                variant="outlined"
              />
            ) : (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('cases.caseName')}
                </Typography>
                <Typography variant="h5" gutterBottom>
                  {caseData.name}
                </Typography>
              </>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {isEditMode ? (
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel id="status-label">{t('cases.caseStatus')}</InputLabel>
                <Select
                  labelId="status-label"
                  value={editedCase.status}
                  onChange={(e) => setEditedCase({ ...editedCase, status: e.target.value })}
                  label={t('cases.caseStatus')}
                >
                  <MenuItem value="open">{t('common.open')}</MenuItem>
                  <MenuItem value="in_progress">{t('common.inProgress')}</MenuItem>
                  <MenuItem value="closed">{t('common.closed')}</MenuItem>
                  <MenuItem value="on_hold">{t('common.onHold')}</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('cases.caseStatus')}
                </Typography>
                <Chip 
                  label={getStatusText(caseData.status)} 
                  color={getStatusColor(caseData.status) as any}
                  sx={{ mt: 1 }}
                />
              </>
            )}
          </Grid>
          
          <Grid item xs={12}>
            {isEditMode ? (
              <TextField
                fullWidth
                label={t('cases.caseDescription')}
                value={editedCase.description}
                onChange={(e) => setEditedCase({ ...editedCase, description: e.target.value })}
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
              />
            ) : (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('cases.caseDescription')}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {caseData.description || t('common.noData')}
                </Typography>
              </>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              {t('common.createdAt')}
            </Typography>
            <Typography variant="body1">
              {new Date(caseData.created_at).toLocaleString('ja-JP')}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              {t('common.updatedAt')}
            </Typography>
            <Typography variant="body1">
              {new Date(caseData.updated_at).toLocaleString('ja-JP')}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={2}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="case details tabs">
            <Tab label={t('cases.relatedCustomers')} />
            <Tab label={t('cases.relatedInvestigations')} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {customers.length === 0 ? (
            <Typography>{t('common.noData')}</Typography>
          ) : (
            <List>
              {customers.map((customer) => (
                <React.Fragment key={customer.id}>
                  <ListItem>
                    <ListItemText
                      primary={customer.name}
                      secondary={`${customer.email} | ${customer.phone}`}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/customers/${customer.id}`)}
                      >
                        {t('common.details')}
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {investigations.length === 0 ? (
            <Typography>{t('common.noData')}</Typography>
          ) : (
            <List>
              {investigations.map((investigation) => (
                <React.Fragment key={investigation.id}>
                  <ListItem>
                    <ListItemText
                      primary={investigation.title}
                      secondary={
                        <>
                          <Chip 
                            label={getStatusText(investigation.status)} 
                            color={getStatusColor(investigation.status) as any}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          {investigation.start_date && (
                            <span>
                              {t('common.startDate')}: {new Date(investigation.start_date).toLocaleDateString('ja-JP')}
                            </span>
                          )}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/investigations/${investigation.id}`)}
                      >
                        {t('common.details')}
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </TabPanel>
      </Paper>
      
      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>{t('common.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('cases.confirmDeleteCase', { name: caseData.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleDeleteCase} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CaseDetailPage;
