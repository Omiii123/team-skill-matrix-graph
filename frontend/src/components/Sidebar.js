// Sidebar navigation with active link highlighting.
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="brand">⚡ Skill Matrix</div>
      <NavLink to="/dashboard">Dashboard</NavLink>
      <NavLink to="/graph">Graph View</NavLink>
      <NavLink to="/people">People</NavLink>
      <NavLink to="/skills">Skills</NavLink>
      <button
        className="btn btn-outline-light btn-sm logout-btn"
        onClick={handleLogout}
      >
        Logout {user ? `(${user.name})` : ''}
      </button>
    </aside>
  );
};

export default Sidebar;
