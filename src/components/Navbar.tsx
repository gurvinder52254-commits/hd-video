import { NavLink } from 'react-router-dom';
import { Film, Home, LayoutDashboard } from 'lucide-react';

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
          <NavLink to="/gurvindersingh" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
