import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

const AppShell = ({ children, onCreateProject }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onCreateProject={onCreateProject} />
      <div className="main-panel">
        <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} onCreateProject={onCreateProject} />
        <div className="content-scroll">{children}</div>
      </div>
    </div>
  );
};

export default AppShell;
