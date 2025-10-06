'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Eye, 
  Heart, 
  Share2, 
  Download, 
  Edit, 
  Trash2,
  FileText,
  Image,
  File,
  Calendar,
  User,
  Tag,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Note } from '@/types';
import { getNote, updateNote, deleteNote } from '@/lib/database';
import { toast } from 'sonner';
import Link from 'next/link';
import { useState as useCopyState } from 'react';

export default function NoteViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchNote();
    }
  }, [id]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      const noteData = await getNote(id as string);
      if (noteData) {
        setNote(noteData);
        // Increment view count
        await updateNote(id as string, { 
          viewCount: noteData.viewCount + 1 
        });
        setNote(prev => prev ? { ...prev, viewCount: prev.viewCount + 1 } : null);
      } else {
        toast.error('Note not found');
        router.push('/dashboard/notes');
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      toast.error('Failed to load note');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!note) return;
    
    try {
      const newLikeCount = liked ? note.likeCount - 1 : note.likeCount + 1;
      await updateNote(note.id, { likeCount: newLikeCount });
      setNote(prev => prev ? { ...prev, likeCount: newLikeCount } : null);
      setLiked(!liked);
      toast.success(liked ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteNote(note.id);
      toast.success('Note deleted successfully');
      router.push('/dashboard/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/dashboard/notes/${note?.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Failed to copy link');
    }
  };

  const handleDownload = () => {
    if (!note?.fileUrl) return;
    
    const link = document.createElement('a');
    link.href = note.fileUrl;
    link.download = note.fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Note not found</h2>
        <p className="text-muted-foreground mb-4">
          The note you're looking for doesn't exist or has been deleted.
        </p>
        <Button asChild>
          <Link href="/dashboard/notes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Notes
          </Link>
        </Button>
      </div>
    );
  }

  const FileIcon = getFileIcon(note.type);
  const isOwner = user?.id === note.authorId;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleShare}>
              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Share'}
            </Button>
            {note.fileUrl && (
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4" />
                Download
              </Button>
            )}
            {isOwner && (
              <>
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/notes/${note.id}/edit`}>
                    <Edit className="h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Note Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <FileIcon className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl">{note.title}</CardTitle>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={note.authorName} />
                        <AvatarFallback>
                          {note.authorName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        by {note.authorName}
                      </span>
                    </div>
                    {note.subject && (
                      <Badge variant="outline">{note.subject}</Badge>
                    )}
                    <Badge variant={note.isPublic ? 'default' : 'secondary'}>
                      {note.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* File Info */}
            {note.fileUrl && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileIcon className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-medium">{note.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {note.type.toUpperCase()} • {note.fileSize ? formatFileSize(note.fileSize) : 'Unknown size'}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}

            {/* Tags */}
            {note.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center space-x-1">
                      <Tag className="h-3 w-3" />
                      <span>{tag}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Content */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Content</h3>
              {note.type === 'markdown' ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap font-sans">{note.content}</pre>
                </div>
              ) : note.type === 'image' && note.fileUrl ? (
                <div className="text-center">
                  <img 
                    src={note.fileUrl} 
                    alt={note.title}
                    className="max-w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              ) : note.type === 'pdf' && note.fileUrl ? (
                <div className="text-center py-8">
                  <File className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    PDF files are not displayed inline. Click download to view.
                  </p>
                  <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Content preview not available for this file type.
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Stats and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {note.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{note.viewCount} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>{note.likeCount} likes</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={liked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {liked ? 'Liked' : 'Like'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
