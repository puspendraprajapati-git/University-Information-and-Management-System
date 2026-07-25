import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopNavbar from '../components/layout/TopNavbar';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Automatically collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="d-flex w-100 vh-100" style={{ overflow: 'hidden', backgroundColor: 'var(--bg-color)' }}>
      <Sidebar isCollapsed={isSidebarCollapsed} role={user?.role} />
      
      <div className="d-flex flex-column flex-grow-1" style={{ overflowX: 'hidden' }}>
        <TopNavbar toggleSidebar={toggleSidebar} />
        
        <main className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
