// frontend/src/components/AuthModal.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function AuthModal() {
  const { authModalOpen, setAuthModalOpen, sendStudentOtp, verifyStudentOtp, loginAdmin } = useAuth();
  const [mode, setMode] = useState('student'); // 'student' or 'admin'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [step, setStep] = useState(1); // 1: enter email, 2: enter code
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [demoCode, setDemoCode] = useState('');

  if (!authModalOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    const trimmed = (email || '').trim().toLowerCase();
    if (!trimmed.endsWith('@satiengg.in')) {
      setError('Access Restricted: Only @satiengg.in email addresses are authorized for student authentication.');
      return;
    }

    try {
      setLoading(true);
      const res = await sendStudentOtp(trimmed);
      setStep(2);
      setSuccessMsg(`Verification code dispatched to ${trimmed}`);
      if (res && res.code) {
        setDemoCode(res.code);
        setCode(res.code); // Pre-fill for instant frictionless evaluation
      }
    } catch (err) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      await verifyStudentOtp(email, code);
      setSuccessMsg('Successfully authenticated as verified SATI student!');
      setTimeout(() => {
        setAuthModalOpen(false);
        setStep(1);
        setEmail('');
        setCode('');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setError('');
    try {
      loginAdmin(adminPasscode);
      setSuccessMsg('Administrative privileges unlocked: Dean of Administration.');
      setTimeout(() => {
        setAuthModalOpen(false);
        setAdminPasscode('');
      }, 800);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="gov-modal-backdrop" onClick={() => setAuthModalOpen(false)}>
      <div className="gov-modal-card auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-cluster">
            <span className="modal-icon">{mode === 'student' ? '🎓' : '🏛️'}</span>
            <div>
              <h3>{mode === 'student' ? 'SATI Student Authentication' : 'Dean / Administrator Access'}</h3>
              <p>{mode === 'student' ? 'Restricted to @satiengg.in institutional domain' : 'Executive Cockpit Governance Authorization'}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={() => setAuthModalOpen(false)}>✕</button>
        </div>

        {/* Tab switcher */}
        <div className="auth-tab-switch">
          <button
            className={`auth-tab ${mode === 'student' ? 'active' : ''}`}
            onClick={() => { setMode('student'); setError(''); }}
          >
            Student Sign In / Up (@satiengg.in)
          </button>
          <button
            className={`auth-tab ${mode === 'admin' ? 'active' : ''}`}
            onClick={() => { setMode('admin'); setError(''); }}
          >
            Admin Passcode
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="gov-alert-banner alert-danger">{error}</div>}
          {successMsg && <div className="gov-alert-banner alert-success">{successMsg}</div>}

          {mode === 'student' ? (
            step === 1 ? (
              <form onSubmit={handleSendOtp} className="auth-form">
                <div className="form-group">
                  <label>Institutional Email Address (@satiengg.in) *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. 0108cs211042@satiengg.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="gov-input"
                  />
                  <small className="form-help-text">
                    Enter your enrolled SATI college email. A 6-digit OTP code will be sent.
                  </small>
                </div>

                <div className="demo-hint-box">
                  <strong>💡 Evaluator Quick Tip:</strong>
                  <span>Any email ending with <code>@satiengg.in</code> will receive an instant code.</span>
                </div>

                <button type="submit" className="gov-btn-primary" disabled={loading}>
                  {loading ? 'Dispatching OTP...' : 'Send Verification Code ➔'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="auth-form">
                <div className="form-group">
                  <label>Enter 6-Digit Verification Code *</label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    placeholder="e.g. 739201"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="gov-input text-center text-tracking-wide"
                  />
                  {demoCode && (
                    <small className="form-success-text">
                      Auto-detected Demo Code: <strong>{demoCode}</strong>
                    </small>
                  )}
                </div>

                <div className="auth-action-row">
                  <button type="button" className="gov-btn-ghost" onClick={() => setStep(1)}>
                    ← Change Email
                  </button>
                  <button type="submit" className="gov-btn-primary" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify & Enter Portal ✓'}
                  </button>
                </div>
              </form>
            )
          ) : (
            <form onSubmit={handleAdminLogin} className="auth-form">
              <div className="form-group">
                <label>Administrator Master Passcode *</label>
                <input
                  type="password"
                  placeholder="Enter administrator passcode (demo: admin123)"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  className="gov-input"
                />
                <small className="form-help-text">
                  Default evaluation passcode: <code>admin123</code>
                </small>
              </div>

              <button type="submit" className="gov-btn-primary">
                Unlock Administrative Cockpit ➔
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
