# OpenNote - Student Platform

A modern, clean, and distraction-free platform for students to upload, organize, and share academic notes. Built with Next.js, TypeScript, TailwindCSS, and Firebase.

![OpenNote Platform](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Firebase](https://img.shields.io/badge/Firebase-10.0-orange?style=for-the-badge&logo=firebase)

## ✨ Features

### 🔐 Authentication & User Management
- **Google OAuth Integration** - Seamless sign-in with Google accounts
- **User Profiles** - Personal dashboards with user statistics
- **Secure Authentication** - Firebase Auth with proper session management

### 📝 Note Management
- **Multiple File Types** - Support for Markdown, PDF, and Image uploads
- **Rich Text Editor** - Built-in Markdown editor for text notes
- **File Upload** - Drag-and-drop file upload with progress tracking
- **Note Organization** - Personal dashboard for managing all notes

### 🏷️ Organization & Discovery
- **Smart Tagging System** - Tag notes by subject, topic, or custom tags
- **Subject Categories** - Pre-defined academic subjects (Math, Science, etc.)
- **Advanced Search** - Search by title, content, author, tags, or subjects
- **Filtering Options** - Filter by subject, tags, date, or popularity

### 🌐 Sharing & Collaboration
- **Public/Private Notes** - Control visibility of your notes
- **Share Links** - Generate shareable links for notes
- **Community Discovery** - Browse and discover notes from other students
- **Like System** - Like and bookmark favorite notes

### 🎨 Modern UI/UX
- **Responsive Design** - Mobile-first, works on all devices
- **Dark/Light Mode** - Toggle between themes with system preference detection
- **Smooth Animations** - Framer Motion animations for better UX
- **Clean Interface** - Minimalist design inspired by Notion and Google Docs

### 🔍 Advanced Features
- **Smart Search** - Full-text search across all content
- **Trending Notes** - Discover popular and trending content
- **Statistics Dashboard** - View engagement metrics and analytics
- **Recent Activity** - Track your recent notes and activity

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project
- Google Cloud Console project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/opennote-platform.git
   cd opennote-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication → Google Sign-in
   - Enable Firestore Database
   - Enable Storage
   - Get your project configuration

4. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
opennote-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable components
│   │   ├── ui/               # ShadCN UI components
│   │   ├── Navigation.tsx    # Main navigation
│   │   └── Sidebar.tsx        # Dashboard sidebar
│   ├── contexts/             # React contexts
│   │   ├── AuthContext.tsx   # Authentication context
│   │   └── ThemeContext.tsx  # Theme management
│   ├── lib/                  # Utility functions
│   │   ├── firebase.ts       # Firebase configuration
│   │   ├── database.ts       # Database operations
│   │   └── utils.ts          # Utility functions
│   └── types/                # TypeScript types
│       └── index.ts          # Type definitions
├── public/                   # Static assets
├── components.json           # ShadCN UI configuration
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── package.json            # Dependencies
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **ShadCN UI** - Beautiful, accessible components
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

### Backend & Database
- **Firebase Authentication** - User management
- **Firestore** - NoSQL database for notes and users
- **Firebase Storage** - File storage for PDFs and images
- **Google OAuth** - Authentication provider

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🎯 Core Features Implementation

### Authentication Flow
```typescript
// User authentication with Google OAuth
const { user, signInWithGoogle, logout } = useAuth();

// Automatic user creation in Firestore
const createUser = async (userData: Omit<User, 'id'>) => {
  const docRef = await addDoc(usersCollection, {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};
```

### Note Management
```typescript
// Create a new note
const createNote = async (noteData: Omit<Note, 'id'>) => {
  const docRef = await addDoc(notesCollection, {
    ...noteData,
    viewCount: 0,
    likeCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};
```

### File Upload
```typescript
// Upload files to Firebase Storage
const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically on every push

3. **Configure Firebase**
   - Add your Vercel domain to Firebase authorized domains
   - Update Firebase security rules for production

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Firebase Security Rules

```javascript
// Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Notes are readable by all, writable by owner
    match /notes/{noteId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (request.auth.uid == resource.data.authorId || 
         request.auth.uid == request.resource.data.authorId);
    }
  }
}
```

### Storage Rules

```javascript
// Firebase Storage rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /notes/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📱 Mobile Support

The platform is fully responsive and mobile-first:
- **Touch-friendly interface** - Optimized for mobile devices
- **Responsive navigation** - Collapsible sidebar on mobile
- **Mobile-optimized forms** - Easy input on small screens
- **Progressive Web App** - Can be installed on mobile devices

## 🔒 Security Features

- **Authentication required** - All routes protected
- **User data isolation** - Users can only access their own data
- **File upload validation** - Type and size restrictions
- **XSS protection** - Sanitized content rendering
- **CSRF protection** - Built-in Next.js security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **TailwindCSS** - For the utility-first CSS framework
- **ShadCN UI** - For the beautiful component library
- **Firebase** - For the backend infrastructure
- **Framer Motion** - For smooth animations

## 📞 Support

If you have any questions or need help:

- 📧 Email: support@opennote.dev
- 💬 Discord: [Join our community](https://discord.gg/opennote)
- 📖 Documentation: [docs.opennote.dev](https://docs.opennote.dev)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/opennote-platform/issues)

---

**Built with ❤️ for students, by students**