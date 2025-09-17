import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoadingScreen from './components/layout/LoadingScreen.jsx';
import SignIn from './components/auth/SignIn.jsx';
import AppShell from './components/layout/AppShell.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import ProjectWorkspace from './components/projects/ProjectWorkspace.jsx';
import ProjectCreateDialog from './components/dashboard/ProjectCreateDialog.jsx';

function App() {
  const { user, loading } = useAuth();
  const [isProjectDialogOpen, setProjectDialogOpen] = useState(false);

  if (loading) {
    return <LoadingScreen message="Çalışma alanınız hazırlanıyor..." />;
  }

  if (!user) {
    return <SignIn />;
  }

  return (
    <>
      <AppShell onCreateProject={() => setProjectDialogOpen(true)}>
        <Routes>
          <Route path="/" element={<Dashboard onCreateProject={() => setProjectDialogOpen(true)} />} />
          <Route path="/projects/:projectId/*" element={<ProjectWorkspace onCreateProject={() => setProjectDialogOpen(true)} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
      <ProjectCreateDialog open={isProjectDialogOpen} onClose={() => setProjectDialogOpen(false)} />
    </>
  );
}

export default App;
