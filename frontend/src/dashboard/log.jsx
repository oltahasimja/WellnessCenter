import React, { useEffect, useState } from 'react';

const Log = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/log', {
          headers: {
            'Content-Type': 'application/json',
            // Add token if needed:
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!res.ok) throw new Error('Failed to fetch logs');

        const data = await res.json();
        setLogs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) return <p>Loading logs...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (logs.length === 0) return <p>No logs to display.</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>User Activity Logs</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {logs.map((log) => (
          <li key={log.id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
            <strong>{log.action}</strong>
            <p>{log.details}</p>
            <small style={{ color: '#555' }}>{new Date(log.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Log;
