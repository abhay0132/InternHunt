import { useState } from "react";
import "../styles/Header.css";
import { FaBars } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import '@fontsource/inter/400';

function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        // Clear JWT + user info from localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("userId");

        // Redirect to home or login page
        navigate("/");
    };

    return (
        <>
            <header>
                <div className="header-container">
                    <nav>
                        <div className="project-name">
                            <h2> InternHunt </h2>
                        </div>
                        <ul className={isOpen ? "nav-link active" : "nav-link"}>
                            <li>
                                <Link to="/" className="active">Home</Link>
                            </li>
                            <li>
                                <Link to="/internships">Browse Internships</Link>
                            </li>
                            <li>
                                <Link to="/bookmarks">Bookmarks</Link>
                            </li>
                            <li>
                                <Link to="/applied">Applied</Link>
                            </li>
                            
                            <li>
                                {/* Logout button */}
                                <button 
                                    onClick={handleLogout} 
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "black" }}
                                >
                                    Logout
                                </button>
                            </li>
                        </ul>
                        <div className="icon" onClick={toggleMenu}>
                            <FaBars />
                        </div>
                    </nav>
                </div>
            </header>
            <section>
                <div className="section-container">
                    <div className="content-container"></div>
                </div>
            </section>
        </>
    );
}

export default Header;
