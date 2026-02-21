'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && token) router.push('/dashboard');
  }, [token, loading, router]);

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Gradient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold">T</div>
          <span className="text-xl font-bold tracking-tight">TaskFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">Sign In</Link>
          <Link href="/register" className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 rounded-lg font-medium transition-colors">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Full-Stack Web App with JWT Auth
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6 max-w-4xl">
          Manage Tasks with
          <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Zero Friction
          </span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          A production-ready task manager with secure JWT authentication, real-time CRUD,
          advanced filters, and a stunning dashboard — built for speed and scale.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/register" className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl font-semibold text-base transition-all transform hover:scale-105 shadow-lg shadow-violet-500/25">
            Create Free Account →
          </Link>
          <Link href="/login" className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-base transition-all">
            Sign In
          </Link>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-24 max-w-5xl w-full">
          {[
            { icon: '🔐', title: 'JWT Authentication', desc: 'Secure login & registration with bcrypt-hashed passwords and token-based sessions.' },
            { icon: '✅', title: 'CRUD Task Manager', desc: 'Create, edit, delete tasks with status & priority tracking. Search and filter in real-time.' },
            { icon: '👤', title: 'User Profiles', desc: 'Edit your profile inline. Persistent across sessions with backend synchronization.' },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-violet-500/30 transition-all hover:bg-white/[0.06] text-left group">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-12 mt-20">
          {[['100%', 'TypeScript'], ['JWT', 'Secure Auth'], ['MongoDB', 'Database'], ['REST', 'API']].map(([val, label]) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold text-white">{val}</div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-gray-600 text-sm border-t border-white/5">
        Built for the Frontend Developer Intern Assignment · TaskFlow © 2024
      </footer>
    </div>
  );
}
