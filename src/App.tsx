import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Catalog from './pages/Catalog';
import ArtistLogin from './pages/artist/Login';
import AdminLogin from './pages/admin/Login';
import NotFound from './pages/NotFound';

// Lazy-loaded routes — split into separate chunks
const CatalogSubmit = React.lazy(() => import('./pages/CatalogSubmit'));
const BeatStore = React.lazy(() => import('./pages/BeatStore'));
const Blog = React.lazy(() => import('./pages/Blog'));
const Agreement = React.lazy(() => import('./pages/Agreement'));
const TrackDetail = React.lazy(() => import('./pages/TrackDetail'));
const ArtistDashboard = React.lazy(() => import('./pages/artist/Dashboard'));
const ArtistUpload = React.lazy(() => import('./pages/artist/Upload'));
const Royalties = React.lazy(() => import('./pages/artist/Royalties'));
const RegistrationStatus = React.lazy(() => import('./pages/artist/RegistrationStatus'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const SupervisorPortal = React.lazy(() => import('./pages/SupervisorPortal'));
const SupervisorRegister = React.lazy(() => import('./pages/SupervisorRegister'));
const SubmitBrief = React.lazy(() => import('./pages/SubmitBrief'));
const Niro = React.lazy(() => import('./pages/roster/Niro'));
const Tap919 = React.lazy(() => import('./pages/roster/Tap919'));
const ARTProductions = React.lazy(() => import('./pages/roster/ARTProductions'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const UploadBeat = React.lazy(() => import('./pages/artist/UploadBeat'));
const ArtistProfile = React.lazy(() => import('./pages/artist/Profile'));
const AdminInbox = React.lazy(() => import('./pages/admin/Inbox'));
const AdminSupervisorRequests = React.lazy(() => import('./pages/admin/SupervisorRequests'));
const AdminLicenseRequests = React.lazy(() => import('./pages/admin/LicenseRequests'));
const AdminBriefs = React.lazy(() => import('./pages/admin/Briefs'));
const ProGuide = React.lazy(() => import('./pages/artist/ProGuide'));

function ProtectedRoute({ children, fallbackPath, requiredRole }: { children: React.ReactNode, fallbackPath: string, requiredRole?: string }) {
  const { user, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-orange-500 font-mono text-sm uppercase tracking-widest">Loading...</div>;
  }

  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole && role !== 'admin') {
    // Admins can access everything; otherwise check the specific role
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="submit" element={<CatalogSubmit />} />
          <Route path="beat-store" element={<BeatStore />} />
          <Route path="blog" element={<Blog />} />
          <Route path="agreement" element={<Agreement />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="catalog/:id" element={<TrackDetail />} />
          <Route path="roster/niro" element={<Niro />} />
          <Route path="roster/tap919" element={<Tap919 />} />
          <Route path="roster/art-productions" element={<ARTProductions />} />
          <Route path="supervisor" element={<SupervisorPortal />} />
          <Route path="supervisor/register" element={<SupervisorRegister />} />
          
          <Route path="artist/login" element={<ArtistLogin />} />
          <Route path="artist/dashboard" element={<ProtectedRoute fallbackPath="/artist/login"><ArtistDashboard /></ProtectedRoute>} />
          <Route path="artist/upload" element={<ProtectedRoute fallbackPath="/artist/login"><ArtistUpload /></ProtectedRoute>} />
          <Route path="artist/upload-beat" element={<ProtectedRoute fallbackPath="/artist/login"><UploadBeat /></ProtectedRoute>} />
          <Route path="artist/profile" element={<ProtectedRoute fallbackPath="/artist/login"><ArtistProfile /></ProtectedRoute>} />
          <Route path="artist/royalties" element={<ProtectedRoute fallbackPath="/artist/login"><Royalties /></ProtectedRoute>} />
          <Route path="artist/registration-status" element={<ProtectedRoute fallbackPath="/artist/login"><RegistrationStatus /></ProtectedRoute>} />
          <Route path="artist/pro-guide" element={<ProtectedRoute fallbackPath="/artist/login"><ProGuide /></ProtectedRoute>} />
          
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin/dashboard" element={<ProtectedRoute requiredRole="admin" fallbackPath="/admin/login"><AdminDashboard /></ProtectedRoute>} />
          <Route path="admin/inbox" element={<ProtectedRoute requiredRole="admin" fallbackPath="/admin/login"><AdminInbox /></ProtectedRoute>} />
          <Route path="admin/supervisor-requests" element={<ProtectedRoute requiredRole="admin" fallbackPath="/admin/login"><AdminSupervisorRequests /></ProtectedRoute>} />
          <Route path="admin/license-requests" element={<ProtectedRoute requiredRole="admin" fallbackPath="/admin/login"><AdminLicenseRequests /></ProtectedRoute>} />
          <Route path="admin/briefs" element={<ProtectedRoute requiredRole="admin" fallbackPath="/admin/login"><AdminBriefs /></ProtectedRoute>} />
          <Route path="deals" element={<Navigate to="/admin/dashboard" replace />} />
          
          <Route path="submit-brief" element={<SubmitBrief />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
