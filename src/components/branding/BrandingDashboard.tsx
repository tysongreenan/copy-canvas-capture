
"use client";
import React, { useState } from "react";
import { BrandSidebar, SidebarBody, SidebarLink } from "@/components/ui/brand-sidebar";
import { Brush, Search, FileText, Mail, Edit3, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BrandingDashboardProps {
  projectId: string;
  children: React.ReactNode;
  activeSection?: string;
}

export function BrandingDashboard({ projectId, children, activeSection = "branding" }: BrandingDashboardProps) {
  const links = [
    {
      label: "Branding",
      href: `/branding/${projectId}?section=branding`,
      icon: (
        <Brush className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "SEO",
      href: `/branding/${projectId}?section=seo`,
      icon: (
        <Search className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Website Content",
      href: `/branding/${projectId}?section=content`,
      icon: (
        <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Emails",
      href: `/branding/${projectId}?section=emails`,
      icon: (
        <Mail className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Blog Posts",
      href: `/branding/${projectId}?section=blog`,
      icon: (
        <Edit3 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  
  const [open, setOpen] = useState(false);
  
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-gray-50 dark:bg-neutral-800 w-full flex-1 border border-neutral-200 dark:border-neutral-700 overflow-hidden min-h-screen"
      )}
    >
      <BrandSidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <Logo />
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Back to Project",
                href: `/project/${projectId}`,
                icon: (
                  <Globe className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </BrandSidebar>
      <div className="flex flex-1">
        <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      to="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-indigo-600 dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Brand Settings
      </motion.span>
    </Link>
  );
};
