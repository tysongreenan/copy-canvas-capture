
"use client";
import React, { useState } from "react";
import { BrandSidebar, MobileSidebar, MobileSidebarTrigger } from "@/components/ui/brand-sidebar";
import { useSearchParams, useNavigate } from "react-router-dom";

interface BrandingDashboardProps {
  projectId: string;
  children: React.ReactNode;
  activeSection?: string;
}

export function BrandingDashboard({ projectId, children, activeSection = "branding" }: BrandingDashboardProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleSectionChange = (section: string) => {
    navigate(`/branding/${projectId}?section=${section}`);
  };

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <BrandSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Brand Dashboard</h1>
            <MobileSidebarTrigger onOpen={() => setIsMobileOpen(true)} />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
