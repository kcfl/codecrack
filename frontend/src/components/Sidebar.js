import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/complaints', label: 'Complaints', icon: '📋' },
    { path: '/raise', label: 'Raise Complaint', icon: '📝' }
  ];

  return (
    <>
      <button 
        className="mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
        style={{
          position: 'fixed',
          top: '12px',
          left: '12px',
          zIndex: 100,
          background: 'var(--primary, #1e3a8a)',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 12px',
          cursor: 'pointer',
          display: window.innerWidth <= 768 ? 'block' : 'none'
        }}
      >
        ☰
      </button>

      {mobileOpen && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            zIndex: 99, display: 'block'
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              width: '34px', height: '34px',
              background: 'linear-gradient(135deg, #1e3a8a, #0ea5e9)',
              borderRadius: '8px', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', fontSize: '13px', fontWeight: '900',
              color: '#fff',
              flexShrink: 0
            }}>SATI</span>
            SATI Complaints
          </h3>
          <p style={{ marginTop: '6px', fontSize: '12px', opacity: 0.7 }}>
            Campus Management Portal
          </p>
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default Sidebar;
