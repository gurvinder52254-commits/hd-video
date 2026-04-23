import { NavLink } from 'react-router-dom';
import { Film, Home } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="navbar">
      <div className="container nav-container">
        <NavLink to="/" className="nav-logo">
          <div className="logo-icon">
            <Film size={24} />
          </div>
          <span>VideoHub<span style={{ color: 'var(--primary)' }}>.</span></span>
        </NavLink>

        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Home size={18} />
            <span>Home</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
