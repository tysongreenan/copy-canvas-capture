
import { HomeIcon, LogInIcon, LayoutDashboardIcon, FileTextIcon } from 'lucide-react';

export const initialNodes = [
  {
    id: 'home',
    type: 'siteNode',
    position: { x: 250, y: 0 },
    data: {
      label: 'Home Page',
      icon: <HomeIcon className="w-5 h-5" />,
      path: '/',
      handles: ['bottom'],
    },
  },
  {
    id: 'auth',
    type: 'siteNode',
    position: { x: 50, y: 150 },
    data: {
      label: 'Authentication',
      icon: <LogInIcon className="w-5 h-5" />,
      path: '/auth',
      handles: ['top', 'right'],
    },
  },
  {
    id: 'dashboard',
    type: 'siteNode',
    position: { x: 250, y: 150 },
    data: {
      label: 'Dashboard',
      icon: <LayoutDashboardIcon className="w-5 h-5" />,
      path: '/dashboard',
      handles: ['top', 'bottom', 'left', 'right'],
    },
  },
  {
    id: 'project',
    type: 'siteNode',
    position: { x: 450, y: 150 },
    data: {
      label: 'Project Details',
      icon: <FileTextIcon className="w-5 h-5" />,
      description: 'View project data',
      path: '/project/example',
      handles: ['top', 'left'],
    },
  },
  {
    id: 'sitemap',
    type: 'siteNode',
    position: { x: 250, y: 300 },
    data: {
      label: 'Sitemap',
      icon: <FileTextIcon className="w-5 h-5" />,
      description: 'Current page',
      path: '/sitemap',
      handles: ['top'],
    },
  },
];

export const initialEdges = [
  {
    id: 'home-auth',
    source: 'home',
    target: 'auth',
    animated: true,
    style: { stroke: '#3b82f6' },
  },
  {
    id: 'home-dashboard',
    source: 'home',
    target: 'dashboard',
    animated: true,
    style: { stroke: '#3b82f6' },
  },
  {
    id: 'home-project',
    source: 'home',
    target: 'project',
    animated: true,
    style: { stroke: '#3b82f6' },
  },
  {
    id: 'dashboard-sitemap',
    source: 'dashboard',
    target: 'sitemap',
    animated: true,
    style: { stroke: '#3b82f6' },
  },
];
