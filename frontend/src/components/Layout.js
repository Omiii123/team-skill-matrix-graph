// App layout with sidebar navigation. Used by all protected routes.
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => (
  <div className="app-shell">
    <Sidebar />
    <div className="main-content">
      <Outlet />
    </div>
  </div>
);

export default Layout;
