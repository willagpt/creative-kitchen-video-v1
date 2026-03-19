import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store';
import { Auth } from '@/views/Auth';
import { WorkspaceSetup } from '@/views/WorkspaceSetup';
import { Layout } from '@/components/Layout';
import { Shots } from '@/views/Shots';
import { ToastContainer } from '@/components/Toast';

export default function App() {
  const { user, setUser, workspace } = useStore();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Auth />
        <ToastContainer />
      </>
    );
  }

  if (!workspace) {
    return <WorkspaceSetup />;
  }

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/shots" replace />} />
          <Route path="/shots" element={<Shots />} />
          <Route path="*" element={<Navigate to="/shots" replace />} />
        </Routes>
      </Layout>
      <ToastContainer />
    </>
  );
}
