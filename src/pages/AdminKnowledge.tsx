
import React from "react";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { KnowledgeManagement } from "@/components/admin/KnowledgeManagement";

const AdminKnowledge = () => {
  return (
    <ProtectedRoute requiredRole="master_admin">
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        
        <main className="flex-1 container max-w-6xl px-6 md:px-0 py-6">
          <KnowledgeManagement />
        </main>
        
        <footer className="py-6 text-center text-sm text-gray-500 border-t">
          <div className="container">
            <p>Lumen © {new Date().getFullYear()} • Admin Panel</p>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
};

export default AdminKnowledge;
