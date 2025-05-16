import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { customerService, caseService } from '../services/api';
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

const CustomerDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  
  const [customer, setCustomer] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<any>({
    name: '',
    email: '',
    phone: '',
    address: '',
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
    const fetchCustomerData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError('');
        
        const response = await customerService.getCustomerById(parseInt(id));
        setCustomer(response.data.customer);
        setEditedCustomer({
          name: response.data.customer.name,
          email: response.data.customer.email,
          phone: response.data.customer.phone,
          address: response.data.customer.address,
          case_id: response.data.customer.case_id
        });
        
        if (isAdmin) {
          const casesResponse = await caseService.getAllCases(1, 100);
          setCases(casesResponse.data.cases);
        }
      } catch (err) {
        console.error('Error fetching customer data:', err);
        setError(t('errors.serverError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomerData();
  }, [id, t, isAdmin]);
  
  const handleEditToggle = () => {
    if (isEditMode) {
      setEditedCustomer({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        case_id: customer.case_id
      });
    }
    setIsEditMode(!isEditMode);
  };
  
  const handleUpdateCustomer = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await customerService.updateCustomer(parseInt(id), editedCustomer);
      setCustomer(response.data.customer);
      setIsEditMode(false);
    } catch (err) {
      console.error('Error updating customer:', err);
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
  
  const handleDeleteCustomer = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      await customerService.deleteCustomer(parseInt(id));
      navigate('/customers');
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError(t('errors.serverError'));
    } finally {
      setLoading(false);
      handleCloseDeleteDialog();
    }
  };
  
  const getCaseName = (caseId: number) => {
    const caseItem = cases.find(c => c.id === caseId);
    return caseItem ? caseItem.name : '-';
  };
  
  if (loading && !customer) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error && !customer) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!customer) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {t('customers.customerNotFound')}
      </Alert>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/customers')}
          sx={{ mr: 2 }}
        >
          {t('common.back')}
        </Button>
        
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {t('customers.customerDetails')}
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
                  onClick={handleUpdateCustomer}
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
                label={t('customers.customerName')}
                value={editedCustomer.name}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, name: e.target.value })}
                margin="normal"
                variant="outlined"
              />
            ) : (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('customers.customerName')}
                </Typography>
                <Typography variant="h5" gutterBottom>
                  {customer.name}
                </Typography>
              </>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {isEditMode ? (
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel id="case-label">{t('customers.relatedCase')}</InputLabel>
                <Select
                  labelId="case-label"
                  value={editedCustomer.case_id}
                  onChange={(e) => setEditedCustomer({ ...editedCustomer, case_id: e.target.value })}
                  label={t('customers.relatedCase')}
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
                  {t('customers.relatedCase')}
                </Typography>
                <Typography variant="body1">
                  {getCaseName(customer.case_id)}
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate(`/cases/${customer.case_id}`)}
                  sx={{ mt: 1 }}
                >
                  {t('common.viewCase')}
                </Button>
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
                label={t('customers.customerEmail')}
                value={editedCustomer.email}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, email: e.target.value })}
                margin="normal"
                variant="outlined"
              />
            ) : (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('customers.customerEmail')}
                </Typography>
                <Typography variant="body1">
                  {customer.email || t('common.noData')}
                </Typography>
              </>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {isEditMode ? (
              <TextField
                fullWidth
                label={t('customers.customerPhone')}
                value={editedCustomer.phone}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, phone: e.target.value })}
                margin="normal"
                variant="outlined"
              />
            ) : (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('customers.customerPhone')}
                </Typography>
                <Typography variant="body1">
                  {customer.phone || t('common.noData')}
                </Typography>
              </>
            )}
          </Grid>
          
          <Grid item xs={12}>
            {isEditMode ? (
              <TextField
                fullWidth
                label={t('customers.customerAddress')}
                value={editedCustomer.address}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, address: e.target.value })}
                margin="normal"
                variant="outlined"
                multiline
                rows={3}
              />
            ) : (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('customers.customerAddress')}
                </Typography>
                <Typography variant="body1">
                  {customer.address || t('common.noData')}
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
              {new Date(customer.created_at).toLocaleString('ja-JP')}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              {t('common.updatedAt')}
            </Typography>
            <Typography variant="body1">
              {new Date(customer.updated_at).toLocaleString('ja-JP')}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>{t('common.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('customers.confirmDeleteCustomer', { name: customer.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleDeleteCustomer} 
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

export default CustomerDetailPage;
