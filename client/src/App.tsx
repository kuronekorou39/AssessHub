import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CaseListPage from './pages/CaseListPage';
import CaseDetailPage from './pages/CaseDetailPage';
import CustomerListPage from './pages/CustomerListPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import InvestigationListPage from './pages/InvestigationListPage';
import InvestigationDetailPage from './pages/InvestigationDetailPage';
import TargetListPage from './pages/TargetListPage';
import TargetDetailPage from './pages/TargetDetailPage';
import AdvancedSearchPage from './pages/AdvancedSearchPage';
import NotFoundPage from './pages/NotFoundPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="cases" element={<CaseListPage />} />
        <Route path="cases/:id" element={<CaseDetailPage />} />
        <Route path="customers" element={<CustomerListPage />} />
        <Route path="customers/:id" element={<CustomerDetailPage />} />
        <Route path="investigations" element={<InvestigationListPage />} />
        <Route path="investigations/:id" element={<InvestigationDetailPage />} />
        <Route path="targets" element={<TargetListPage />} />
        <Route path="targets/:id" element={<TargetDetailPage />} />
        <Route path="search" element={<AdvancedSearchPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
