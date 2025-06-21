import React, { useEffect, useState } from 'react';

const Log = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/log', {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!res.ok) throw new Error('Failed to fetch logs');

        const data = await res.json();
        setLogs(data);
        setFilteredLogs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Filter logs based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = logs.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.userId && log.userId.toString().includes(searchTerm)) ||
        (log.programId && log.programId.toString().includes(searchTerm))
      );
      setFilteredLogs(filtered);
      setCurrentPage(1); // Reset to first page when searching
    } else {
      setFilteredLogs(logs);
    }
  }, [searchTerm, logs]);

  // Pagination calculations
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const paginate = pageNumber => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  if (loading) return <p>Loading logs...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h2>User Activity Logs</h2>
      
      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search logs by action, details, user ID, or program ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </div>
      
      {/* Log Count */}
      <div style={{ marginBottom: '10px', color: '#666' }}>
        {filteredLogs.length} logs found {searchTerm ? `(filtered from ${logs.length})` : ''}
      </div>

      {currentLogs.length === 0 ? (
        <p>No logs match your search criteria.</p>
      ) : (
        <>
          {/* Logs List */}
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {currentLogs.map((log) => (
              <li 
                key={log.id} 
                style={{ 
                  marginBottom: '1rem', 
                  padding: '1rem', 
                  border: '1px solid #ccc', 
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{log.action}</strong>
                  <small style={{ color: '#555' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </small>
                </div>
                <p style={{ margin: '8px 0' }}>{log.details}</p>
                <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem' }}>
                  {log.userId && (
                    <span>User ID: <strong>{log.userId}</strong></span>
                  )}
                  {log.programId && (
                    <span>Program ID: <strong>{log.programId}</strong></span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination Controls */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginTop: '20px',
            gap: '10px'
          }}>
            <button 
              onClick={prevPage} 
              disabled={currentPage === 1}
              style={{
                padding: '5px 15px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: currentPage === 1 ? '#f0f0f0' : '#fff',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            
            <div style={{ display: 'flex', gap: '5px' }}>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => paginate(index + 1)}
                  style={{
                    padding: '5px 10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: currentPage === index + 1 ? '#007bff' : '#fff',
                    color: currentPage === index + 1 ? 'white' : 'black',
                    cursor: 'pointer'
                  }}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <button 
              onClick={nextPage} 
              disabled={currentPage === totalPages}
              style={{
                padding: '5px 15px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: currentPage === totalPages ? '#f0f0f0' : '#fff',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
          
          {/* Page Info */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '10px', 
            color: '#666',
            fontSize: '0.9rem'
          }}>
            Page {currentPage} of {totalPages} | Showing {currentLogs.length} of {filteredLogs.length} logs
          </div>
        </>
      )}
    </div>
  );
};

export default Log;