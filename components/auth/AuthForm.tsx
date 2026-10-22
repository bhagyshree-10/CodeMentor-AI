'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signUp } from '@/lib/auth-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Code2 } from 'lucide-react';

export interface AuthFormProps {
  initialMode?: 'login' | 'signup';
}

export function AuthForm({ initialMode = 'login' }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get('callbackUrl') || '/app';
  // Safe redirect: ensure starts with single slash and not double slash (open redirect prevention)
  const safeCallbackUrl = rawCallbackUrl.startsWith('/') && !rawCallbackUrl.startsWith('//')
    ? rawCallbackUrl
    : '/app';

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (mode === 'signup' && !name.trim()) {
      errors.name = 'Full name is required';
    }
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    if (mode === 'signup') {
      if (!confirmPassword) {
        errors.confirmPassword = 'Confirm your password';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setGeneralError(null);
    try {
      const res = await signIn.social({
        provider: 'google',
        callbackURL: safeCallbackUrl,
      });
      if (res?.error) {
        setGeneralError(res.error.message || 'Google authentication failed. Please try again.');
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'Failed to initiate Google sign in.');
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMessage(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const res = await signUp.email({
          email: email.trim(),
          password,
          name: name.trim(),
          callbackURL: safeCallbackUrl,
        });

        if (res?.error) {
          const msg = res.error.message || 'Failed to create account.';
          if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exist')) {
            setGeneralError('An account with this email already exists. Try signing in instead.');
          } else {
            setGeneralError(msg);
          }
          setIsLoading(false);
          return;
        }

        setSuccessMessage('Account created successfully! Redirecting...');
        setTimeout(() => {
          router.push(safeCallbackUrl);
          router.refresh();
        }, 800);
      } else {
        const res = await signIn.email({
          email: email.trim(),
          password,
          callbackURL: safeCallbackUrl,
        });

        if (res?.error) {
          const msg = res.error.message || 'Invalid email or password.';
          if (msg.toLowerCase().includes('credential') || msg.toLowerCase().includes('invalid')) {
            setGeneralError('Invalid email or password. Please check your credentials.');
          } else {
            setGeneralError(msg);
          }
          setIsLoading(false);
          return;
        }

        router.push(safeCallbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'Network error occurred. Please check your connection.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-surface border border-border rounded-lg shadow-sm">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <Link href="/" className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-DEFAULT bg-accent-strong text-on-accent flex items-center justify-center font-mono text-sm">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-base text-text">CodeMentor AI</span>
        </Link>
        <h1 className="text-xl font-bold text-text">
          {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
        </h1>
        <p className="text-xs text-text-muted mt-1">
          {mode === 'login'
            ? 'Continue to your code learning studio'
            : 'Start understanding code, DSA hints, and patterns'}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex p-1 bg-surface-muted rounded-DEFAULT mb-5 border border-border">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setFieldErrors({});
            setGeneralError(null);
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
            mode === 'login'
              ? 'bg-surface text-accent-strong shadow-xs'
              : 'text-text-muted hover:text-text'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup');
            setFieldErrors({});
            setGeneralError(null);
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
            mode === 'signup'
              ? 'bg-surface text-accent-strong shadow-xs'
              : 'text-text-muted hover:text-text'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Google OAuth Button */}
      <Button
        type="button"
        variant="secondary"
        size="md"
        onClick={handleGoogleSignIn}
        isLoading={isGoogleLoading}
        disabled={isLoading || isGoogleLoading}
        className="w-full flex items-center justify-center gap-2 mb-4 bg-surface hover:bg-surface-hover border-border-control text-text font-medium"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </Button>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-border w-full" />
        <span className="bg-surface px-2 text-[11px] font-medium text-text-muted uppercase tracking-wider relative">
          or with email
        </span>
      </div>

      {/* Alert Banners */}
      {generalError && (
        <div
          role="alert"
          className="p-3 mb-4 rounded-DEFAULT bg-semantic-error/10 border border-semantic-error/30 text-semantic-error text-xs flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="p-3 mb-4 rounded-DEFAULT bg-semantic-success/10 border border-semantic-success/30 text-semantic-success text-xs flex items-start gap-2"
        >
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {mode === 'signup' && (
          <Input
            id="auth_name"
            label="Full Name"
            type="text"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: '' }));
            }}
            error={fieldErrors.name}
            disabled={isLoading || isGoogleLoading}
            autoComplete="name"
          />
        )}

        <Input
          id="auth_email"
          label="Email Address"
          type="email"
          placeholder="learner@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: '' }));
          }}
          error={fieldErrors.email}
          disabled={isLoading || isGoogleLoading}
          autoComplete="email"
        />

        <div className="relative">
          <Input
            id="auth_password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: '' }));
            }}
            error={fieldErrors.password}
            disabled={isLoading || isGoogleLoading}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-text-muted hover:text-text transition-colors focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {mode === 'signup' && (
          <div className="relative">
            <Input
              id="auth_confirm_password"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword)
                  setFieldErrors((p) => ({ ...p, confirmPassword: '' }));
              }}
              error={fieldErrors.confirmPassword}
              disabled={isLoading || isGoogleLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-8 text-text-muted hover:text-text transition-colors focus:outline-none"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          disabled={isLoading || isGoogleLoading}
          className="w-full mt-2"
        >
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </Button>
      </form>

      {/* Switch mode footer */}
      <div className="text-center text-xs text-text-muted mt-5">
        {mode === 'login' ? (
          <p>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setFieldErrors({});
                setGeneralError(null);
              }}
              className="text-accent-strong font-semibold hover:underline"
            >
              Sign up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setFieldErrors({});
                setGeneralError(null);
              }}
              className="text-accent-strong font-semibold hover:underline"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
