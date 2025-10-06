'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  X, 
  Plus,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';
import { createNote, uploadFile, updateTagCount, updateSubjectCount } from '@/lib/database';
import { Note } from '@/types';
import { toast } from 'sonner';

export default function CreateNotePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [noteType, setNoteType] = useState<'markdown' | 'pdf' | 'image'>('markdown');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const commonSubjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'Literature', 'History', 'Geography', 'Economics', 'Psychology',
    'Engineering', 'Medicine', 'Law', 'Business', 'Art', 'Music'
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes: Record<string, string[]> = {
        pdf: ['application/pdf'],
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        markdown: ['text/markdown', 'text/plain']
      };
      
      const fileType = noteType;
      if (allowedTypes[fileType]?.includes(selectedFile.type)) {
        setFile(selectedFile);
        if (!title) {
          setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
        }
      } else {
        toast.error(`Please select a valid ${fileType.toUpperCase()} file`);
      }
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create notes');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (noteType === 'markdown' && !content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    if (noteType !== 'markdown' && !file) {
      toast.error('Please upload a file');
      return;
    }

    try {
      setLoading(true);

      let fileUrl = '';
      let fileName = '';
      let fileSize = 0;

      // Upload file if needed
      if (file) {
        const filePath = `notes/${user.id}/${Date.now()}-${file.name}`;
        fileUrl = await uploadFile(file, filePath);
        fileName = file.name;
        fileSize = file.size;
      }

      // Create note
      const noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount'> = {
        title: title.trim(),
        content: content.trim(),
        type: noteType,
        tags,
        subject: subject.trim(),
        isPublic,
        authorId: user.id,
        authorName: user.displayName,
        authorEmail: user.email,
        fileUrl: fileUrl || undefined,
        fileName: fileName || undefined,
        fileSize: fileSize || undefined,
      };

      const noteId = await createNote(noteData);

      // Update tag and subject counts
      for (const tag of tags) {
        await updateTagCount(tag, 1);
      }
      if (subject) {
        await updateSubjectCount(subject, 1);
      }

      toast.success('Note created successfully!');
      router.push(`/dashboard/notes/${noteId}`);
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold mb-2">Create New Note</h1>
        <p className="text-muted-foreground">
          Share your knowledge with the community or keep it private for yourself.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Tabs value={noteType} onValueChange={(value) => setNoteType(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="markdown" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Markdown</span>
            </TabsTrigger>
            <TabsTrigger value="pdf" className="flex items-center space-x-2">
              <File className="h-4 w-4" />
              <span>PDF</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center space-x-2">
              <Image className="h-4 w-4" />
              <span>Image</span>
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Provide the essential details for your note
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter note title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonSubjects.map((subj) => (
                        <SelectItem key={subj} value={subj}>
                          {subj}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="public" className="flex items-center space-x-2">
                    {isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    <span>Make this note public</span>
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <TabsContent value="markdown">
              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                  <CardDescription>
                    Write your note in Markdown format
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing your note..."
                    className="min-h-96"
                    required
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pdf">
              <Card>
                <CardHeader>
                  <CardTitle>Upload PDF</CardTitle>
                  <CardDescription>
                    Upload a PDF file to share with others
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <div className="space-y-2">
                      <Label htmlFor="pdf-upload" className="cursor-pointer">
                        <Button variant="outline" asChild>
                          <span>Choose PDF File</span>
                        </Button>
                      </Label>
                      <input
                        id="pdf-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        {file ? file.name : 'No file selected'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="image">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Image</CardTitle>
                  <CardDescription>
                    Upload an image to share with others
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <div className="space-y-2">
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <Button variant="outline" asChild>
                          <span>Choose Image File</span>
                        </Button>
                      </Label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        {file ? file.name : 'No file selected'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Note
                  </>
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </motion.div>
    </div>
  );
}
