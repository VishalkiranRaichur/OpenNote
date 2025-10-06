'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BookOpen, 
  Search, 
  Share2, 
  Users, 
  Zap, 
  Shield,
  ArrowRight,
  Star,
  TrendingUp,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: "Organize Notes",
      description: "Upload and organize your academic notes with smart tagging and categorization."
    },
    {
      icon: Search,
      title: "Smart Search",
      description: "Find exactly what you're looking for with powerful search across content, tags, and authors."
    },
    {
      icon: Share2,
      title: "Easy Sharing",
      description: "Share your notes with classmates or make them public for the community to benefit."
    },
    {
      icon: Users,
      title: "Collaborative Learning",
      description: "Discover notes from other students and contribute to the collective knowledge."
    },
    {
      icon: Zap,
      title: "AI-Powered",
      description: "Get summaries, flashcards, and insights powered by AI to enhance your learning."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your notes are secure with Firebase authentication and granular privacy controls."
    }
  ];

  const stats = [
    { icon: BookOpen, value: "10K+", label: "Notes Shared" },
    { icon: Users, value: "5K+", label: "Active Students" },
    { icon: Star, value: "4.9", label: "User Rating" },
    { icon: TrendingUp, value: "95%", label: "Success Rate" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            OpenNote
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            The modern platform for students to upload, organize, and share academic notes in a distraction-free environment.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {user ? (
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/auth/login">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              View Public Notes
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
        </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Everything you need for academic success</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            OpenNote provides all the tools you need to organize, share, and discover academic content.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 rounded-2xl p-12"
        >
          <h2 className="text-4xl font-bold mb-4">Ready to transform your note-taking?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already using OpenNote to organize and share their academic knowledge.
          </p>
          {!user && (
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/auth/login">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">OpenNote</span>
              </div>
              <p className="text-muted-foreground">
                The modern platform for academic note-sharing and collaboration.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/security" className="hover:text-foreground">Security</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="/support" className="hover:text-foreground">Support</Link></li>
                <li><Link href="/discord" className="hover:text-foreground">Discord</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
                <li><Link href="/cookies" className="hover:text-foreground">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 OpenNote. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
