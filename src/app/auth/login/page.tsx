'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Chrome } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success('Successfully signed in!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to sign in. Please try again.');
      console.error('Sign in error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to OpenNote</CardTitle>
            <CardDescription>
              Sign in to access your academic notes and collaborate with other students.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleSignIn}
              className="w-full"
              size="lg"
              disabled={loading}
            >
              <Chrome className="mr-2 h-5 w-5" />
              Continue with Google
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              By signing in, you agree to our{' '}
              <a href="/terms" className="underline hover:text-foreground">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account? Just sign in with Google to get started!
          </p>
        </div>
      </motion.div>
    </div>
  );
}
