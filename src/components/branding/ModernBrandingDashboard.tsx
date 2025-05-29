import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  FileText, 
  Globe, 
  Mail, 
  BookOpen,
  Palette,
  Settings,
  User
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ModernBrandingDashboardProps {
  projectId: string;
  activeSection: string;
  children: React.ReactNode;
}

export function ModernBrandingDashboard({ 
  projectId, 
  activeSection, 
  children 
}: ModernBrandingDashboardProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "Overview",
      href: `/branding/${projectId}?section=overview`,
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Brand Voice",
      href: `/branding/${projectId}?section=branding`,
      icon: (
        <Palette className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Website Content",
      href: `/branding/${projectId}?section=website`,
      icon: (
        <Globe className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "SEO Strategy",
      href: `/branding/${projectId}?section=seo`,
      icon: (
        <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Email Marketing",
      href: `/branding/${projectId}?section=emails`,
      icon: (
        <Mail className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Blog Content",
      href: `/branding/${projectId}?section=blog`,
      icon: (
        <BookOpen className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-gray-50 dark:bg-neutral-900 w-full flex-1 min-h-screen overflow-hidden"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: user?.email?.split('@')[0] || "User",
                href: "/profile",
                icon: (
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard>{children}</Dashboard>
    </div>
  );
}

export const Logo = () => {
  return (
    <div className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
      <div className="h-5 w-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        AI Marketing
      </motion.span>
    </div>
  );
};

export const LogoIcon = () => {
  return (
    <div className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
      <div className="h-5 w-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </div>
  );
};

// Modern dashboard content wrapper
const Dashboard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-8 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full min-h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  );
}; 