import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';

function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [config, setConfig] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [advancingId, setAdvancingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchComplaints = useCallback(async () => {
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;
      if (search.trim()) params.q = search.trim();

      const [res, statsRes, configRes] = await Promise.all([
        API.get('/complaints', { params }),
        API.get('/stats'),
        API.get('/config')
      ]);

      setComplaints(res.data);
      setTotalCount(statsRes.data.total);
      setConfig(configRes.data);
      setError(null);

      // If a complaint was selected in drawer, update its details
      if (selectedComplaint) {
        const updatedSelected = res.data.find(c => c.id === selectedComplaint.id);
        if (updatedSelected) {
          setSelectedComplaint(updatedSelected);
        }
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to fetch complaints.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedStatus, search, selectedComplaint]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedStatus('');
  };

  const handleAdvance = async (e, complaint) => {
    e.stopPropagation(); // prevent opening drawer when clicking button
    if (!complaint.nextStatus) return;
    setAdvancingId(complaint.id);
    try {
      await API.patch(`/complaints/${complaint.id}/status`, { to: complaint.nextStatus });
      await fetchComplaints();
    } catch (err) {
      console.error('Error advancing status:', err);
      setError(err.response?.data?.message || 'Failed to advance status');
    } finally {
      setAdvancingId(null);
    }
  };

  const getStatusStyle = (status) => {
    if (status === 'Raised') return { background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' };
    if (status === 'In Progress') return { background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd' };
    return { background: '#dcfce7', color: '#166534', border: '1px solid #86efac' };
  };

  const getUrgencyStyle = (band) => {
    if (band === 'High') return { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
    if (band === 'Medium') return { background: '#ffedd5', color: '#9a3412', border: '1px solid #fdba74' };
    if (band === 'Low') return { background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb' };
    return { background: 'transparent', color: '#9ca3af' };
  };

  return (
    <div className="main-content" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>
          All Campus Complaints
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
          Search, filter, inspect timelines and manage grievance lifecycles
        </p>
      </header>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <section style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by ID or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: '1 1 240px',
              padding: '9px 14px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '9px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', background: '#fff' }}
          >
            <option value="">All Categories</option>
            {config?.categories?.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ padding: '9px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', background: '#fff' }}
          >
            <option value="">All Statuses</option>
            {config?.statuses?.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {(search || selectedCategory || selectedStatus) && (
            <button
              onClick={handleClearFilters}
              style={{
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                padding: '9px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        <div style={{ marginTop: '12px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
          Showing <strong>{complaints.length}</strong> of <strong>{totalCount}</strong>
        </div>
      </section>

      {/* Complaints Table */}
      <section style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', marginBottom: '4px' }}>No complaints match</h3>
            <p style={{ fontSize: '13px' }}>Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#4b5563' }}>
                  <th style={{ padding: '12px 16px' }}>ID</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Description</th>
                  <th style={{ padding: '12px 16px' }}>Location</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Age</th>
                  <th style={{ padding: '12px 16px' }}>Urgency</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedComplaint(c)}
                    style={{
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      background: selectedComplaint?.id === c.id ? '#eff6ff' : '#fff',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: '800', color: '#111827' }}>{c.id}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>
                        {c.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', maxWidth: '300px', color: '#1f2937', fontWeight: '500' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.description}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#6b7280' }}>{c.location || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ ...getStatusStyle(c.status), fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#4b5563', fontWeight: '600' }}>{c.hoursPending}h</td>
                    <td style={{ padding: '14px 16px' }}>
                      {c.status === 'Resolved' ? (
                        <span style={{ color: '#9ca3af' }}>—</span>
                      ) : (
                        <span style={{ ...getUrgencyStyle(c.urgencyBand), fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>
                          {c.urgencyBand}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      {c.nextStatus ? (
                        <button
                          onClick={(e) => handleAdvance(e, c)}
                          disabled={advancingId === c.id}
                          style={{
                            background: '#1e3a8a',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: advancingId === c.id ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {advancingId === c.id ? 'Advancing...' : `Advance to ${c.nextStatus}`}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Detail Drawer */}
      {selectedComplaint && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            maxWidth: '460px',
            background: '#fff',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
            zIndex: 200,
            padding: '28px',
            overflowY: 'auto',
            borderLeft: '1px solid #e5e7eb'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827' }}>
              Complaint {selectedComplaint.id}
            </h2>
            <button
              onClick={() => setSelectedComplaint(null)}
              style={{ background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#6b7280' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
            <span style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '4px' }}>
              {selectedComplaint.category}
            </span>
            <span style={{ ...getStatusStyle(selectedComplaint.status), fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '4px' }}>
              {selectedComplaint.status}
            </span>
            {selectedComplaint.status !== 'Resolved' && selectedComplaint.urgencyBand && (
              <span style={{ ...getUrgencyStyle(selectedComplaint.urgencyBand), fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '4px' }}>
                {selectedComplaint.urgencyBand} Urgency
              </span>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Description</label>
            <p style={{ fontSize: '14px', color: '#1f2937', lineHeight: '1.6', marginTop: '6px', background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
              {selectedComplaint.description}
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Location</label>
            <p style={{ fontSize: '14px', color: '#374151', marginTop: '4px' }}>
              {selectedComplaint.location || 'Not specified'}
            </p>
          </div>

          {/* Score breakdown */}
          <div style={{ marginBottom: '24px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Score Breakdown</label>
            {selectedComplaint.score ? (
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#1e293b' }}>
                <div>Category Base: <strong>+{selectedComplaint.score.base}</strong></div>
                <div>Age Score ({selectedComplaint.hoursPending}h pending): <strong>+{selectedComplaint.score.age}</strong></div>
                <div>Extra Reports: <strong>+{selectedComplaint.score.reports}</strong></div>
                <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #cbd5e1', fontWeight: '800', fontSize: '15px', color: '#1e3a8a' }}>
                  Total Score = {selectedComplaint.score.total}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                Complaint is Resolved (not scored in active queue).
              </p>
            )}
          </div>

          {/* Status Timeline */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Status History Timeline</label>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedComplaint.statusHistory?.map((entry, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1e3a8a', marginTop: '5px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                      {entry.from ? `${entry.from} → ${entry.to}` : `Created as ${entry.to}`}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      {new Date(entry.at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedComplaint.nextStatus && (
            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={(e) => handleAdvance(e, selectedComplaint)}
                disabled={advancingId === selectedComplaint.id}
                style={{
                  width: '100%',
                  background: '#1e3a8a',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: advancingId === selectedComplaint.id ? 'not-allowed' : 'pointer'
                }}
              >
                {advancingId === selectedComplaint.id ? 'Advancing...' : `Advance Status to ${selectedComplaint.nextStatus}`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Complaints;
