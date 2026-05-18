import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { User, UserRole } from './types';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (user: User) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'auth' | 'dashboard'>('landing');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
            setView('dashboard');
          } else {
            setUser(null);
            setView('auth');
          }
        } else {
          setUser(null);
          if (view === 'dashboard') setView('landing');
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setUser(null);
        setView('landing');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [view]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200 border-t-blue-600 shadow-sm"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse font-sans">Initializing Terminal</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn: setUser, signOut: () => setView('landing') }}>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
        {view === 'landing' && <LandingPage onStart={() => setView('auth')} onCheckStatus={() => setView('auth')} />}
        {view === 'auth' && <AuthPage onBack={() => setView('landing')} />}
        {view === 'dashboard' && <Dashboard />}
      </div>
    </AuthContext.Provider>
  );
}
