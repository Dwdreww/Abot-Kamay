import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  User as UserIcon,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  Users,
  Accessibility,
  MapPin,
  Phone,
  Info,
  ArrowRight,
  UserPlus,
  Calendar,
  ChevronDown,
} from 'lucide-react';

import { auth, db } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { useAuth } from '../App';
import { User, UserRole } from '../types';

export default function AuthPage({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
    gender: '',
    birthdate: '',
    contactNumber: '',
    address: '',
    role: 'member' as UserRole,
  });

  const resetError = () => setError(null);

  const validateRegisterStepOne = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) {
      setError('Pakikumpleto ang lahat ng field.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Hindi magkatugma ang passwords.');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Ang password ay dapat hindi bababa sa 6 na karakter.');
      return false;
    }

    return true;
  };

  const validateRegisterStepTwo = () => {
    if (
      !formData.age.trim() ||
      !formData.gender.trim() ||
      !formData.birthdate.trim() ||
      !formData.contactNumber.trim() ||
      !formData.address.trim()
    ) {
      setError('Pakikumpleto ang lahat ng field sa Hakbang 2.');
      return false;
    }

    return true;
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    resetError();

    if (!validateRegisterStepOne()) return;

    setStep(2);
  };

  const handleModeToggle = () => {
    const nextMode = mode === 'login' ? 'register' : 'login';

    setMode(nextMode);
    setStep(1);
    setError(null);
    setShowPassword(false);

    if (nextMode === 'register') {
      setFormData((prev) => ({
        ...prev,
        role: 'member',
        password: '',
        confirmPassword: '',
      }));
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    if (mode === 'register' && role !== 'member') {
      setError('Admin at staff accounts ay dapat gawin lamang ng system administrator.');
      return;
    }

    setError(null);
    setFormData((prev) => ({
      ...prev,
      role,
    }));
  };

  const handleLogin = async () => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );

    const userRef = doc(db, 'users', userCredential.user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await firebaseSignOut(auth);
      setError('Hindi nahanap ang user records. Makipag-ugnayan sa administrator.');
      return;
    }

    const userData = {
      uid: userCredential.user.uid,
      ...userSnap.data(),
    } as User;

    if (userData.role !== formData.role) {
      await firebaseSignOut(auth);
      setError(`Ang account na ito ay nakarehistro bilang ${userData.role}. Piliin ang tamang portal access.`);
      return;
    }

    if (userData.status === 'deactivated') {
      await firebaseSignOut(auth);
      setError('Ang account na ito ay naka-deactivate. Makipag-ugnayan sa administrator.');
      return;
    }

    signIn(userData);
  };

  const handleRegister = async () => {
    if (formData.role !== 'member') {
      setError('Admin at staff accounts ay dapat gawin lamang ng system administrator.');
      return;
    }

    if (!validateRegisterStepOne()) return;
    if (!validateRegisterStepTwo()) return;

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );

    const newUser = {
      uid: userCredential.user.uid,
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: 'member' as UserRole,
      age: formData.age.trim(),
      gender: formData.gender,
      birthdate: formData.birthdate,
      contactNumber: formData.contactNumber.trim(),
      address: formData.address.trim(),
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    } as User;

    await setDoc(doc(db, 'users', userCredential.user.uid), newUser);

    signIn({
      ...newUser,
      uid: userCredential.user.uid,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'register' && step === 1) {
      resetError();
      if (!validateRegisterStepOne()) return;
      setStep(2);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await handleLogin();
      } else {
        await handleRegister();
      }
    } catch (err: any) {
      console.error(err);

      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login ay hindi pa naka-enable sa Firebase.');
      } else if (err.code === 'auth/weak-password') {
        setError('Masyadong mahina ang password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Ang email na ito ay rehistrado na.');
      } else if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        setError('Mali ang email o password.');
      } else {
        setError(err.message || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white">
      <div className="hidden lg:flex w-[45%] bg-blue-900 text-white p-16 flex-col justify-between relative overflow-hidden shrink-0">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-blue-800/30 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[20%] left-[-10%] w-[50%] h-[50%] bg-blue-950/40 blur-[100px] rounded-full rotate-12"></div>
          <div className="absolute top-[20%] right-[10%] w-32 h-32 border-4 border-white/5 rotate-45 rounded-lg"></div>
          <div className="absolute bottom-[30%] left-[15%] w-24 h-24 bg-blue-700/10 blur-xl rounded-full"></div>

          <div className="absolute top-1/2 right-12 grid grid-cols-4 gap-2 opacity-10">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 bg-white rounded-full"></div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-16 text-white/80 hover:text-white transition-colors text-sm font-bold w-fit group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Bumalik sa Home Page
          </button>

          <div className="mb-20 space-y-10">
            <img
              src="/logoAbotKamay.png"
              alt="Abot-Kamay Logo"
              className="h-16 w-auto mb-8 rounded-2xl"
            />

            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl font-black leading-[1.05] tracking-tight"
              >
                Suportang <br />Abot-Kamay, <br />
                <span className="text-blue-200">Para Sayo.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg font-medium opacity-80 max-w-sm"
              >
                Nagpapalakas sa mga Taong may Kapansanan at sabay na bumubuo ng isang komunidad na walang iniiwan.
              </motion.p>
            </div>

            <div className="flex items-start gap-4 pt-4">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-white">
                  Brgy. San Antonio de Padua I,
                </p>
                <p className="text-sm font-medium opacity-70">Dasmariñas, Cavite</p>
              </div>
            </div>
          </div>

          <div className="mt-auto relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="rounded-[3rem] overflow-hidden border-8 border-white/10 shadow-2xl"
            >
              <img
                src="/random_portal.png"
                alt="Assistance"
                className="w-full h-[320px] object-cover"
              />
            </motion.div>
            <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-blue-500 rounded-full blur-2xl opacity-40"></div>
          </div>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center p-8 md:p-20 bg-slate-50/50">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[540px] bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] p-12 border border-slate-100"
        >
          <div className="text-center mb-12">
            <img
              src="/sadplogo.png"
              alt="Logo"
              className="h-16 w-auto mx-auto mb-6 rounded-2xl"
            />
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
              {mode === 'login' ? 'Portal Login' : 'Gumawa ng Account'}
            </h2>
            <p className="text-sm font-medium text-slate-500">
              {mode === 'login'
                ? 'Piliin ang uri ng inyong portal access para magpatuloy.'
                : 'PWD Member registration lamang ang pinapayagan dito.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                Piliin ang inyong portal access
              </label>

              <div className="grid grid-cols-3 gap-4">
                <RoleButton
                  active={formData.role === 'admin'}
                  disabled={mode === 'register'}
                  onClick={() => handleRoleSelect('admin')}
                  icon={<Shield className="w-5 h-5" />}
                  label="Admin"
                />

                <RoleButton
                  active={formData.role === 'staff'}
                  disabled={mode === 'register'}
                  onClick={() => handleRoleSelect('staff')}
                  icon={<Users className="w-5 h-5" />}
                  label="Brgy Staff"
                />

                <RoleButton
                  active={formData.role === 'member'}
                  onClick={() => handleRoleSelect('member')}
                  icon={<Accessibility className="w-5 h-5" />}
                  label="PWD Member"
                />
              </div>

              {mode === 'register' && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  Admin at staff accounts ay ginagawa lamang ng system administrator.
                </p>
              )}
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3"
                >
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-6">
              {mode === 'register' ? (
                <div className="space-y-6">
                  <div className="flex justify-center gap-2 mb-4">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-blue-600' : 'w-4 bg-blue-100'
                        }`}
                    ></div>
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-blue-600' : 'w-4 bg-blue-100'
                        }`}
                    ></div>
                  </div>

                  <AnimatePresence mode="wait">
                    {step === 1 ? (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                      >
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 pl-1">
                            Buong Pangalan
                          </label>
                          <div className="relative group">
                            <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                            <input
                              type="text"
                              required
                              className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900"
                              placeholder="Ilagay ang inyong buong pangalan"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 pl-1">
                            Email Address
                          </label>
                          <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                            <input
                              type="email"
                              required
                              className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900"
                              placeholder="Ilagay ang inyong email"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 pl-1">
                              Password
                            </label>
                            <div className="relative group">
                              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                              <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="w-full pl-14 pr-14 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) =>
                                  setFormData({ ...formData, password: e.target.value })
                                }
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-5 h-5" />
                                ) : (
                                  <Eye className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 pl-1">
                              I-confirm ang Password
                            </label>
                            <div className="relative group">
                              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                              <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="w-full pl-14 pr-14 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    confirmPassword: e.target.value,
                                  })
                                }
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-5 h-5" />
                                ) : (
                                  <Eye className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 pl-1">
                              Araw ng Kapanganakan
                            </label>
                            <div className="relative group">
                              <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                              <input
                                type="date"
                                required
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900"
                                value={formData.birthdate}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    birthdate: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 pl-1">
                              Edad
                            </label>
                            <div className="relative group">
                              <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                              <input
                                type="number"
                                required
                                min="1"
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900"
                                placeholder="Edad"
                                value={formData.age}
                                onChange={(e) =>
                                  setFormData({ ...formData, age: e.target.value })
                                }
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 pl-1">
                              Numero ng Telepono
                            </label>
                            <div className="relative group">
                              <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                              <input
                                type="tel"
                                required
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900"
                                placeholder="+63 9XX XXX XXXX"
                                value={formData.contactNumber}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    contactNumber: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 pl-1">
                              Kasarian
                            </label>
                            <div className="relative group">
                              <Accessibility className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                              <select
                                required
                                className="w-full pl-14 pr-10 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900 appearance-none"
                                value={formData.gender}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    gender: e.target.value,
                                  })
                                }
                              >
                                <option value="">Pumili</option>
                                <option value="Male">Lalaki</option>
                                <option value="Female">Babae</option>
                                <option value="Other">Iba pa</option>
                              </select>
                              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 pl-1">
                            Kumpletong Address
                          </label>
                          <div className="relative group">
                            <MapPin className="absolute left-5 top-5 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                            <textarea
                              required
                              rows={3}
                              className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900 text-sm"
                              placeholder="Ilagay ang inyong kumpletong address"
                              value={formData.address}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  address: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 pl-1">
                      Email / Username
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type="email"
                        required
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900"
                        placeholder="Ilagay ang email o username"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-bold text-slate-600">
                        Password
                      </label>
                      <button
                        type="button"
                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                      >
                        Nakalimutan ang password?
                      </button>
                    </div>

                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="w-full pl-14 pr-14 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900"
                        placeholder="Ilagay ang password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4">
              {mode === 'register' && step === 1 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-500 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group text-sm uppercase tracking-[0.1em]"
                >
                  <span>Susunod na Hakbang</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              ) : (
                <button
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-500 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group text-sm uppercase tracking-[0.1em] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>
                        {mode === 'login' ? 'Mag-Login' : 'Gumawa ng Account'}
                      </span>
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={handleModeToggle}
                className="w-full bg-white text-blue-600 border-2 border-blue-600/30 font-black py-5 rounded-2xl hover:bg-blue-50 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-sm uppercase tracking-[0.1em]"
              >
                {mode === 'login' ? (
                  <UserPlus className="w-5 h-5" />
                ) : (
                  <Users className="w-5 h-5" />
                )}
                {mode === 'login' ? 'Gumawa ng Account' : 'Bumalik sa Login'}
              </button>

              {mode === 'register' && step === 2 && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep(1);
                  }}
                  className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors"
                >
                  Bumalik sa Hakbang 1
                </button>
              )}
            </div>
          </form>

          <div className="mt-12 p-6 bg-blue-50 rounded-[2rem] flex items-start gap-4 border border-blue-100">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-white" />
            </div>
            <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest leading-relaxed pt-1">
              Ang inyong portal access type ay magtatakda ng inyong features.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function RoleButton({
  active,
  onClick,
  icon,
  label,
  disabled = false,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-3
        ${active
          ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-lg shadow-blue-500/10'
          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed hover:bg-white hover:border-slate-100' : ''}
      `}
    >
      <div
        className={`p-2 rounded-lg ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
          }`}
      >
        {icon}
      </div>
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}