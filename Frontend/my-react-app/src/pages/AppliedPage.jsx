// src/pages/AppliedPage.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import InternshipCard from '../pages/InternshipCard';
import '../styles/AppliedPage.css';

const AppliedPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, applied, pending, not_applied

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await axiosInstance.get('/applications', { params });
      setApplications(response.data.data.applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="applied-page">
      <div className="container">
        <div className="page-header">
          <h1>My Applications</h1>
          
          <div className="filter-tabs">
            <button
              className={`tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              all
            </button>
            <button
              className={`tab ${filter === 'applied' ? 'active' : ''}`}
              onClick={() => setFilter('applied')}
            >
              applied
            </button>
            <button
              className={`tab ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              pending
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="no-results">
            no applications found
            {filter !== 'all' && <> in "{filter}" status</>}
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((app) => (
              <InternshipCard
                key={app.id}
                internship={{
                  ...app.Internship,
                  applicationStatus: app.status,
                }}
                showActions={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppliedPage;