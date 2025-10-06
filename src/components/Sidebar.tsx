'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BookOpen, 
  Search, 
  Plus, 
  Settings, 
  Users, 
  Star,
  Clock,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'My Notes',
    href: '/dashboard/notes',
    icon: BookOpen,
  },
  {
    title: 'Discover',
    href: '/dashboard/discover',
    icon: Search,
  },
  {
    title: 'Create Note',
    href: '/dashboard/create',
    icon: Plus,
  },
  {
    title: 'Public Notes',
    href: '/dashboard/public',
    icon: Users,
  },
  {
    title: 'Favorites',
    href: '/dashboard/favorites',
    icon: Star,
  },
  {
    title: 'Recent',
    href: '/dashboard/recent',
    icon: Clock,
  },
  {
    title: 'Trending',
    href: '/dashboard/trending',
    icon: TrendingUp,
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r bg-muted/20 min-h-screen">
      <div className="p-6">
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-primary text-primary-foreground"
                )}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
