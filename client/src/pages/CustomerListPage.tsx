import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { customerService, caseService } from '../services/api';
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  case_id: number;
  created_at: string;
  updated_at: string;
}

interface Case {
  id: number;
  name: string;
}

const CustomerListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    case_id: 0
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await customerService.getAllCustomers(page + 1, rowsPerPage);
      setCustomers(response.data.customers);
      setTotalCount(response.data.pagination.total);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(t('errors.serverError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const response = await caseService.getAllCases(1, 100);
      setCases(response.data.cases);
    } catch (err) {
      console.error('Error fetching cases:', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    if (isAdmin) {
      fetchCases();
    }
  }, [page, rowsPerPage, t, isAdmin]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewCustomer = (customerId: number) => {
    navigate(`/customers/${customerId}`);
  };

  const handleOpenCreateDialog = () => {
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
      address: '',
      case_id: cases.length > 0 ? cases[0].id : 0
    });
    setFormError('');
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name) {
      setFormError(t('customers.customerNameRequired'));
      return;
    }

    if (!newCustomer.case_id) {
      setFormError(t('customers.caseRequired'));
      return;
    }

    try {
      setFormLoading(true);
      setFormError('');
      
      await customerService.createCustomer(newCustomer);
      handleCloseCreateDialog();
      fetchCustomers();
    } catch (err) {
      console.error('Error creating customer:', err);
      setFormError(t('errors.serverError'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenDeleteDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedCustomer(null);
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      setFormLoading(true);
      
      await customerService.deleteCustomer(selectedCustomer.id);
      handleCloseDeleteDialog();
      fetchCustomers();
    } catch (err) {
      console.error('Error deleting customer:', err);
      setFormError(t('errors.serverError'));
    } finally {
      setFormLoading(false);
    }
  };

  const getCaseName = (caseId: number) => {
    const caseItem = cases.find(c => c.id === caseId);
    return caseItem ? caseItem.name : '-';
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('customers.title')}
        </Typography>
        
        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            {t('customers.createCustomer')}
          </Button>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('common.id')}</TableCell>
                <TableCell>{t('common.name')}</TableCell>
                <TableCell>{t('common.email')}</TableCell>
                <TableCell>{t('common.phone')}</TableCell>
                <TableCell>{t('customers.relatedCase')}</TableCell>
                <TableCell>{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {t('common.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.id}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{getCaseName(customer.case_id)}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewCustomer(customer.id)}
                        size="small"
                      >
                        <ViewIcon />
                      </IconButton>
                      
                      {isAdmin && (
                        <>
                          <IconButton
                            color="primary"
                            onClick={() => navigate(`/customers/${customer.id}?edit=true`)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          
                          <IconButton
                            color="error"
                            onClick={() => handleOpenDeleteDialog(customer)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage={t('common.rowsPerPage')}
        />
      </Paper>
      
      {/* Create Customer Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{t('customers.createCustomer')}</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label={t('customers.customerName')}
            type="text"
            fullWidth
            variant="outlined"
            value={newCustomer.name}
            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="email"
            label={t('customers.customerEmail')}
            type="email"
            fullWidth
            variant="outlined"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="phone"
            label={t('customers.customerPhone')}
            type="text"
            fullWidth
            variant="outlined"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="address"
            label={t('customers.customerAddress')}
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={newCustomer.address}
            onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth variant="outlined">
            <InputLabel id="case-label">{t('customers.relatedCase')}</InputLabel>
            <Select
              labelId="case-label"
              id="case_id"
              value={newCustomer.case_id || ''}
              onChange={(e) => setNewCustomer({ ...newCustomer, case_id: Number(e.target.value) })}
              label={t('customers.relatedCase')}
            >
              {cases.map((caseItem) => (
                <MenuItem key={caseItem.id} value={caseItem.id}>
                  {caseItem.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog} disabled={formLoading}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleCreateCustomer} 
            variant="contained" 
            color="primary"
            disabled={formLoading}
          >
            {formLoading ? <CircularProgress size={24} /> : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Customer Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>{t('common.confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('customers.confirmDeleteCustomer', { name: selectedCustomer?.name })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={formLoading}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleDeleteCustomer} 
            variant="contained" 
            color="error"
            disabled={formLoading}
          >
            {formLoading ? <CircularProgress size={24} /> : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerListPage;
