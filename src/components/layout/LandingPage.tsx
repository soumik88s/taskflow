import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckSquare,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

interface LandingPageProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<any>;
  onRegister: (data: { name: string; email: string; password: string }) => Promise<any>;
  onContinueAsGuest: () => Promise<any>;
  isLoading?: boolean;
}

export function LandingPage({
  onLogin,
  onRegister,
  onContinueAsGuest,
  isLoading = false,
}: LandingPageProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!loginEmail.trim() || !loginPassword) {
      setFormError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onLogin({ email: loginEmail.trim(), password: loginPassword });
      showToast('Welcome back! Signed in successfully.', 'success');
    } catch (err: any) {
      setFormError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!regName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (regPassword.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onRegister({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
      });
      showToast('Account created successfully! Welcome to TaskFlow.', 'success');
    } catch (err: any) {
      setFormError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background ambient light effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <CheckSquare className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold tracking-tight">TaskFlow</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveTab('login');
              setFormError(null);
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'login'
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
            id="landing-header-signin-btn"
          >
            Sign In
          </button>

          <button
            onClick={() => {
              setActiveTab('register');
              setFormError(null);
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'register'
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
            id="landing-header-register-btn"
          >
            Register
          </button>

          <Button
            onClick={onContinueAsGuest}
            variant="outline"
            size="sm"
            isLoading={isLoading || isSubmitting}
            id="landing-header-guest-btn"
          >
            Guest Demo
          </Button>
        </div>
      </header>

      {/* Main Hero & Auth Container */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Hero Copy */}
        <div className="lg:col-span-7 text-left space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Full Stack SaaS Task Management System</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.1]"
          >
            Organize work.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600">
              Achieve more.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg font-normal text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed"
          >
            A modern, lightning-fast task workspace with real-time stats, priority sorting, JWT authentication, and automated email reminders.
          </motion.p>

          {/* Value props list */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-3 pt-2"
          >
            <div className="flex items-center gap-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Full account registration with password hashing & user data isolation</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Automated task reminder scheduler running on Express/NestJS backend</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>One-click Guest Mode for instant evaluation without registration</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Tabbed Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl p-6 sm:p-7 relative overflow-hidden"
        >
          {/* Header Tab Switcher */}
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-5">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {activeTab === 'login' ? 'Sign In to Workspace' : 'Create New Account'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {activeTab === 'login'
                  ? 'Enter your credentials to access your task dashboard.'
                  : 'Register for full task isolation and reminder notifications.'}
              </p>
            </div>
          </div>

          {/* Tab Navigation Pill Bar */}
          <div className="p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl grid grid-cols-2 gap-1 mb-5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setFormError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
              id="landing-tab-login-btn"
            >
              Login Tab
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setFormError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
              id="landing-tab-register-btn"
            >
              Register Tab
            </button>
          </div>

          {/* Form Error Banner */}
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Forms switcher with animation */}
          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.form
                key="landing-login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="alex@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      id="landing-login-email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      id="landing-login-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      id="landing-login-toggle-pw"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting || isLoading}
                  className="w-full py-2.5 mt-2"
                  id="landing-login-submit-btn"
                >
                  Sign In
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="landing-register-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleRegisterSubmit}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Alex Morgan"
                      required
                      className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      id="landing-reg-name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="alex@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      id="landing-reg-email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      id="landing-reg-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      id="landing-reg-toggle-pw"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      id="landing-reg-confirm"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting || isLoading}
                  className="w-full py-2.5 mt-2"
                  id="landing-reg-submit-btn"
                >
                  Create Account
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <span className="relative z-10 px-3 bg-white dark:bg-zinc-900 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Or Try Instantly
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onContinueAsGuest}
            isLoading={isSubmitting || isLoading}
            rightIcon={<ArrowRight className="w-4 h-4 text-zinc-400" />}
            className="w-full py-2"
            id="landing-guest-cta-btn"
          >
            Continue as Guest Demo
          </Button>
        </motion.div>
      </main>

      {/* Feature Highlights Footer Bar */}
      <footer className="relative z-10 py-6 border-t border-zinc-200/80 dark:border-zinc-800 text-center text-xs text-zinc-400">
        TaskFlow Full Stack Task Management System • Built with React, Express REST API, JWT Auth, and Tailwind CSS
      </footer>
    </div>
  );
}
