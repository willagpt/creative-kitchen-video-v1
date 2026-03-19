import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LogIn, UserPlus, ChefHat, AlertCircle, Mail, CheckCircle2 } from 'lucide-react';

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSignUpSuccess(false);
    setLoading(true);

    try {
      if (isSignUp) {
        // Validate passwords match
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;

        // If session is null but user exists, confirmation email was sent
        if (data.user && !data.session) {
          setSignUpSuccess(true);
          return;
        }
        // If we got a session, user is logged in (email confirm disabled)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (error.message === 'Invalid login credentials') {
            throw new Error('Incorrect email or password. If you just signed up, check your email to confirm your account first.');
          }
          if (error.message === 'Email not confirmed') {
            throw new Error('Please check your email and click the confirmation link before signing in.');
          }
          throw error;
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className="w-10 h-10 text-purple-400" />
            <h1 className="text-3xl font-bold text-zinc-100">
              Creative Kitchen
            </h1>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-500 text-xs font-semibold rounded uppercase tracking-wider">
              Video
            </span>
          </div>
          <p className="text-zinc-400 text-sm">
            Collaborative video ad creation for food brands
          </p>
        </div>

        {/* Signup success message */}
        {signUpSuccess ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 bg-green-600/20 rounded-full flex items-center justify-center">
                <Mail className="w-7 h-7 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-100">Check your email</h2>
              <p className="text-sm text-zinc-400">
                We sent a confirmation link to{' '}
                <span className="text-zinc-200 font-medium">{email}</span>.
                Click the link to activate your account, then come back here to sign in.
              </p>
              <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-800 rounded-lg px-3 py-2 mt-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                Don't see it? Check your spam folder
              </div>
            </div>
            <button
              onClick={() => {
                setSignUpSuccess(false);
                setIsSignUp(false);
                setError('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Back to sign in
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4"
          >
            <h2 className="text-xl font-semibold text-zinc-100">
              {isSignUp ? 'Create account' : 'Sign in'}
            </h2>

            {error && (
              <div className="flex items-start gap-2 text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="••••••••"
                required
                minLength={6}
              />
              {isSignUp && (
                <p className="text-xs text-zinc-500 mt-1">Must be at least 6 characters</p>
              )}
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : confirmPassword && confirmPassword === password
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                      : 'border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                )}
                {confirmPassword && confirmPassword === password && (
                  <p className="text-xs text-green-500 mt-1">Passwords match</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (isSignUp && password !== confirmPassword)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create account
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign in
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setConfirmPassword('');
                }}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-zinc-600 text-xs mt-6">
          Creative Kitchen — Big Tasty Productions © 2026
        </p>
      </div>
    </div>
  );
}
