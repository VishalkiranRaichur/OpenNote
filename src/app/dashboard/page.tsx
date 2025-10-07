'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useNotes } from '@/hooks/useNotes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  Plus, 
  TrendingUp, 
  Clock, 
  Eye, 
  Heart,
  Search,
  ArrowRight,
  FileText,
  Image,
  File
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Note } from '@/types';

export default function DashboardPage() {
  const { user } = useUser();
  const { notes: userNotes, loading: userNotesLoading } = useNotes({
    authorId: user?.id,
    orderByField: 'createdAt',
    orderByDirection: 'desc',
    limit: 5,
  });
  const { notes: publicNotes, loading: publicNotesLoading } = useNotes({
    isPublic: true,
    orderByField: 'viewCount',
    orderByDirection: 'desc',
    limit: 5,
  });

  const loading = userNotesLoading || publicNotesLoading;

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return File;
      case 'image':
        return Image;
      case 'markdown':
      default:
        return FileText;
    }
  };

  const stats = [
    { label: 'Total Notes', value: userNotes.length, icon: BookOpen },
    { label: 'Public Notes', value: userNotes.filter(n => n.isPublic).length, icon: TrendingUp },
    { label: 'Total Views', value: userNotes.reduce((sum, n) => sum + n.viewCount, 0), icon: Eye },
    { label: 'Total Likes', value: userNotes.reduce((sum, n) => sum + n.likeCount, 0), icon: Heart },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.displayName?.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your notes today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with these common tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild className="h-auto p-6 flex flex-col items-center space-y-2">
                <Link href="/dashboard/create">
                  <Plus className="h-8 w-8" />
                  <span>Create New Note</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-6 flex flex-col items-center space-y-2">
                <Link href="/dashboard/discover">
                  <Search className="h-8 w-8" />
                  <span>Discover Notes</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-6 flex flex-col items-center space-y-2">
                <Link href="/dashboard/public">
                  <TrendingUp className="h-8 w-8" />
                  <span>Browse Public</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Recent Notes</CardTitle>
                <CardDescription>
                  Your latest uploaded notes
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/notes">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {userNotes.length > 0 ? (
                <div className="space-y-4">
                  {userNotes.map((note) => {
                    const FileIcon = getFileIcon(note.type);
                    return (
                      <div key={note.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <FileIcon className="h-8 w-8 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{note.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {note.subject} • {note.type} • {note.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          <span>{note.viewCount}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No notes yet</p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/create">
                      Create your first note
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Popular Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Trending Notes</CardTitle>
                <CardDescription>
                  Popular notes from the community
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/trending">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {publicNotes.length > 0 ? (
                <div className="space-y-4">
                  {publicNotes.map((note) => {
                    const FileIcon = getFileIcon(note.type);
                    return (
                      <div key={note.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <FileIcon className="h-8 w-8 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{note.title}</p>
                          <p className="text-sm text-muted-foreground">
                            by {note.authorName} • {note.subject} • {note.type}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Heart className="h-4 w-4" />
                          <span>{note.likeCount}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No popular notes yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
