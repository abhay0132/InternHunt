// src/pages/BookmarksPage.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import InternshipCard from '../pages/InternshipCard';
import ApplicationModal from '../components/ApplicationModal';
import '../styles/BookmarksPage.css';

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInternship, setSelectedInternship] = useState(null);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/bookmarks');
      setBookmarks(response.data.data.bookmarks);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (internship) => {
    setSelectedInternship(internship);
  };

  const handleBookmark = async (internship) => {
    try {
      await axiosInstance.delete(`/bookmarks/${internship.id}`);
      fetchBookmarks(); // Refresh list
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  return (
    <div className="bookmarks-page">
      <div className="container">
        <div className="page-header">
          <h1>Saved Internships</h1>
        </div>

        {loading ? (
          <div className="loading">loading bookmarks...</div>
        ) : bookmarks.length === 0 ? (
          <div className="no-results">no saved internships</div>
        ) : (
          <div className="bookmarks-list">
            {bookmarks.map((bookmark) => (
              <InternshipCard
                key={bookmark.id}
                internship={{
                  ...bookmark.Internship,
                  isBookmarked: true,
                }}
                onApply={handleApply}
                onBookmark={handleBookmark}
              />
            ))}
          </div>
        )}
      </div>

      {selectedInternship && (
        <ApplicationModal
          internship={selectedInternship}
          onClose={() => setSelectedInternship(null)}
          onStatusUpdate={fetchBookmarks}
        />
      )}
    </div>
  );
};

export default BookmarksPage;