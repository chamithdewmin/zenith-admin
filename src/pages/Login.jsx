import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
// framer-motion removed for a simpler, non-animated login
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(username.trim(), password, rememberMe);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
      // Clear sensitive fields on failed login
      setPassword('');
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <Helmet>
        <title>Admin | Login</title>
        <meta name="description" content="Login to Admin Panel email management system" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#0D0F12' }}>
        <div className="w-full max-w-md md:max-w-lg">
          <div className="rounded-2xl p-8 md:p-10" style={{ backgroundColor: '#111418', boxShadow: '0 18px 50px rgba(2,6,23,0.7)' }}>
            {/* Logo */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-white">Welcome Back!</h2>
              <p className="mt-2 text-sm text-[#9AA3A9]">Sign in to continue to the admin panel</p>
            </div>

            {/* Success message */}
            {successMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-3 flex items-center gap-2 mb-4" role="alert" aria-live="assertive">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-emerald-500">{successMessage}</span>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-3 flex items-center gap-2" role="alert" aria-live="assertive">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="username" className="text-sm font-medium text-[#B8C0C4]">Username</Label>
                <div className="mt-2">
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    aria-required="true"
                    autoComplete="username"
                    disabled={loading || isSubmitting}
                    className="h-12 bg-[#0B0D0F] border border-[#202427] text-sm text-white placeholder:text-[#7F8A90] rounded-md px-4 caret-white focus:outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-[#B8C0C4]">Password</Label>
                <div className="mt-2 relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    aria-required="true"
                    autoComplete="current-password"
                    disabled={loading || isSubmitting}
                    className="h-12 bg-[#0B0D0F] border border-[#202427] text-sm text-white placeholder:text-[#7F8A90] rounded-md px-4 pr-12 caret-white focus:outline-none disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA3A9] hover:text-white disabled:opacity-50"
                    disabled={loading || isSubmitting}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <Checkbox checked={rememberMe} onCheckedChange={(v) => setRememberMe(!!v)} />
                  <span className="text-sm text-[#9AA3A9]">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-[#9AA3A9] hover:text-white">Forgot password?</Link>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full py-3 rounded-md text-white bg-[#0A66FF] hover:bg-[#095BE6] shadow-md disabled:opacity-60"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>

              
            </form>

            {/* Powered by footer */}
            <div className="text-center text-sm text-[#98A0A6] mt-6">
              <div className="mb-2 text-xs">Powered by</div>
              <div className="flex items-center justify-center">
                <a href="https://logozodev.com" target="_blank" rel="noopener noreferrer" className="inline-block">
                  <img src="https://logozodev.com/assets/img/logo/logo.svg" alt="Logozodev" className="w-24 h-auto" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;