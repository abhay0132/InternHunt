import Header from "../components/Header";
import { IoArrowBackCircle } from "react-icons/io5";
import "../styles/FullPage.css";
import { useNavigate } from "react-router";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";

function FullPage() {
  const { id } = useParams();
  const [internship, setInternship] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const navigate = useNavigate();

  const [isApplied, setIsApplied] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/internships/${id}`)
      .then((res) => setInternship(res.data))
      .catch((err) => console.error(err));

    
    axios
      .get(`http://localhost:8000/api/bookmarks/${userId}`)
      .then((res) => {
        const bookmarked = res.data.some(
          (b) => b.Internship && b.Internship.id === id
        );
        setIsBookmarked(bookmarked);
      })
      .catch((err) => console.error("Bookmark check error:", err));
  }, [id, userId]);

  const handleApply = (internship) => {
    if (internship.applyLink) {
      window.open(internship.applyLink, "_blank");
    }

    axios.post(`http://localhost:8000/api/applications/${internship.id}`, { userId })
      .then(() => {
        alert("Applied Successfully");
        setIsApplied(true);
        window.dispatchEvent(new Event("refreshApplications"));
      })
      .catch(err => console.error(err));
  };

  const handleBookmark = (id, isBookmarked) => {
    if (isBookmarked) {
      axios
        .delete(`http://localhost:8000/api/bookmarks/${id}`, { data: { userId } })
        .then(() => {
          alert("Bookmark Removed");
          setIsBookmarked(false);
        })
        .catch((err) => console.error(err));
    } else {
      axios
        .post(`http://localhost:8000/api/bookmarks/${id}`, { userId })
        .then(() => {
          alert("Bookmarked Successfully");
          setIsBookmarked(true);
        })
        .catch((err) => console.error(err));
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      <Header />
      <IoArrowBackCircle className="back-icon" onClick={handleBack} />
      {internship ? (
        <div className="internship-container-full">
          <p><span className="label">Role:</span> {internship.title}</p>
          <p><span className="label">Company:</span> {internship.company}</p>
          <p><span className="label">Location:</span> {internship.location}</p>
          <p><span className="label">Type:</span> {internship.type}</p>
          <p><span className="label">Stipend:</span> {internship.stipend}</p>
          <p><span className="label">Description:</span> {internship.description}</p>
          <p><span className="label">Duration:</span> {internship.duration}</p>
          <p><span className="label">Skills:</span> {internship.skills?.join(", ")}</p>
          <p><span className="label">Deadline:</span> {internship.deadline}</p>
          <div className="button-apply-details">
            <button
              onClick={() => handleApply(internship)}
              disabled={isApplied}
              className="apply-button"
              style={{width:"20%"}}
            >
              {isApplied ? "Applied" : "Apply"}
            </button>


            <button onClick={() => handleBookmark(internship.id, isBookmarked)} className="bookmark-button" style={{width:"20%"}}>
              {isBookmarked ? "Unbookmark" : "Bookmark"}
            </button>
          </div>
        </div>
      ) : (
        <p>Loading internship details...</p>
      )}
    </>
  );
}

export default FullPage;
