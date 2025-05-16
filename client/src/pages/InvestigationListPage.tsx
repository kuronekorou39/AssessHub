import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { investigationService, caseService } from '../services/api';
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

interface Investigation {
  id: number;
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  case_id: number;
  created_at: string;
  updated_at: string;
}

interface Case {
  id: number;
  name: string;
}

const InvestigationListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedInvestigation, setSelectedInvestigation] = useState<Investigation | null>(null);
  const [newInvestigation, setNewInvestigation] = useState({
    title: '',
    description: '',
    status: 'open',
    start_date: '',
    end_date: '',
    case_id: 0
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchInvestigations = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await investigationService.getAllInvestigations(page + 1, rowsPerPage);
      setInvestigations(response.data.investigations);
      setTotalCount(response.data.pagination.total);
    } catch (err) {
      console.error('Error fetching investigations:', err);
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
    fetchInvestigations();
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

  const handleViewInvestigation = (investigationId: number) => {
    navigate(`/investigations/${investigationId}`);
  };

  const handleOpenCreateDialog = () => {
    setNewInvestigation({
      title: '',
      description: '',
      status: 'open',
      start_date: '',
      end_date: '',
      case_id: cases.length > 0 ? cases[0].id : 0
    });
    setFormError('');
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
  };

  const handleCreateInvestigation = async () => {
    if (!newInvestigation.title) {
      setFormError(t('investigations.titleRequired'));
      return;
    }

    if (!newInvestigation.case_id) {
      setFormError(t('investigations.caseRequired'));
      return;
    }

    try {
      setFormLoading(true);
      setFormError('');
      
      await investigationService.createInvestigation(newInvestigation);
      handleCloseCreateDialog();
      fetchInvestigations();
    } catch (err) {
      console.error('Error creating investigation:', err);
      setFormError(t('errors.serverError'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenDeleteDialog = (investigation: Investigation) => {
    setSelectedInvestigation(investigation);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedInvestigation(null);
  };

  const handleDeleteInvestigation = async () => {
    if (!selectedInvestigation) return;

    try {
      setFormLoading(true);
      
      await investigationService.deleteInvestigation(selectedInvestigation.id);
      handleCloseDeleteDialog();
      fetchInvestigations();
    } catch (err) {
      console.error('Error deleting investigation:', err);
      setFormError(t('errors.serverError'));
    } finally {
      setFormLoading(false);
    }
  };

  const getCaseName = (caseId: number) => {
    const caseItem = cases.find(c => c.id === caseId);
    return caseItem ? caseItem.name : '-';
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('investigations.title')}
        </Typography>
        
        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            {t('investigations.createInvestigation')}
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
                <TableCell>{t('common.title')}</TableCell>
                <TableCell>{t('common.status')}</TableCell>
                <TableCell>{t('common.startDate')}</TableCell>
                <TableCell>{t('investigations.relatedCase')}</TableCell>
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
              ) : investigations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {t('common.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                investigations.map((investigation) => (
                  <TableRow key={investigation.id}>
                    <TableCell>{investigation.id}</TableCell>
                    <TableCell>{investigation.title}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(investigation.status)} 
                        color={getStatusColor(investigation.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(investigation.start_date)}</TableCell>
                    <TableCell>{getCaseName(investigation.case_id)}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewInvestigation(investigation.id)}
                        size="small"
                      >
                        <ViewIcon />
                      </IconButton>
                      
                      {isAdmin && (
                        <>
                          <IconButton
                            color="primary"
                            onClick={() => navigate(`/investigations/${investigation.id}?edit=true`)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          
                          <IconButton
                            color="error"
                            onClick={() => handleOpenDeleteDialog(investigation)}
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
      
      {/* Create Investigation Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{t('investigations.createInvestigation')}</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            id="title"
            label={t('investigations.investigationTitle')}
            type="text"
            fullWidth
            variant="outlined"
            value={newInvestigation.title}
            onChange={(e) => setNewInvestigation({ ...newInvestigation, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="description"
            label={t('investigations.investigationDescription')}
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newInvestigation.description}
            onChange={(e) => setNewInvestigation({ ...newInvestigation, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel id="status-label">{t('investigations.investigationStatus')}</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              value={newInvestigation.status}
              onChange={(e) => setNewInvestigation({ ...newInvestigation, status: e.target.value })}
              label={t('investigations.investigationStatus')}
            >
              <MenuItem value="open">{t('common.open')}</MenuItem>
              <MenuItem value="in_progress">{t('common.inProgress')}</MenuItem>
              <MenuItem value="closed">{t('common.closed')}</MenuItem>
              <MenuItem value="on_hold">{t('common.onHold')}</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            id="start_date"
            label={t('investigations.investigationStartDate')}
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={newInvestigation.start_date}
            onChange={(e) => setNewInvestigation({ ...newInvestigation, start_date: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="end_date"
            label={t('investigations.investigationEndDate')}
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={newInvestigation.end_date}
            onChange={(e) => setNewInvestigation({ ...newInvestigation, end_date: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth variant="outlined">
            <InputLabel id="case-label">{t('investigations.relatedCase')}</InputLabel>
            <Select
              labelId="case-label"
              id="case_id"
              value={newInvestigation.case_id || ''}
              onChange={(e) => setNewInvestigation({ ...newInvestigation, case_id: Number(e.target.value) })}
              label={t('investigations.relatedCase')}
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
            onClick={handleCreateInvestigation} 
            variant="contained" 
            color="primary"
            disabled={formLoading}
          >
            {formLoading ? <CircularProgress size={24} /> : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Investigation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>{t('common.confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('investigations.confirmDeleteInvestigation', { title: selectedInvestigation?.title })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={formLoading}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleDeleteInvestigation} 
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

export default InvestigationListPage;
