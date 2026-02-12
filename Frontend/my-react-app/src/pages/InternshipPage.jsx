// src/pages/InternshipPage.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import InternshipCard from '../pages/InternshipCard';
import ApplicationModal from '../components/ApplicationModal';
import FilterModal from '../components/FilterModal';
import '../styles/InternshipPage.css';

const InternshipPage = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    fetchInternships();
  }, [filters, page]);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const params = { ...filters, page, limit: 20 };
      const response = await axiosInstance.get('/internships', { params });
      
      setInternships(response.data.data.internships);
      setTotalPages(response.data.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching internships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (internship) => {
    setSelectedInternship(internship);
  };

  const handleBookmark = async (internship) => {
    try {
      if (internship.isBookmarked) {
        await axiosInstance.delete(`/bookmarks/${internship.id}`);
      } else {
        await axiosInstance.post(`/bookmarks/${internship.id}`);
      }
      fetchInternships(); // Refresh to update bookmark status
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleStatusUpdate = () => {
    fetchInternships(); // Refresh after status update
  };

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="internship-page">
      <div className="container">
        <div className="page-header">
          <h1>Internships</h1>
          <button onClick={() => setShowFilterModal(true)} className="btn">
            filter
          </button>
        </div>

        {Object.values(filters).some(v => v) && (
          <div className="active-filters">
            <span>active filters:</span>
            {filters.search && <span className="filter-tag">search: {filters.search}</span>}
            {filters.type && <span className="filter-tag">type: {filters.type}</span>}
            {filters.location && <span className="filter-tag">location: {filters.location}</span>}
            {filters.skills && <span className="filter-tag">skills: {filters.skills}</span>}
            <button onClick={() => handleFilterApply({})} className="btn-clear-filters">
              clear all
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading">loading internships...</div>
        ) : internships.length === 0 ? (
          <div className="no-results">no internships found</div>
        ) : (
          <>
            <div className="internships-list">
              {internships.map((internship) => (
                <InternshipCard
                  key={internship.id}
                  internship={internship}
                  onApply={handleApply}
                  onBookmark={handleBookmark}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn"
                >
                  ← prev
                </button>
                <span className="page-info">
                  page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn"
                >
                  next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedInternship && (
        <ApplicationModal
          internship={selectedInternship}
          onClose={() => setSelectedInternship(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {showFilterModal && (
        <FilterModal
          initialFilters={filters}
          onApply={handleFilterApply}
          onClose={() => setShowFilterModal(false)}
        />
      )}
    </div>
  );
};

export default InternshipPage;