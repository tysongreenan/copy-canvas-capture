import React from 'react';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RAGQueryStats } from '@/components/admin/RAGQueryStats';

const AdminRAGStats = () => {
  return (
    <ProtectedRoute requiredRole="master_admin">
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 container max-w-6xl px-6 md:px-0 py-6">
          <RAGQueryStats />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AdminRAGStats;
