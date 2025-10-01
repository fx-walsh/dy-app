import React, { useState } from "react";
import { Link } from "react-router";

function Sidebar({ genres, activeGenre, counts }) {
  // 1. Start CLOSED by default, which is better for a mobile-first hamburger
  const [isOpen, setIsOpen] = useState(false);

  // 2. Function to toggle the state
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* 3. The Hamburger/Close Button - ALWAYS visible on mobile/small screens */}
      <button
        onClick={toggleSidebar}
        className="hamburger-menu-button" // New class for positioning/styling the button
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isOpen}
        aria-controls="sidebar-content"
      >
        {/* Use a hamburger icon when closed, and an 'X' or other icon when open */}
        {isOpen ? '✕' : '☰'} 
      </button>

      {/* 4. Conditionally apply the class based on isOpen state */}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div id="sidebar-content">
          <div className="sidebar-title">Library</div>

          <nav className="sidebar-nav">
            <Link
              to="/"
              className={
                activeGenre === null ? "sidebar-link-active" : "sidebar-link"
              }
              // OPTIONAL: Close the sidebar when a link is clicked
              onClick={toggleSidebar}
            >
              All Columns
            </Link>

            <div className="sidebar-section">
              <div className="sidebar-heading">Years</div>
              {/* Genre mapping content goes here */}
              {/* ... */}
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
      
      {/* OPTIONAL: An overlay/backdrop to close the sidebar when clicking outside */}
      {isOpen && <div className="sidebar-backdrop" onClick={toggleSidebar} />}
    </>
  );
}

export default Sidebar;