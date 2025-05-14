import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { investigationService, targetService, caseService } from '../services/api';
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
      id={`investigation-tabpanel-${index}`}
      aria-labelledby={`investigation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const InvestigationDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  
  const [investigation, setInvestigation] = useState<any>(null);
  const [targets, setTargets] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedInvestigation, setEditedInvestigation] = useState<any>({
    title: '',
    description: '',
    status: '',
    start_date: '',
    end_date: '',
    case_id: ''
  });
  
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('edit') === 'true' && isAdmin) {
      setIsEditMode(true);
    }
  }, [location.search, isAdmin]);
  
  useEffect(() => {
    const fetchInvestigationData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError('');
        
        const response = await investigationService.getInvestigationById(parseInt(id));
        setInvestigation(response.data.investigation);
        setEditedInvestigation({
          title: response.data.investigation.title,
          description: response.data.investigation.description,
          status: response.data.investigation.status,
          start_date: response.data.investigation.start_date ? response.data.investigation.start_date.split('T')[0] : '',
          end_date: response.data.investigation.end_date ? response.data.investigation.end_date.split('T')[0] : '',
          case_id: response.data.investigation.case_id
        });
        
        const targetsResponse = await targetService.getTargetsByInvestigation(parseInt(id));
        setTargets(targetsResponse.data.targets);
        
        if (isAdmin) {
          const casesResponse = await caseService.getAllCases(1, 100);
          setCases(casesResponse.data.cases);
        }
      } catch (err) {
        console.error('Error fetching investigation data:', err);
        setError(t('errors.serverError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvestigationData();
  }, [id, t, isAdmin]);
  
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleEditToggle = () => {
    if (isEditMode) {
      setEditedInvestigation({
        title: investigation.title,
        description: investigation.description,
        status: investigation.status,
        start_date: investigation.start_date ? investigation.start_date.split('T')[0] : '',
        end_date: investigation.end_date ? investigation.end_date.split('T')[0] : '',
        case_id: investigation.case_id
      });
    }
    setIsEditMode(!isEditMode);
  };
  
  const handleUpdateInvestigation = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await investigationService.updateInvestigation(parseInt(id), editedInvestigation);
      setInvestigation(response.data.investigation);
      setIsEditMode(false);
    } catch (err) {
      console.error('Error updating investigation:', err);
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
  
  const handleDeleteInvestigation = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      await investigationService.deleteInvestigation(parseInt(id));
      navigate('/investigations');
    } catch (err) {
      console.error('Error deleting investigation:', err);
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
  
  const getCaseName = (caseId: number) => {
    const caseItem = cases.find(c => c.id === caseId);
    return caseItem ? caseItem.name : '-';
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ja-JP');
  };
  
  if (loading && !investigation) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error && !investigation) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!investigation) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {t('investigations.investigationNotFound')}
      </Alert>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/investigations')}
          sx={{ mr: 2 }}
        >
          {t('common.back')}
        </Button>
        
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {t('investigations.investigationDetails')}
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
                  onClick={handleUpdateInvestigation}
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
                label={t('investigations.investigationTitle')}
                value={editedInvestigation.title}
                onChange={(e) => setEditedInvestigation({ ...editedInvestigation, title: e.target.value })}
                margin="normal"
                variant="outlined"
              />
            ) : (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('investigations.investigationTitle')}
                </Typography>
                <Typography variant="h5" gutterBottom>
                  {investigation.title}
                </Typography>
              </>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {isEditMode ? (
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel id="status-label">{t('investigations.investigationStatus')}</InputLabel>
                <Select
                  labelId="status-label"
                  value={editedInvestigation.status}
                  onChange={(e) => setEditedInvestigation({ ...editedInvestigation, status: e.target.value })}
                  label={t('investigations.investigationStatus')}
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
                  {t('investigations.investigationStatus')}
                </Typography>
                <Chip 
                  label={getStatusText(investigation.status)} 
                  color={getStatusColor(investigation.status) as any}
                  sx={{ mt: 1 }}
                />
              </>
            )}
          </Grid>
          
          <Grid item xs={12}>
            {isEditMode ? (
              <TextField
                fullWidth
                label={t('investigations.investigationDescription')}
                value={editedInvestigation.description}
                onChange={(e) => setEditedInvestigation({ ...editedInvestigation, description: e.target.value })}
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
              />
            ) : (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('investigations.investigationDescription')}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {investigation.description || t('common.noData')}
                </Typography>
              </>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          
          <Grid item xs={12} md={6}>
            {isEditMode ? (
              <TextField
                fullWidth
                label={t('investigations.investigationStartDate')}
                type="date"
                value={editedInvestigation.start_date}
                onChange={(e) => setEditedInvestigation({ ...editedInvestigation, start_date: e.target.value })}
                margin="normal"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            ) : (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('investigations.investigationStartDate')}
                </Typography>
                <Typography variant="body1">
                  {formatDate(investigation.start_date)}
                </Typography>
              </>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {isEditMode ? (
              <TextField
                fullWidth
                label={t('investigations.investigationEndDate')}
                type="date"
                value={editedInvestigation.end_date}
                onChange={(e) => setEditedInvestigation({ ...editedInvestigation, end_date: e.target.value })}
                margin="normal"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            ) : (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('investigations.investigationEndDate')}
                </Typography>
                <Typography variant="body1">
                  {formatDate(investigation.end_date)}
                </Typography>
              </>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {isEditMode ? (
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel id="case-label">{t('investigations.relatedCase')}</InputLabel>
                <Select
                  labelId="case-label"
                  value={editedInvestigation.case_id}
                  onChange={(e) => setEditedInvestigation({ ...editedInvestigation, case_id: e.target.value })}
                  label={t('investigations.relatedCase')}
                >
                  {cases.map((caseItem) => (
                    <MenuItem key={caseItem.id} value={caseItem.id}>
                      {caseItem.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('investigations.relatedCase')}
                </Typography>
                <Typography variant="body1">
                  {getCaseName(investigation.case_id)}
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate(`/cases/${investigation.case_id}`)}
                  sx={{ mt: 1 }}
                >
                  {t('common.viewCase')}
                </Button>
              </>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              {t('common.createdAt')}
            </Typography>
            <Typography variant="body1">
              {new Date(investigation.created_at).toLocaleString('ja-JP')}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={2}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="investigation details tabs">
            <Tab label={t('investigations.relatedTargets')} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {targets.length === 0 ? (
            <Typography>{t('common.noData')}</Typography>
          ) : (
            <List>
              {targets.map((target) => (
                <React.Fragment key={target.id}>
                  <ListItem>
                    <ListItemText
                      primary={target.name}
                      secondary={
                        <>
                          <Chip 
                            label={getStatusText(target.status)} 
                            color={getStatusColor(target.status) as any}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <span>{t('targets.targetType')}: {target.type}</span>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/targets/${target.id}`)}
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
            {t('investigations.confirmDeleteInvestigation', { title: investigation.title })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleDeleteInvestigation} 
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

export default InvestigationDetailPage;
