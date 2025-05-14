import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { searchService, caseService } from '../services/api';
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
  Checkbox,
  FormGroup,
  FormControlLabel,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

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
      id={`search-tabpanel-${index}`}
      aria-labelledby={`search-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const AdvancedSearchPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [searchParams, setSearchParams] = useState({
    name: '',
    status: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    title: '',
    type: '',
    details: '',
    case_id: '',
    investigation_id: '',
    customer_name: '',
    target_name: '',
    cross_entity: false
  });
  
  const [selectedEntities, setSelectedEntities] = useState({
    cases: true,
    customers: true,
    investigations: true,
    targets: true
  });
  
  const [tabValue, setTabValue] = useState(0);
  const [results, setResults] = useState<any>({
    cases: [],
    customers: [],
    investigations: [],
    targets: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleSearchParamChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setSearchParams({
        ...searchParams,
        [name]: value
      });
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name === 'cross_entity') {
      setSearchParams({
        ...searchParams,
        [name]: checked
      });
    } else {
      setSelectedEntities({
        ...selectedEntities,
        [name]: checked
      });
    }
  };
  
  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');
      
      const entities = Object.entries(selectedEntities)
        .filter(([_, selected]) => selected)
        .map(([entity]) => entity);
      
      if (entities.length === 0) {
        setError(t('search.selectAtLeastOneEntity'));
        setLoading(false);
        return;
      }
      
      const searchData = {
        ...searchParams,
        entities
      };
      
      Object.keys(searchData).forEach(key => {
        if (searchData[key] === '' || searchData[key] === null) {
          delete searchData[key];
        }
      });
      
      const response = await searchService.advancedSearch(searchData);
      setResults(response.data.results);
      setSearched(true);
      
      const firstEntityWithResults = entities.find(entity => 
        response.data.results[entity] && response.data.results[entity].length > 0
      );
      
      if (firstEntityWithResults) {
        const tabIndex = ['cases', 'customers', 'investigations', 'targets'].indexOf(firstEntityWithResults);
        if (tabIndex !== -1) {
          setTabValue(tabIndex);
        }
      }
    } catch (err) {
      console.error('Error performing search:', err);
      setError(t('errors.serverError'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleClear = () => {
    setSearchParams({
      name: '',
      status: '',
      description: '',
      email: '',
      phone: '',
      address: '',
      title: '',
      type: '',
      details: '',
      case_id: '',
      investigation_id: '',
      customer_name: '',
      target_name: '',
      cross_entity: false
    });
    setSelectedEntities({
      cases: true,
      customers: true,
      investigations: true,
      targets: true
    });
    setResults({
      cases: [],
      customers: [],
      investigations: [],
      targets: []
    });
    setSearched(false);
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
      <Typography variant="h4" gutterBottom>
        {t('search.title')}
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('search.searchEntities')}
        </Typography>
        
        <FormGroup row sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedEntities.cases}
                onChange={handleCheckboxChange}
                name="cases"
              />
            }
            label={t('common.cases')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedEntities.customers}
                onChange={handleCheckboxChange}
                name="customers"
              />
            }
            label={t('common.customers')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedEntities.investigations}
                onChange={handleCheckboxChange}
                name="investigations"
              />
            }
            label={t('common.investigations')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedEntities.targets}
                onChange={handleCheckboxChange}
                name="targets"
              />
            }
            label={t('common.targets')}
          />
        </FormGroup>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          {t('search.searchFilters')}
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={t('search.searchByName')}
              name="name"
              value={searchParams.name}
              onChange={handleSearchParamChange}
              margin="normal"
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel id="status-label">{t('search.searchByStatus')}</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={searchParams.status}
                onChange={handleSearchParamChange}
                label={t('search.searchByStatus')}
              >
                <MenuItem value="">
                  <em>{t('common.all')}</em>
                </MenuItem>
                <MenuItem value="open">{t('common.open')}</MenuItem>
                <MenuItem value="in_progress">{t('common.inProgress')}</MenuItem>
                <MenuItem value="closed">{t('common.closed')}</MenuItem>
                <MenuItem value="on_hold">{t('common.onHold')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={t('search.searchByType')}
              name="type"
              value={searchParams.type}
              onChange={handleSearchParamChange}
              margin="normal"
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('common.description')}
              name="description"
              value={searchParams.description}
              onChange={handleSearchParamChange}
              margin="normal"
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('common.email')}
              name="email"
              value={searchParams.email}
              onChange={handleSearchParamChange}
              margin="normal"
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('common.phone')}
              name="phone"
              value={searchParams.phone}
              onChange={handleSearchParamChange}
              margin="normal"
              variant="outlined"
            />
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          {t('search.crossEntitySearch')}
        </Typography>
        
        <FormControlLabel
          control={
            <Checkbox
              checked={searchParams.cross_entity}
              onChange={handleCheckboxChange}
              name="cross_entity"
            />
          }
          label={t('search.enableCrossEntitySearch')}
          sx={{ mb: 2 }}
        />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('search.customerNameSearch')}
              name="customer_name"
              value={searchParams.customer_name}
              onChange={handleSearchParamChange}
              margin="normal"
              variant="outlined"
              disabled={!searchParams.cross_entity}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('search.targetNameSearch')}
              name="target_name"
              value={searchParams.target_name}
              onChange={handleSearchParamChange}
              margin="normal"
              variant="outlined"
              disabled={!searchParams.cross_entity}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleClear}
            disabled={loading}
          >
            {t('search.clearFilters')}
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : t('search.applyFilters')}
          </Button>
        </Box>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {searched && (
        <Paper elevation={2}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="search results tabs">
              <Tab 
                label={`${t('common.cases')} (${results.cases?.length || 0})`} 
                disabled={!selectedEntities.cases}
              />
              <Tab 
                label={`${t('common.customers')} (${results.customers?.length || 0})`} 
                disabled={!selectedEntities.customers}
              />
              <Tab 
                label={`${t('common.investigations')} (${results.investigations?.length || 0})`} 
                disabled={!selectedEntities.investigations}
              />
              <Tab 
                label={`${t('common.targets')} (${results.targets?.length || 0})`} 
                disabled={!selectedEntities.targets}
              />
            </Tabs>
          </Box>
          
          {/* Cases Tab */}
          <TabPanel value={tabValue} index={0}>
            {!selectedEntities.cases ? (
              <Typography>{t('search.entityNotSelected')}</Typography>
            ) : results.cases?.length === 0 ? (
              <Typography>{t('search.noResults')}</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('common.id')}</TableCell>
                      <TableCell>{t('common.name')}</TableCell>
                      <TableCell>{t('common.status')}</TableCell>
                      <TableCell>{t('common.description')}</TableCell>
                      <TableCell>{t('common.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.cases.map((caseItem: any) => (
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
                        <TableCell>{caseItem.description}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate(`/cases/${caseItem.id}`)}
                          >
                            {t('common.details')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
          
          {/* Customers Tab */}
          <TabPanel value={tabValue} index={1}>
            {!selectedEntities.customers ? (
              <Typography>{t('search.entityNotSelected')}</Typography>
            ) : results.customers?.length === 0 ? (
              <Typography>{t('search.noResults')}</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('common.id')}</TableCell>
                      <TableCell>{t('common.name')}</TableCell>
                      <TableCell>{t('common.email')}</TableCell>
                      <TableCell>{t('common.phone')}</TableCell>
                      <TableCell>{t('common.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.customers.map((customer: any) => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.id}</TableCell>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate(`/customers/${customer.id}`)}
                          >
                            {t('common.details')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
          
          {/* Investigations Tab */}
          <TabPanel value={tabValue} index={2}>
            {!selectedEntities.investigations ? (
              <Typography>{t('search.entityNotSelected')}</Typography>
            ) : results.investigations?.length === 0 ? (
              <Typography>{t('search.noResults')}</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('common.id')}</TableCell>
                      <TableCell>{t('common.title')}</TableCell>
                      <TableCell>{t('common.status')}</TableCell>
                      <TableCell>{t('common.startDate')}</TableCell>
                      <TableCell>{t('common.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.investigations.map((investigation: any) => (
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
                        <TableCell>
                          {investigation.start_date ? new Date(investigation.start_date).toLocaleDateString('ja-JP') : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate(`/investigations/${investigation.id}`)}
                          >
                            {t('common.details')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
          
          {/* Targets Tab */}
          <TabPanel value={tabValue} index={3}>
            {!selectedEntities.targets ? (
              <Typography>{t('search.entityNotSelected')}</Typography>
            ) : results.targets?.length === 0 ? (
              <Typography>{t('search.noResults')}</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('common.id')}</TableCell>
                      <TableCell>{t('common.name')}</TableCell>
                      <TableCell>{t('common.type')}</TableCell>
                      <TableCell>{t('common.status')}</TableCell>
                      <TableCell>{t('common.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.targets.map((target: any) => (
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
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate(`/targets/${target.id}`)}
                          >
                            {t('common.details')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </Paper>
      )}
    </Box>
  );
};

export default AdvancedSearchPage;
