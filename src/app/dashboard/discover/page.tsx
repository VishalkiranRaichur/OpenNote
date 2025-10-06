'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Eye, 
  Heart, 
  TrendingUp,
  Clock,
  Star,
  FileText,
  Image,
  File,
  Calendar,
  Tag,
  Users,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Note, Tag as TagType, Subject } from '@/types';
import { getNotes, searchNotes, getTags, getSubjects } from '@/lib/database';
import { toast } from 'sonner';
import Link from 'next/link';

export default function DiscoverPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'title'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('trending');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, searchQuery, sortBy, subjectFilter, tagFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch public notes
      const publicNotes = await getNotes({ 
        isPublic: true,
        orderBy: 'popular'
      });
      setNotes(publicNotes);

      // Fetch tags and subjects
      const [tagsData, subjectsData] = await Promise.all([
        getTags(),
        getSubjects()
      ]);
      setTags(tagsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = async () => {
    let filtered = [...notes];

    // Search filter
    if (searchQuery) {
      try {
        const searchResults = await searchNotes(searchQuery, {
          isPublic: true,
          subject: subjectFilter !== 'all' ? subjectFilter : undefined,
        });
        filtered = searchResults;
      } catch (error) {
        console.error('Search error:', error);
        // Fallback to client-side search
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(note =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.authorName.toLowerCase().includes(query) ||
          note.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
    }

    // Subject filter
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(note => note.subject === subjectFilter);
    }

    // Tag filter
    if (tagFilter !== 'all') {
      filtered = filtered.filter(note => note.tags.includes(tagFilter));
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

  const handleLike = async (noteId: string) => {
    // TODO: Implement like functionality
    toast.success('Note liked!');
  };

  const handleTagClick = (tagName: string) => {
    setTagFilter(tagName);
    setActiveTab('search');
  };

  const handleSubjectClick = (subjectName: string) => {
    setSubjectFilter(subjectName);
    setActiveTab('search');
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
      >
        <h1 className="text-3xl font-bold mb-2">Discover Notes</h1>
        <p className="text-muted-foreground">
          Explore and discover amazing notes shared by the community
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Notes</p>
                <p className="text-2xl font-bold">{notes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Contributors</p>
                <p className="text-2xl font-bold">
                  {new Set(notes.map(n => n.authorId)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Tags</p>
                <p className="text-2xl font-bold">{tags.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Views</p>
                <p className="text-2xl font-bold">
                  {notes.reduce((sum, n) => sum + n.viewCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trending" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Trending</span>
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Recent</span>
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Search</span>
          </TabsTrigger>
          <TabsTrigger value="browse" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Browse</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes
                .sort((a, b) => (b.likeCount + b.viewCount) - (a.likeCount + a.viewCount))
                .slice(0, 6)
                .map((note, index) => {
                  const FileIcon = getFileIcon(note.type);
                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <FileIcon className="h-5 w-5 text-primary" />
                              <Badge variant="default">Trending</Badge>
                            </div>
                          </div>
                          <CardTitle className="line-clamp-2">{note.title}</CardTitle>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={note.authorName} />
                              <AvatarFallback>
                                {note.authorName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>by {note.authorName}</span>
                          </div>
                        </CardHeader>
                        <CardContent>
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
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/dashboard/notes/${note.id}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="recent">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .slice(0, 6)
                .map((note, index) => {
                  const FileIcon = getFileIcon(note.type);
                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <FileIcon className="h-5 w-5 text-primary" />
                              <Badge variant="secondary">Recent</Badge>
                            </div>
                          </div>
                          <CardTitle className="line-clamp-2">{note.title}</CardTitle>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={note.authorName} />
                              <AvatarFallback>
                                {note.authorName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>by {note.authorName}</span>
                            <span>•</span>
                            <span>{note.createdAt.toLocaleDateString()}</span>
                          </div>
                        </CardHeader>
                        <CardContent>
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
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/dashboard/notes/${note.id}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="search">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Search Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search notes, authors, or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Filter by subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <FileIcon className="h-5 w-5 text-primary" />
                            <Badge variant="default">Public</Badge>
                          </div>
                        </div>
                        <CardTitle className="line-clamp-2">{note.title}</CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={note.authorName} />
                            <AvatarFallback>
                              {note.authorName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>by {note.authorName}</span>
                          {note.subject && (
                            <>
                              <span>•</span>
                              <span>{note.subject}</span>
                            </>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
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
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/notes/${note.id}`}>
                              View
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="browse">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Popular Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Tags</CardTitle>
                <CardDescription>
                  Click on a tag to explore related notes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 20)
                    .map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleTagClick(tag.name)}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag.name} ({tag.count})
                      </Badge>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Subjects */}
            <Card>
              <CardHeader>
                <CardTitle>Subjects</CardTitle>
                <CardDescription>
                  Browse notes by subject area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {subjects
                    .sort((a, b) => b.count - a.count)
                    .map((subject) => (
                      <Card
                        key={subject.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleSubjectClick(subject.name)}
                      >
                        <CardContent className="p-4 text-center">
                          <BookOpen className="h-8 w-8 mx-auto text-primary mb-2" />
                          <h3 className="font-medium">{subject.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {subject.count} notes
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
