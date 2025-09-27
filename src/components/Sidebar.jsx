import React, { useState } from "react";
import { Link } from "react-router";

function Sidebar({ genres, activeGenre, counts }) {
  // 1. Use useState to manage the sidebar's open/closed state
  const [isOpen, setIsOpen] = useState(false); // Start open by default
  
  // 2. Function to toggle the state
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };


  return (
    // 3. Conditionally apply a CSS class based on isOpen state
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      
      {/* 4. Add a button to toggle the sidebar, typically placed outside the sidebar or at the top */}
      <button 
        onClick={toggleSidebar} 
        className="sidebar-toggle-button" // You'll need to define this CSS class
        aria-expanded={isOpen}
        aria-controls="sidebar-content"
      >
        {isOpen ? '◀' : '▶'} {/* Use an icon or text for the toggle */}
      </button>
      
      
      {/* 5. Conditionally render the content OR rely on CSS to hide it */}
      <div id="sidebar-content">
        <div className="sidebar-title">Library</div>

        <nav className="sidebar-nav">
          <Link
            to="/"
            className={
              activeGenre === null ? "sidebar-link-active" : "sidebar-link"
            }
          >
            All Columns
          </Link>

          <div className="sidebar-section">
            <div className="sidebar-heading">Years</div>
            {/* {genres.map((genre) => (
              <Link
                key={genre.name}
                to={`/genre/${encodeURIComponent(genre.name)}`}
                className={
                  activeGenre === genre.name
                    ? "sidebar-link-active"
                    : "sidebar-link"
                }
              >
                {genre.name}
                {counts && (
                  <span className="ml-2 text-xs text-gray-900">
                    ({genre.count})
                  </span>
                )}
              </Link>
            ))} */}
          </div>
        </nav>

        <div className="mt-auto pt-6 px-6">
          <div className="text-xs text-gray-900">
            Powered by
            <br />
            <a
              href="https://cloudflare.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-800 hover:underline"
            >
              Cloudflare
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
