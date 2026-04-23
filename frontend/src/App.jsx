import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CreateAdminPage from './pages/CreateAdminPage';
import ProfilePage from './pages/ProfilePage';
import CompanyPage from './pages/CompanyPage';
import TendersPage from './pages/TendersPage';
import TenderDetailPage from './pages/TenderDetailPage';
import PrivateRoute from './components/common/PrivateRoute';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminCompaniesPage from './pages/AdminCompaniesPage';
import AdminTendersPage from './pages/AdminTendersPage';
import AdminWorkflowsPage from './pages/AdminWorkflowsPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import WorkflowsPage from './pages/WorkflowsPage';
import WorkflowDetailPage from './pages/WorkflowDetailPage';

import './App.css';

// Simple auth check
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin Routes */}
          <Route path="/admin/users" element={<PrivateRoute><AdminUsersPage /></PrivateRoute>} />
          <Route path="/admin/companies" element={<PrivateRoute><AdminCompaniesPage /></PrivateRoute>} />
          <Route path="/admin/tenders" element={<PrivateRoute><AdminTendersPage /></PrivateRoute>} />
          <Route path="/admin/workflows" element={<PrivateRoute><AdminWorkflowsPage /></PrivateRoute>} />
          <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboardPage /></PrivateRoute>} />
          <Route path="/admin/create" element={<PrivateRoute><CreateAdminPage /></PrivateRoute>} />

          {/* Company Routes */}
          <Route path="/company/:id" element={<PrivateRoute><CompanyDetailPage /></PrivateRoute>} />
          <Route path="/company" element={<PrivateRoute><CompanyPage /></PrivateRoute>} />

          {/* Tender Routes */}
          <Route path="/tenders/:id" element={<PrivateRoute><TenderDetailPage /></PrivateRoute>} />
          <Route path="/tenders" element={<PrivateRoute><TendersPage /></PrivateRoute>} />

          {/* Workflow Routes */}
          <Route path="/workflows" element={<PrivateRoute><WorkflowsPage /></PrivateRoute>} />
          <Route path="/workflows/:id" element={<PrivateRoute><WorkflowDetailPage /></PrivateRoute>} />

          {/* User Routes */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;