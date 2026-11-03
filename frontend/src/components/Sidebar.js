// frontend/src/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const location = useLocation();
  const { isAdmin, setQrModalOpen, setAuthModalOpen } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: '📊',
      adminOnly: true,
      badge: 'Admin'
    },
    {
      path: '/complaints',
      label: 'Complaints Queue',
      icon: '📋',
      adminOnly: true,
      badge: 'Admin'
    },
    {
      path: '/raise',
      label: 'Raise Complaint',
      icon: '📝',
      adminOnly: false,
      badge: 'Intake'
    },
    {
      path: '/tools',
      label: 'System Tools',
      icon: '⚙️',
      adminOnly: true,
      badge: 'E5/E6'
    }
  ];

  return (
    <>
      <button
        className="mobile-hamburger-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation menu"
      >
        ☰
      </button>

      {mobileOpen && (
        <div
          className="mobile-backdrop-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`gov-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-section-title">
          <span>NAVIGATION WORKFLOWS</span>
        </div>

        <nav className="gov-nav-list">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isLocked = item.adminOnly && !isAdmin;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`gov-nav-link ${isActive ? 'active' : ''} ${isLocked ? 'locked-link' : ''}`}
                onClick={(e) => {
                  if (isLocked) {
                    e.preventDefault();
                    setAuthModalOpen(true);
                  }
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {isLocked && <span className="nav-lock-badge">🔒</span>}
              </Link>
            );
          })}
        </nav>

        {/* QR Scan Dispatch Action */}
        <div className="sidebar-qr-card">
          <div className="sidebar-qr-header">
            <span>📲 Campus Dispatch</span>
          </div>
          <p className="sidebar-qr-desc">
            Display official QR Code for hostel & lab notice boards.
          </p>
          <button
            className="sidebar-qr-btn"
            onClick={() => setQrModalOpen(true)}
          >
            Open Intake QR
          </button>
        </div>

        {/* Footer SLA Node Status */}
        <div className="gov-sidebar-footer">
          <div className="sla-metric-row">
            <span className="sla-title">SLA COMPLIANCE</span>
            <span className="sla-value">98.4%</span>
          </div>
          <div className="sla-progress-track">
            <div className="sla-progress-bar" style={{ width: '98.4%' }}></div>
          </div>
          <div className="monitoring-node-text">
            <span>Active Monitoring Node #3</span>
          </div>
          <div className="engine-version-text">
            <span>SATI Governance Engine v3.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
