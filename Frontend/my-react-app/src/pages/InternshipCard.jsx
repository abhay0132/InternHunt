// src/components/InternshipCard.jsx
import React from 'react';
import '../styles/InternshipCard.css';

const InternshipCard = ({ 
  internship, 
  onApply, 
  onBookmark, 
  showActions = true 
}) => {
  const {
    title,
    company,
    location,
    type,
    stipend,
    skills,
    deadline,
    isApplied,
    isBookmarked,
    applicationStatus,
  } = internship;

  const formatDeadline = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="internship-card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        <span className="card-company">{company}</span>
      </div>

      <div className="card-meta">
        {location && <span className="meta-item">{location}</span>}
        {type && <span className="meta-item type-badge">{type}</span>}
        {stipend && <span className="meta-item">{stipend}</span>}
      </div>

      {skills && skills.length > 0 && (
        <div className="card-skills">
          {skills.slice(0, 5).map((skill, idx) => (
            <span key={idx} className="skill-tag">{skill}</span>
          ))}
        </div>
      )}

      {deadline && (
        <div className="card-deadline">
          deadline: {formatDeadline(deadline)}
        </div>
      )}

      {showActions && (
        <div className="card-actions">
          {applicationStatus === 'applied' ? (
            <span className="applied-badge">✓ applied</span>
          ) : applicationStatus === 'pending' ? (
            <span className="pending-badge">⏳ pending</span>
          ) : (
            <button onClick={() => onApply(internship)} className="btn btn-primary btn-sm">
              apply
            </button>
          )}
          
          <button 
            onClick={() => onBookmark(internship)} 
            className={`btn btn-sm ${isBookmarked ? 'btn-bookmarked' : ''}`}
          >
            {isBookmarked ? '★ saved' : '☆ save'}
          </button>
        </div>
      )}
    </div>
  );
};

export default InternshipCard;