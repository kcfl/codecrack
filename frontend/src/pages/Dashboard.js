import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [queue, setQueue] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [advancingId, setAdvancingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, queueRes, configRes] = await Promise.all([
        API.get('/stats'),
        API.get('/priority-queue'),
        API.get('/config')
      ]);
      setStats(statsRes.data);
      setQueue(queueRes.data);
      setConfig(configRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to connect to backend service. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdvance = async (complaint) => {
    if (!complaint.nextStatus) return;
    setAdvancingId(complaint.id);
    try {
      await API.patch(`/complaints/${complaint.id}/status`, { to: complaint.nextStatus });
      await fetchData(); // immediate re-fetch
    } catch (err) {
      console.error('Failed to advance status:', err);
      setError(err.response?.data?.message || 'Failed to update status');
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
    return { background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb' };
  };

  if (loading) {
    return (
      <div className="main-content" style={{ padding: '32px' }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>
          SATI Campus Complaint Dashboard
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
          Real-time grievance priority queue and resolution tracking
        </p>
      </header>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Total Complaints</div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#111827', margin: '8px 0' }}>{stats?.total ?? 0}</div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>All reported issues</div>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#d97706', textTransform: 'uppercase' }}>Pending (Unresolved)</div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#d97706', margin: '8px 0' }}>{stats?.pending ?? 0}</div>
          <div style={{ fontSize: '12px', color: '#4b5563', display: 'flex', gap: '12px', fontWeight: '500' }}>
            <span>Raised: <strong>{stats?.raised ?? 0}</strong></span>
            <span>•</span>
            <span>In Progress: <strong>{stats?.inProgress ?? 0}</strong></span>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#16a34a', textTransform: 'uppercase' }}>Resolved</div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#16a34a', margin: '8px 0' }}>{stats?.resolved ?? 0}</div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>Closed campus issues</div>
        </div>
      </section>

      {/* Priority Queue Panel */}
      <section style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>Top Priority Queue</h2>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>Highest priority unresolved complaints needing action</p>
          </div>
          <span style={{ fontSize: '12px', background: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>
            Top {queue.length} items
          </span>
        </div>

        {queue.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>All clear</h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>There are currently no unresolved complaints in the queue.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {queue.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb',
                  background: '#fafbfc',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flex: '1 1 300px' }}>
                  <div
                    style={{
                      background: '#1e3a8a',
                      color: '#fff',
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '16px',
                      flexShrink: 0
                    }}
                  >
                    #{item.rank}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '800', color: '#111827', fontSize: '15px' }}>{item.id}</span>
                      <span style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>
                        {item.category}
                      </span>
                      <span style={{ ...getStatusStyle(item.status), fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>
                        {item.status}
                      </span>
                      {item.urgencyBand && (
                        <span style={{ ...getUrgencyStyle(item.urgencyBand), fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>
                          {item.urgencyBand}
                        </span>
                      )}
                      {item.overdueByHours > 0 && (
                        <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', border: '1px solid #f87171' }}>
                          Overdue by {item.overdueByHours}h
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '14px', color: '#1f2937', fontWeight: '500', marginBottom: '6px' }}>
                      {item.description}
                    </p>

                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '12px', color: '#6b7280' }}>
                      <span>Pending: <strong>{item.hoursPending}h</strong></span>
                      {item.score && (
                        <span>
                          Breakdown: <strong>Category {item.score.base} + Age {item.score.age} + Reports {item.score.reports} = {item.score.total}</strong>
                        </span>
                      )}
                    </div>

                    {item.tieBreakNote && (
                      <div style={{ marginTop: '6px', fontSize: '12px', color: '#0369a1', fontStyle: 'italic' }}>
                        ℹ️ {item.tieBreakNote}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'center', minWidth: '70px' }}>
                    <div style={{ fontSize: '32px', fontWeight: '900', color: '#1e3a8a', lineHeight: '1' }}>
                      {item.score ? item.score.total : '-'}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginTop: '2px' }}>Score</div>
                  </div>

                  {item.nextStatus && (
                    <button
                      onClick={() => handleAdvance(item)}
                      disabled={advancingId === item.id}
                      style={{
                        background: '#1e3a8a',
                        color: '#fff',
                        border: 'none',
                        padding: '9px 16px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: advancingId === item.id ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {advancingId === item.id ? 'Advancing...' : `Advance to ${item.nextStatus}`}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How Priority Works Panel */}
      <section style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '14px' }}>
          How Priority Works
        </h2>

        <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Formula:</div>
          <code style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600', fontFamily: 'monospace' }}>
            score = categoryWeight + floor(hoursPending / 24) + min(supportCount, 3)
          </code>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
            Resolved complaints are automatically excluded and not scored. Age increases by +1 for every complete 24-hour period pending.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '10px' }}>Category Weights & SLAs</h3>
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '8px' }}>Category</th>
                  <th style={{ padding: '8px' }}>Weight</th>
                  <th style={{ padding: '8px' }}>SLA Target</th>
                </tr>
              </thead>
              <tbody>
                {config && config.categories?.map((cat) => (
                  <tr key={cat} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px', fontWeight: '600' }}>{cat}</td>
                    <td style={{ padding: '8px' }}>+{config.weights?.[cat] ?? 0}</td>
                    <td style={{ padding: '8px' }}>{config.slaTargets?.[cat] ?? 0} hours</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '10px' }}>Deterministic Tie-Break Rules</h3>
            <ol style={{ paddingLeft: '20px', fontSize: '13px', color: '#4b5563', lineHeight: '1.8' }}>
              {config && config.tieBreakRules?.map((rule, idx) => (
                <li key={idx} style={{ fontWeight: '500' }}>{rule}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;

