import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import ClientManagement from './pages/ClientManagement';
import Leads from './pages/Leads';
import Messages from './pages/Messages';
import Appointments from './pages/Appointments';
import Automations from './pages/Automations';
import Analytics from './pages/Analytics';
import Integrations from './pages/Integrations';
import SMSSettings from './pages/SMSSettings';
import { base44Client, initializeClient } from './api/base44Client';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await initializeClient();
        const authStatus = await base44Client.auth.isAuthenticated();
        setIsAuthenticated(authStatus);
        setAuthError(null);
      } catch (error) {
        console.error('Authentication check failed:', error);
        setAuthError(error.message);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      setIsLoading(true);
      await base44Client.auth.login(credentials);
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (error) {
      console.error('Login failed:', error);
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Authentication Required
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please log in to access the application
            </p>
            {authError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{authError}</p>
              </div>
            )}
          </div>
          <div className="mt-8 space-y-4">
            <button
              onClick={() => handleLogin({ /* Add your login credentials here */ })}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<ClientManagement />} />
          <Route path="leads" element={<Leads />} />
          <Route path="messages" element={<Messages />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="automations" element={<Automations />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="sms-settings" element={<SMSSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;