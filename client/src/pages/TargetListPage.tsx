import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { targetService, investigationService } from '../services/api';
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

interface Target {
  id: number;
  name: string;
  type: string;
  details: string;
  status: string;
  investigation_id: number;
  created_at: string;
  updated_at: string;
}

interface Investigation {
  id: number;
  title: string;
}

const TargetListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [targets, setTargets] = useState<Target[]>([]);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
  const [newTarget, setNewTarget] = useState({
    name: '',
    type: '',
    details: '',
    status: 'open',
    investigation_id: 0
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchTargets = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await targetService.getAllTargets(page + 1, rowsPerPage);
      setTargets(response.data.targets);
      setTotalCount(response.data.pagination.total);
    } catch (err) {
      console.error('Error fetching targets:', err);
      setError(t('errors.serverError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestigations = async () => {
    try {
      const response = await investigationService.getAllInvestigations(1, 100);
      setInvestigations(response.data.investigations);
    } catch (err) {
      console.error('Error fetching investigations:', err);
    }
  };

  useEffect(() => {
    fetchTargets();
    if (isAdmin) {
      fetchInvestigations();
    }
  }, [page, rowsPerPage, t, isAdmin]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewTarget = (targetId: number) => {
    navigate(`/targets/${targetId}`);
  };

  const handleOpenCreateDialog = () => {
    setNewTarget({
      name: '',
      type: '',
      details: '',
      status: 'open',
      investigation_id: investigations.length > 0 ? investigations[0].id : 0
    });
    setFormError('');
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
  };

  const handleCreateTarget = async () => {
    if (!newTarget.name) {
      setFormError(t('targets.nameRequired'));
      return;
    }

    if (!newTarget.investigation_id) {
      setFormError(t('targets.investigationRequired'));
      return;
    }

    try {
      setFormLoading(true);
      setFormError('');
      
      await targetService.createTarget(newTarget);
      handleCloseCreateDialog();
      fetchTargets();
    } catch (err) {
      console.error('Error creating target:', err);
      setFormError(t('errors.serverError'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenDeleteDialog = (target: Target) => {
    setSelectedTarget(target);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedTarget(null);
  };

  const handleDeleteTarget = async () => {
    if (!selectedTarget) return;

    try {
      setFormLoading(true);
      
      await targetService.deleteTarget(selectedTarget.id);
      handleCloseDeleteDialog();
      fetchTargets();
    } catch (err) {
      console.error('Error deleting target:', err);
      setFormError(t('errors.serverError'));
    } finally {
      setFormLoading(false);
    }
  };

  const getInvestigationTitle = (investigationId: number) => {
    const investigation = investigations.find(i => i.id === investigationId);
    return investigation ? investigation.title : '-';
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
          {t('targets.title')}
        </Typography>
        
        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            {t('targets.createTarget')}
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
                <TableCell>{t('common.type')}</TableCell>
                <TableCell>{t('common.status')}</TableCell>
                <TableCell>{t('targets.relatedInvestigation')}</TableCell>
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
              ) : targets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {t('common.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                targets.map((target) => (
                  <TableRow key={target.id}>
                    <TableCell>{target.id}</TableCell>
                    <TableCell>{target.name}</TableCell>
                    <TableCell>{target.type}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(target.status)} 
                        color={getStatusColor(target.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{getInvestigationTitle(target.investigation_id)}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewTarget(target.id)}
                        size="small"
                      >
                        <ViewIcon />
                      </IconButton>
                      
                      {isAdmin && (
                        <>
                          <IconButton
                            color="primary"
                            onClick={() => navigate(`/targets/${target.id}?edit=true`)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          
                          <IconButton
                            color="error"
                            onClick={() => handleOpenDeleteDialog(target)}
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
      
      {/* Create Target Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{t('targets.createTarget')}</DialogTitle>
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
            label={t('targets.targetName')}
            type="text"
            fullWidth
            variant="outlined"
            value={newTarget.name}
            onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="type"
            label={t('targets.targetType')}
            type="text"
            fullWidth
            variant="outlined"
            value={newTarget.type}
            onChange={(e) => setNewTarget({ ...newTarget, type: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="details"
            label={t('targets.targetDetails')}
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newTarget.details}
            onChange={(e) => setNewTarget({ ...newTarget, details: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel id="status-label">{t('targets.targetStatus')}</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              value={newTarget.status}
              onChange={(e) => setNewTarget({ ...newTarget, status: e.target.value })}
              label={t('targets.targetStatus')}
            >
              <MenuItem value="open">{t('common.open')}</MenuItem>
              <MenuItem value="in_progress">{t('common.inProgress')}</MenuItem>
              <MenuItem value="closed">{t('common.closed')}</MenuItem>
              <MenuItem value="on_hold">{t('common.onHold')}</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth variant="outlined">
            <InputLabel id="investigation-label">{t('targets.relatedInvestigation')}</InputLabel>
            <Select
              labelId="investigation-label"
              id="investigation_id"
              value={newTarget.investigation_id || ''}
              onChange={(e) => setNewTarget({ ...newTarget, investigation_id: Number(e.target.value) })}
              label={t('targets.relatedInvestigation')}
            >
              {investigations.map((investigation) => (
                <MenuItem key={investigation.id} value={investigation.id}>
                  {investigation.title}
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
            onClick={handleCreateTarget} 
            variant="contained" 
            color="primary"
            disabled={formLoading}
          >
            {formLoading ? <CircularProgress size={24} /> : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Target Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>{t('common.confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('targets.confirmDeleteTarget', { name: selectedTarget?.name })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={formLoading}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleDeleteTarget} 
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

export default TargetListPage;
