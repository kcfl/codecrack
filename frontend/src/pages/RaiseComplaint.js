import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

function RaiseComplaint() {
  const [config, setConfig] = useState(null);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [createdComplaint, setCreatedComplaint] = useState(null);

  useEffect(() => {
    API.get('/config')
      .then((res) => {
        setConfig(res.data);
        if (res.data.categories?.length > 0) {
          setCategory(res.data.categories[0]);
        }
      })
      .catch((err) => {
        console.error('Error loading config:', err);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setCreatedComplaint(null);
    setLoading(true);

    try {
      const payload = {
        category,
        description,
        location: location.trim() || undefined
      };
      const res = await API.post('/complaints', payload);
      setCreatedComplaint(res.data);
      setDescription('');
      setLocation('');
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: err.response?.data?.message || 'Failed to submit complaint' });
      }
    } finally {
      setLoading(false);
    }
  };

  const descLength = description.trim().length;
  const isDescTooShort = descLength > 0 && descLength < 10;
  const isDescTooLong = descLength > 500;

  return (
    <div className="main-content" style={{ padding: '32px', maxWidth: '760px', margin: '0 auto' }}>
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>
          Raise a Campus Complaint
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
          Report an issue with campus facilities for immediate SLA tracking and prioritization
        </p>
      </header>

      {/* Success banner */}
      {createdComplaint && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '28px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '20px' }}>✅</span>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#065f46' }}>
              Complaint Created Successfully!
            </h3>
          </div>
          <p style={{ fontSize: '14px', color: '#047857' }}>
            Your complaint has been assigned ID <strong style={{ fontSize: '16px', color: '#064e3b' }}>{createdComplaint.id}</strong>.
          </p>
          <div style={{ marginTop: '14px', display: 'flex', gap: '12px' }}>
            <Link
              to="/complaints"
              style={{
                background: '#059669',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              View in Complaints List
            </Link>
            <Link
              to="/"
              style={{
                background: '#fff',
                color: '#059669',
                border: '1px solid #a7f3d0',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              View Priority Queue
            </Link>
          </div>
        </div>
      )}

      {errors.general && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px' }}>
          {errors.general}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          padding: '28px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        {/* Category */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
            Category <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: `1px solid ${errors.category ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '8px',
              fontSize: '14px',
              background: '#fff'
            }}
          >
            {config?.categories?.map((cat) => (
              <option key={cat} value={cat}>
                {cat} (Weight: +{config.weights?.[cat] ?? 0}, SLA: {config.slaTargets?.[cat] ?? 0}h)
              </option>
            ))}
          </select>
          {errors.category && (
            <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>
              {errors.category}
            </p>
          )}
        </div>

        {/* Description */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>
              Description <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <span
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: isDescTooShort || isDescTooLong ? '#dc2626' : '#6b7280'
              }}
            >
              {descLength} / 500 characters (min 10)
            </span>
          </div>
          <textarea
            rows="5"
            placeholder="Describe the issue clearly (at least 10 characters)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: `1px solid ${errors.description ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          {errors.description && (
            <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>
              {errors.description}
            </p>
          )}
        </div>

        {/* Location (optional) */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>
              Location / Room <span style={{ color: '#9ca3af', fontWeight: 'normal' }}>(Optional)</span>
            </label>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {location.length} / 80 characters
            </span>
          </div>
          <input
            type="text"
            placeholder="e.g. Library 2nd Floor, Room 204, Hostel Block A"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: `1px solid ${errors.location ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          {errors.location && (
            <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>
              {errors.location}
            </p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            background: '#1e3a8a',
            color: '#fff',
            border: 'none',
            padding: '14px',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Submitting Complaint...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
}

export default RaiseComplaint;

