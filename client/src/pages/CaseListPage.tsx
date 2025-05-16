import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { caseService } from '../services/api';
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
  Chip,
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

interface Case {
  id: number;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const CaseListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [newCase, setNewCase] = useState({
    name: '',
    description: '',
    status: 'open'
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await caseService.getAllCases(page + 1, rowsPerPage);
      setCases(response.data.cases);
      setTotalCount(response.data.pagination.total);
    } catch (err) {
      console.error('Error fetching cases:', err);
      setError(t('errors.serverError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [page, rowsPerPage, t]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewCase = (caseId: number) => {
    navigate(`/cases/${caseId}`);
  };

  const handleOpenCreateDialog = () => {
    setNewCase({
      name: '',
      description: '',
      status: 'open'
    });
    setFormError('');
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
  };

  const handleCreateCase = async () => {
    if (!newCase.name) {
      setFormError(t('cases.caseNameRequired'));
      return;
    }

    try {
      setFormLoading(true);
      setFormError('');
      
      await caseService.createCase(newCase);
      handleCloseCreateDialog();
      fetchCases();
    } catch (err) {
      console.error('Error creating case:', err);
      setFormError(t('errors.serverError'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenDeleteDialog = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedCase(null);
  };

  const handleDeleteCase = async () => {
    if (!selectedCase) return;

    try {
      setFormLoading(true);
      
      await caseService.deleteCase(selectedCase.id);
      handleCloseDeleteDialog();
      fetchCases();
    } catch (err) {
      console.error('Error deleting case:', err);
      setFormError(t('errors.serverError'));
    } finally {
      setFormLoading(false);
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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('cases.title')}
        </Typography>
        
        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            {t('cases.createCase')}
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
                <TableCell>{t('common.status')}</TableCell>
                <TableCell>{t('common.createdAt')}</TableCell>
                <TableCell>{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : cases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {t('common.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                cases.map((caseItem) => (
                  <TableRow key={caseItem.id}>
                    <TableCell>{caseItem.id}</TableCell>
                    <TableCell>{caseItem.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(caseItem.status)} 
                        color={getStatusColor(caseItem.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(caseItem.created_at).toLocaleDateString('ja-JP')}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewCase(caseItem.id)}
                        size="small"
                      >
                        <ViewIcon />
                      </IconButton>
                      
                      {isAdmin && (
                        <>
                          <IconButton
                            color="primary"
                            onClick={() => navigate(`/cases/${caseItem.id}?edit=true`)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          
                          <IconButton
                            color="error"
                            onClick={() => handleOpenDeleteDialog(caseItem)}
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
      
      {/* Create Case Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{t('cases.createCase')}</DialogTitle>
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
            label={t('cases.caseName')}
            type="text"
            fullWidth
            variant="outlined"
            value={newCase.name}
            onChange={(e) => setNewCase({ ...newCase, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="description"
            label={t('cases.caseDescription')}
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newCase.description}
            onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth variant="outlined">
            <InputLabel id="status-label">{t('cases.caseStatus')}</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              value={newCase.status}
              onChange={(e) => setNewCase({ ...newCase, status: e.target.value })}
              label={t('cases.caseStatus')}
            >
              <MenuItem value="open">{t('common.open')}</MenuItem>
              <MenuItem value="in_progress">{t('common.inProgress')}</MenuItem>
              <MenuItem value="closed">{t('common.closed')}</MenuItem>
              <MenuItem value="on_hold">{t('common.onHold')}</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog} disabled={formLoading}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleCreateCase} 
            variant="contained" 
            color="primary"
            disabled={formLoading}
          >
            {formLoading ? <CircularProgress size={24} /> : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Case Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>{t('common.confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('cases.confirmDeleteCase', { name: selectedCase?.name })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={formLoading}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleDeleteCase} 
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

export default CaseListPage;
