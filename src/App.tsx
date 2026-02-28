import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth-context';
import { MarketingSite } from './pages/MarketingSite';
import { UnifiedLogin } from './portals/UnifiedLogin';
import { ProjectsGallery } from './pages/ProjectsGallery';
import { AdminPortal } from './portals/AdminPortal';
import { ClientPortal } from './portals/ClientPortal';
import { EmployeePortal } from './portals/EmployeePortal';
import { SubcontractorPortal } from './portals/SubcontractorPortal';
import { GCPortal } from './portals/GCPortal';
import { Toaster } from '@/components/ui/sonner';
import { seedDatabase } from './lib/database';

// Initialize database with seed data
if (typeof window !== 'undefined') {
  seedDatabase();
}

// Role-based redirect component
function RoleRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  switch (user?.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'client':
      return <Navigate to="/client" replace />;
    case 'employee':
      return <Navigate to="/employee" replace />;
    case 'subcontractor':
      return <Navigate to="/subcontractor" replace />;
    case 'gc':
      return <Navigate to="/gc" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MarketingSite />} />
          <Route path="/projects" element={<ProjectsGallery />} />
          <Route path="/login" element={<UnifiedLogin />} />

          {/* Portal Routes - Protected by role */}
          <Route path="/admin/*" element={<AdminPortal />} />
          <Route path="/client/*" element={<ClientPortal />} />
          <Route path="/employee/*" element={<EmployeePortal />} />
          <Route path="/subcontractor/*" element={<SubcontractorPortal />} />
          <Route path="/gc/*" element={<GCPortal />} />

          {/* Dashboard redirect based on role */}
          <Route path="/dashboard" element={<RoleRedirect />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
