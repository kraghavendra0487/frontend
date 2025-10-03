import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RootRedirect from './routes/RootRedirect';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './components/NotFound';

// Import pages
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/admin/AdminDashboard';
import AdminEmployeesPage from './pages/admin/AdminEmployeesPage';
import AdminEmployeeDetailsPage from './pages/admin/AdminEmployeeDetailsPage';
import AdminAddEmployeePage from './pages/admin/AdminAddEmployeePage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminCampsPage from './pages/admin/AdminCampsPage';
import AdminAddCampPage from './pages/admin/AdminAddCampPage';
import AdminMeesevaPage from './pages/admin/AdminMeesevaPage';
import AdminClientsPage from './pages/admin/AdminClientsPage';
import AdminClientServicesPage from './pages/admin/AdminClientServicesPage';
import AdminFinancialTransactionsPage from './pages/admin/AdminFinancialTransactionsPage';
import EmployeePage from './pages/employee/EmployeePage';
import EmployeeCustomersPage from './pages/employee/EmployeeCustomersPage';
import EmployeeAddCustomerPage from './pages/employee/EmployeeAddCustomerPage';
import EmployeeCampsPage from './pages/employee/EmployeeCampsPage';
import EmployeeProfilePage from './pages/employee/EmployeeProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Root redirect based on auth */}
            <Route path="/" element={<RootRedirect />} />

            {/* Admin redirect */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/employees"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminEmployeesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/employees/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminEmployeeDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-employee"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAddEmployeePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCustomersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/camps"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCampsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-camp"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAddCampPage />
                </ProtectedRoute>
              }
            />
            {/* Meeseva route */}
            <Route
              path="/admin/meeseva"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminMeesevaPage />
                </ProtectedRoute>
              }
            />

            {/* Client Management routes */}
            <Route
              path="/admin/clients"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminClientsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/client-services/:clientId"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminClientServicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/financial-transactions"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminFinancialTransactionsPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Employee Routes */}
            <Route
              path="/employee"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/customers"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeCustomersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/add-customer"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeAddCustomerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/camps"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeCampsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/profile"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}

export default App;
