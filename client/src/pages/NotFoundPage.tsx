import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 500,
        }}
      >
        <Typography variant="h1" color="primary" sx={{ mb: 2, fontSize: '6rem' }}>
          404
        </Typography>
        
        <Typography variant="h5" gutterBottom>
          {t('errors.notFound')}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          {t('errors.pageNotFoundMessage')}
        </Typography>
        
        <Button
          component={Link}
          to="/"
          variant="contained"
          color="primary"
          startIcon={<HomeIcon />}
        >
          {t('common.backToDashboard')}
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFoundPage;
