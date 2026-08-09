import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff, Sparkles, CheckSquare, X, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  defaultTab?: 'login' | 'register';
  onLogin: (credentials: { email: string; password: string }) => Promise<any>;
  onRegister: (data: { name: string; email: string; password: string }) => Promise<any>;
  onContinueAsGuest: () => Promise<any>;
  isLoading?: boolean;
}

export function AuthModal({
  isOpen,
  onClose,
  defaultTab = 'login',
  onLogin,
  onRegister,
  onContinueAsGuest,
  isLoading = false,
}: AuthModalProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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
      if (onClose) onClose();
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
      if (onClose) onClose();
    } catch (err: any) {
      setFormError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-8"
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 p-6 text-white text-center relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close modal"
              id="auth-modal-close-btn"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckSquare className="w-7 h-7 stroke-[2.5] text-white" />
          </div>

          <h3 className="text-xl font-bold tracking-tight">TaskFlow Workspace</h3>
          <p className="text-xs text-indigo-100 mt-1">
            Access your tasks, sync email notifications, and organize your daily workflow.
          </p>

          {/* Navigation Tabs (Login / Register) */}
          <div className="mt-5 p-1 bg-black/20 backdrop-blur-md rounded-2xl grid grid-cols-2 gap-1 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setFormError(null);
              }}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              id="auth-tab-login-btn"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setFormError(null);
              }}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              id="auth-tab-register-btn"
            >
              Register
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <div className="p-6">
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.form
                key="login-form"
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
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      id="login-email-input"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      id="login-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      id="login-password-toggle-btn"
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
                  id="login-submit-btn"
                >
                  Sign In to Account
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleRegisterSubmit}
                className="space-y-3.5"
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
                      className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      id="register-name-input"
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
                      className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      id="register-email-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Create Password
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
                      className="w-full pl-10 pr-10 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      id="register-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      id="register-password-toggle-btn"
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
                      className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      id="register-confirm-password-input"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting || isLoading}
                  className="w-full py-2.5 mt-2"
                  id="register-submit-btn"
                >
                  Create New Account
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <span className="relative z-10 px-3 bg-white dark:bg-zinc-900 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Or Instant Demo
            </span>
          </div>

          {/* Guest Button */}
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={async () => {
              setIsSubmitting(true);
              try {
                await onContinueAsGuest();
                if (onClose) onClose();
              } finally {
                setIsSubmitting(false);
              }
            }}
            isLoading={isSubmitting || isLoading}
            rightIcon={<ArrowRight className="w-4 h-4 text-zinc-400" />}
            className="w-full py-2.5"
            id="auth-guest-mode-btn"
          >
            Continue as Guest Demo
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
