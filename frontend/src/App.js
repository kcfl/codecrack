// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import QRModal from './components/QRModal';
import AuthModal from './components/AuthModal';
import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import RaiseComplaint from './pages/RaiseComplaint';
import SystemTools from './pages/SystemTools';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="gov-app-shell">
          <Navbar />
          <div className="gov-body-layout">
            <Sidebar />
            <main className="gov-main-viewport">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/complaints" element={<Complaints />} />
                <Route path="/raise" element={<RaiseComplaint />} />
                <Route path="/tools" element={<SystemTools />} />
                <Route path="/student" element={<RaiseComplaint />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
          <QRModal />
          <AuthModal />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
