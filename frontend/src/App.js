import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import RaiseComplaint from './pages/RaiseComplaint';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg, #f0f2f5)' }}>
        <Sidebar />
        <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/raise" element={<RaiseComplaint />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
