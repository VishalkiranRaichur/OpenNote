'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Filter, 
  Grid, 
  List, 
  Eye, 
  Heart, 
  MoreHorizontal,
  FileText,
  Image,
  File,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Note } from '@/types';
import { getNotes, deleteNote } from '@/lib/database';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'title'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  useEffect(() => {
    filterNotes();
  }, [notes, searchQuery, sortBy, subjectFilter]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const userNotes = await getNotes({ 
        authorId: user?.id,
        orderBy: sortBy === 'popular' ? 'popular' : 'recent'
      });
      setNotes(userNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    let filtered = [...notes];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Subject filter
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(note => note.subject === subjectFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'popular':
          return (b.likeCount + b.viewCount) - (a.likeCount + a.viewCount);
        case 'recent':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    setFilteredNotes(filtered);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await deleteNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

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

  const getSubjects = () => {
    const subjects = [...new Set(notes.map(note => note.subject).filter(Boolean))];
    return subjects;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">My Notes</h1>
          <p className="text-muted-foreground">
            Manage and organize your academic notes
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Note
          </Link>
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Subject Filter */}
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {getSubjects().map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notes Grid/List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {filteredNotes.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredNotes.map((note, index) => {
              const FileIcon = getFileIcon(note.type);
              
              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <FileIcon className="h-5 w-5 text-primary" />
                          <Badge variant={note.isPublic ? 'default' : 'secondary'}>
                            {note.isPublic ? 'Public' : 'Private'}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/notes/${note.id}`}>
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/notes/${note.id}/edit`}>
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardTitle className="line-clamp-2">{note.title}</CardTitle>
                      {note.subject && (
                        <p className="text-sm text-muted-foreground">{note.subject}</p>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      {viewMode === 'list' && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {note.content}
                        </p>
                      )}
                      
                      {/* Tags */}
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {note.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {note.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{note.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{note.viewCount}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="h-4 w-4" />
                            <span>{note.likeCount}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{note.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notes found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || subjectFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first note'
                }
              </p>
              <Button asChild>
                <Link href="/dashboard/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Note
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
