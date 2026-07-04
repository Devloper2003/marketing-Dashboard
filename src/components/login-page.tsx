'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface LoginPageProps {
  onLogin: (user: { email: string; name: string; role: string }) => void;
}

/* ─── Floating gold particles ─────────────────────────────────── */
function GoldParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 1,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 12 + 8,
        delay: Math.random() * 6,
        opacity: Math.random() * 0.4 + 0.1,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background:
              p.size > 3
                ? 'radial-gradient(circle, rgba(212,168,67,0.6), transparent)'
                : 'rgba(212,168,67,0.5)',
            boxShadow:
              p.size > 3 ? '0 0 6px rgba(212,168,67,0.3)' : 'none',
          }}
          animate={{
            y: [0, -30, 10, -20, 0],
            x: [0, 10, -5, 15, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity * 0.7, p.opacity * 1.2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Left brand panel (desktop only) ─────────────────────────── */
function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] relative flex-col items-center justify-center p-12 border-r border-[rgba(212,168,67,0.12)]">
      {/* Decorative corner accents */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-[rgba(212,168,67,0.3)]" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-[rgba(212,168,67,0.3)]" />

      {/* Radial glow behind gem */}
      <div className="absolute w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(212,168,67,0.1)_0%,transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative mb-8"
      >
        <div className="w-52 h-auto mx-auto">
          <img
            src="/logos/laxree-logo.png"
            alt="Laxree"
            className="w-full h-auto object-contain drop-shadow-[0_0_30px_rgba(212,168,67,0.15)]"
          />
        </div>
        {/* Decorative rings */}
        <motion.div
          className="absolute -inset-4 rounded-[2rem] border border-[rgba(212,168,67,0.15)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute -inset-8 rounded-[2.5rem] border border-dashed border-[rgba(212,168,67,0.08)]"
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-24 h-px gold-gradient mb-4"
      />

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-muted-foreground text-sm tracking-[0.15em] uppercase text-center"
      >
        Marketing Analytics Suite
      </motion.p>

      {/* Bottom decorative text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute bottom-12 text-center"
      >
        <p className="text-xs text-[rgba(212,168,67,0.3)] tracking-[0.3em] uppercase">
          Admin Dashboard
        </p>
      </motion.div>
    </div>
  );
}

/* ─── Main Login Page Component ───────────────────────────────── */
export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Invalid credentials. Please try again.');
        }

        const data = await res.json();
        onLogin(data.user);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [email, password, onLogin],
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]" />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex relative overflow-hidden">
      {/* Animated radial gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(212,168,67,0.06)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(212,168,67,0.03)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(212,168,67,0.04)_0%,transparent_40%)]" />
      </div>

      <GoldParticles />

      {/* Left panel – brand showcase (desktop) */}
      <BrandPanel />

      {/* Right panel – login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Mobile brand header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:hidden flex flex-col items-center mb-10"
          >
            <div className="w-32 h-auto mx-auto mb-4">
              <img
                src="/logos/laxree-logo.png"
                alt="Laxree"
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="w-16 h-px gold-gradient mt-3 mb-2" />
          </motion.div>

          {/* Form card */}
          <div className="bg-[#111] rounded-2xl border border-[rgba(212,168,67,0.15)] shadow-[0_0_40px_rgba(212,168,67,0.05)] p-8 sm:p-10">
            {/* Desktop-only heading */}
            <div className="hidden lg:block mb-8">
              <motion.h2
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-2xl font-semibold text-foreground mb-2"
              >
                Welcome back
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-muted-foreground text-sm"
              >
                Sign in to your Laxree dashboard
              </motion.p>
            </div>

            {/* Mobile heading */}
            <div className="lg:hidden mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-1">
                Sign in
              </h2>
              <p className="text-muted-foreground text-sm">
                Access your marketing dashboard
              </p>
            </div>

            {/* Error message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-lg px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email field */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-sm text-muted-foreground">
                  Email address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(212,168,67,0.4)] group-focus-within:text-[#D4A843] transition-colors duration-200" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@laxree.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-11 h-12 bg-[#0a0a0a] border-[#2a2520] rounded-xl text-foreground placeholder:text-[rgba(255,255,255,0.2)] focus:border-[rgba(212,168,67,0.5)] focus:ring-0 focus-visible:ring-0 transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(212,168,67,0.1)] hover:border-[rgba(212,168,67,0.25)] disabled:opacity-50"
                  />
                </div>
              </motion.div>

              {/* Password field */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-sm text-muted-foreground">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(212,168,67,0.4)] group-focus-within:text-[#D4A843] transition-colors duration-200" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-11 pr-11 h-12 bg-[#0a0a0a] border-[#2a2520] rounded-xl text-foreground placeholder:text-[rgba(255,255,255,0.2)] focus:border-[rgba(212,168,67,0.5)] focus:ring-0 focus-visible:ring-0 transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(212,168,67,0.1)] hover:border-[rgba(212,168,67,0.25)] disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgba(212,168,67,0.4)] hover:text-[#D4A843] transition-colors duration-200 focus:outline-none"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Remember me + Forgot password */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(checked) => setRemember(checked === true)}
                    disabled={loading}
                    className="data-[state=checked]:bg-[#D4A843] data-[state=checked]:border-[#D4A843] border-[#2a2520] h-4 w-4"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-muted-foreground cursor-pointer select-none"
                  >
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-sm text-[#D4A843]/70 hover:text-[#D4A843] transition-colors duration-200 focus:outline-none"
                >
                  Forgot Password?
                </button>
              </motion.div>

              {/* Submit button */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="pt-2"
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl gold-gradient text-[#0a0a0a] font-semibold text-sm tracking-wide hover:shadow-[0_0_30px_rgba(212,168,67,0.3)] transition-all duration-300 relative overflow-hidden group disabled:opacity-60 border-0"
                >
                  {/* Shimmer overlay */}
                  <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)] -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                      </>
                    )}
                  </span>
                </Button>
              </motion.div>
            </form>


          </div>

          {/* Bottom text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="text-center text-xs text-muted-foreground/40 mt-8"
          >
            &copy; {new Date().getFullYear()} Laxree. All rights reserved.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}