import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import LoadingScreen from './LoadingScreen';
import Home from './pages/Home';

const BlogIndex = lazy(() => import('./pages/BlogIndex'));
const PostPage = lazy(() => import('./pages/PostPage'));
const AdminApp = lazy(() => import('./admin/AdminApp'));

const host = typeof window !== 'undefined' ? window.location.hostname : '';
const isAdminHost = host.startsWith('admin.');
const isMainProdHost = host === 'thurayyastudio.com' || host === 'www.thurayyastudio.com';

function AdminRedirect() {
  useEffect(() => { window.location.replace('https://admin.thurayyastudio.com/'); }, []);
  return <div className="min-h-screen bg-slate-950" />;
}

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function App() {
  const [loadingDone, setLoadingDone] = useState(() => isAdminHost || window.location.pathname !== '/');

  if (isAdminHost) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <Routes>
          <Route path="/*" element={<AdminApp />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <>
      {!loadingDone && <LoadingScreen onComplete={() => setLoadingDone(true)} />}
      <ScrollManager />
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<BlogIndex lang="en" />} />
        <Route path="/blog/:slug" element={<PostPage lang="en" />} />
        <Route path="/ar/blog" element={<BlogIndex lang="ar" />} />
        <Route path="/ar/blog/:slug" element={<PostPage lang="ar" />} />
        <Route path="/admin/*" element={isMainProdHost ? <AdminRedirect /> : <AdminApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
      <Analytics debug={false} />
    </>
  );
}

export default App;
