// src/components/FilterModal.jsx
import React, { useState } from 'react';
import '../styles/FilterModal.css';

const FilterModal = ({ onApply, onClose, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    search: initialFilters.search || '',
    type: initialFilters.type || '',
    location: initialFilters.location || '',
    skills: initialFilters.skills || '',
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    const emptyFilters = { search: '', type: '', location: '', skills: '' };
    setFilters(emptyFilters);
    onApply(emptyFilters);
    onClose();
  };

  return (
    <>
      <div className="filter-overlay" onClick={onClose}></div>
      <div className="filter-modal">
        <div className="filter-content">
          <h3>Filter Internships</h3>
          
          <div className="filter-group">
            <label>search:</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="title, company, description..."
            />
          </div>

          <div className="filter-group">
            <label>type:</label>
            <select name="type" value={filters.type} onChange={handleChange}>
              <option value="">all</option>
              <option value="Remote">remote</option>
              <option value="Onsite">onsite</option>
              <option value="Hybrid">hybrid</option>
            </select>
          </div>

          <div className="filter-group">
            <label>location:</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleChange}
              placeholder="e.g. Bangalore, Mumbai..."
            />
          </div>

          <div className="filter-group">
            <label>skills:</label>
            <input
              type="text"
              name="skills"
              value={filters.skills}
              onChange={handleChange}
              placeholder="e.g. React, Python..."
            />
          </div>

          <div className="filter-actions">
            <button onClick={handleApply} className="btn btn-primary">
              apply filters
            </button>
            <button onClick={handleClear} className="btn">
              clear
            </button>
            <button onClick={onClose} className="btn">
              cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterModal;