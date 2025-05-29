
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Home,
  Palette,
  Search,
  Globe,
  Mail,
  FileText,
  ChevronRight
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

interface BrandSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  className?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <Home size={18} />,
    description: 'Project summary and key metrics'
  },
  {
    id: 'branding',
    label: 'Branding',
    icon: <Palette size={18} />,
    description: 'Voice, tone, and brand guidelines'
  },
  {
    id: 'seo',
    label: 'SEO Strategy',
    icon: <Search size={18} />,
    description: 'Search optimization insights'
  },
  {
    id: 'website',
    label: 'Website Content',
    icon: <Globe size={18} />,
    description: 'Page content and structure'
  },
  {
    id: 'emails',
    label: 'Email Templates',
    icon: <Mail size={18} />,
    description: 'Email marketing content'
  },
  {
    id: 'blog',
    label: 'Blog Posts',
    icon: <FileText size={18} />,
    description: 'Content marketing articles'
  }
];

export function BrandSidebar({ activeSection, onSectionChange, className }: BrandSidebarProps) {
  return (
    <aside className={cn(
      "w-64 bg-white border-r border-gray-200 h-full flex flex-col",
      className
    )}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Brand Dashboard
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Manage your brand assets and content
        </p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            isActive={activeSection === item.id}
            onClick={() => onSectionChange(item.id)}
          />
        ))}
      </nav>
    </aside>
  );
}

interface SidebarItemProps {
  item: SidebarItem;
  isActive: boolean;
  onClick: () => void;
}

function SidebarItem({ item, isActive, onClick }: SidebarItemProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg transition-all duration-200 group",
        "hover:bg-gray-50 hover:shadow-sm",
        isActive 
          ? "bg-blue-50 border border-blue-200 shadow-sm" 
          : "border border-transparent"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "transition-colors duration-200",
            isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
          )}>
            {item.icon}
          </div>
          <div>
            <div className={cn(
              "font-medium transition-colors duration-200",
              isActive ? "text-blue-900" : "text-gray-900"
            )}>
              {item.label}
            </div>
            {item.description && (
              <div className="text-xs text-gray-500 mt-0.5">
                {item.description}
              </div>
            )}
          </div>
        </div>
        <ChevronRight 
          size={14} 
          className={cn(
            "transition-all duration-200",
            isActive 
              ? "text-blue-600 transform rotate-90" 
              : "text-gray-400 group-hover:text-gray-600"
          )}
        />
      </div>
    </motion.button>
  );
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function MobileSidebar({ isOpen, onClose, activeSection, onSectionChange }: MobileSidebarProps) {
  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed top-0 left-0 h-full w-64 bg-white z-50 lg:hidden shadow-xl"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Brand Dashboard
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={18} />
              </Button>
            </div>
            
            <nav className="p-4 space-y-2">
              {sidebarItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  isActive={activeSection === item.id}
                  onClick={() => handleSectionChange(item.id)}
                />
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function MobileSidebarTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onOpen}
      className="lg:hidden"
    >
      <Menu size={18} />
    </Button>
  );
}
