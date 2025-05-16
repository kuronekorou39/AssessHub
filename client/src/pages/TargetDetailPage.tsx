import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { targetService, investigationService } from '../services/api';
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

const TargetDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  
  const [target, setTarget] = useState<any>(null);
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTarget, setEditedTarget] = useState<any>({
    name: '',
    type: '',
    details: '',
    status: '',
    investigation_id: ''
  });
  
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('edit') === 'true' && isAdmin) {
      setIsEditMode(true);
    }
  }, [location.search, isAdmin]);
  
  useEffect(() => {
    const fetchTargetData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError('');
        
        const response = await targetService.getTargetById(parseInt(id));
        setTarget(response.data.target);
        setEditedTarget({
          name: response.data.target.name,
          type: response.data.target.type,
          details: response.data.target.details,
          status: response.data.target.status,
          investigation_id: response.data.target.investigation_id
        });
        
        if (isAdmin) {
          const investigationsResponse = await investigationService.getAllInvestigations(1, 100);
          setInvestigations(investigationsResponse.data.investigations);
        }
      } catch (err) {
        console.error('Error fetching target data:', err);
        setError(t('errors.serverError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchTargetData();
  }, [id, t, isAdmin]);
  
  const handleEditToggle = () => {
    if (isEditMode) {
      setEditedTarget({
        name: target.name,
        type: target.type,
        details: target.details,
        status: target.status,
        investigation_id: target.investigation_id
      });
    }
    setIsEditMode(!isEditMode);
  };
  
  const handleUpdateTarget = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await targetService.updateTarget(parseInt(id), editedTarget);
      setTarget(response.data.target);
      setIsEditMode(false);
    } catch (err) {
      console.error('Error updating target:', err);
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
  
  const handleDeleteTarget = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      await targetService.deleteTarget(parseInt(id));
      navigate('/targets');
    } catch (err) {
      console.error('Error deleting target:', err);
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
  
  const getInvestigationTitle = (investigationId: number) => {
    const investigation = investigations.find(i => i.id === investigationId);
    return investigation ? investigation.title : '-';
  };
  
  if (loading && !target) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error && !target) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!target) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {t('targets.targetNotFound')}
      </Alert>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/targets')}
          sx={{ mr: 2 }}
        >
          {t('common.back')}
        </Button>
        
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {t('targets.targetDetails')}
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
                  onClick={handleUpdateTarget}
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
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {isEditMode ? (
              <TextField
                fullWidth
                label={t('targets.targetName')}
                value={editedTarget.name}
                onChange={(e) => setEditedTarget({ ...editedTarget, name: e.target.value })}
                margin="normal"
                variant="outlined"
              />
            ) : (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('targets.targetName')}
                </Typography>
                <Typography variant="h5" gutterBottom>
                  {target.name}
                </Typography>
              </>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {isEditMode ? (
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel id="status-label">{t('targets.targetStatus')}</InputLabel>
                <Select
                  labelId="status-label"
                  value={editedTarget.status}
                  onChange={(e) => setEditedTarget({ ...editedTarget, status: e.target.value })}
                  label={t('targets.targetStatus')}
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
                  {t('targets.targetStatus')}
                </Typography>
                <Typography variant="body1">
                  <Typography component="span">
                    <Chip 
                      label={getStatusText(target.status)} 
                      color={getStatusColor(target.status) as any}
                      sx={{ mt: 1 }}
                    />
                  </Typography>
                </Typography>
              </>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {isEditMode ? (
              <TextField
                fullWidth
                label={t('targets.targetType')}
                value={editedTarget.type}
                onChange={(e) => setEditedTarget({ ...editedTarget, type: e.target.value })}
                margin="normal"
                variant="outlined"
              />
            ) : (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('targets.targetType')}
                </Typography>
                <Typography variant="body1">
                  {target.type || t('common.noData')}
                </Typography>
              </>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {isEditMode ? (
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel id="investigation-label">{t('targets.relatedInvestigation')}</InputLabel>
                <Select
                  labelId="investigation-label"
                  value={editedTarget.investigation_id}
                  onChange={(e) => setEditedTarget({ ...editedTarget, investigation_id: e.target.value })}
                  label={t('targets.relatedInvestigation')}
                >
                  {investigations.map((investigation) => (
                    <MenuItem key={investigation.id} value={investigation.id}>
                      {investigation.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('targets.relatedInvestigation')}
                </Typography>
                <Typography variant="body1">
                  {getInvestigationTitle(target.investigation_id)}
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate(`/investigations/${target.investigation_id}`)}
                  sx={{ mt: 1 }}
                >
                  {t('common.viewInvestigation')}
                </Button>
              </>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          
          <Grid item xs={12}>
            {isEditMode ? (
              <TextField
                fullWidth
                label={t('targets.targetDetails')}
                value={editedTarget.details}
                onChange={(e) => setEditedTarget({ ...editedTarget, details: e.target.value })}
                margin="normal"
                variant="outlined"
                multiline
                rows={6}
              />
            ) : (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('targets.targetDetails')}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                  {target.details || t('common.noData')}
                </Typography>
              </>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              {t('common.createdAt')}
            </Typography>
            <Typography variant="body1">
              {new Date(target.created_at).toLocaleString('ja-JP')}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              {t('common.updatedAt')}
            </Typography>
            <Typography variant="body1">
              {new Date(target.updated_at).toLocaleString('ja-JP')}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>{t('common.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('targets.confirmDeleteTarget', { name: target.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleDeleteTarget} 
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

export default TargetDetailPage;
