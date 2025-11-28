import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, ArrowLeft, Mail } from 'lucide-react';
import { apiFetch } from '@/services/apiClient';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch('forgot-password.php', {
        method: 'POST',
        body: { email: email.trim() }
      });

      if (response.success) {
        setSuccess(true);
        // Navigate to OTP verification page after 2 seconds
        setTimeout(() => {
          navigate('/reset-password', { state: { email: email.trim() } });
        }, 2000);
      } else {
        // Handle rate limiting
        if (response.code === 'RATE_LIMIT') {
          const waitTime = response.retry_after || 120;
          setError(response.message || `Please wait ${Math.ceil(waitTime)} seconds before requesting another OTP.`);
        } else {
          setError(response.message || 'Failed to send OTP. Please try again.');
        }
      }
    } catch (err) {
      // Handle rate limiting errors
      if (err.status === 429 || err.payload?.code === 'RATE_LIMIT') {
        const waitTime = err.payload?.retry_after || 120;
        setError(err.payload?.message || `Please wait ${Math.ceil(waitTime)} seconds before requesting another OTP.`);
      } else {
        setError(err?.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin | Forgot Password</title>
        <meta name="description" content="Reset your password using OTP" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#0D0F12' }}>
        <div className="w-full max-w-md md:max-w-lg">
          <div className="rounded-2xl p-8 md:p-10" style={{ backgroundColor: '#111418', boxShadow: '0 18px 50px rgba(2,6,23,0.7)' }}>
            {/* Back to Login */}
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm text-[#9AA3A9] hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Forgot Password?</h2>
              <p className="mt-2 text-sm text-[#9AA3A9]">
                Enter your registered email address and we'll send you an OTP code to reset your password.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-3 flex items-center gap-2 mb-4" role="alert">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-3 flex items-center gap-2 mb-4" role="alert">
                <Mail className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-sm text-emerald-500">
                  OTP code has been sent to your email. Redirecting...
                </span>
              </div>
            )}

            {/* Form */}
            {!success && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-[#B8C0C4]">
                    Email Address
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      disabled={loading}
                      placeholder="Enter your registered email"
                      className="h-12 bg-[#0B0D0F] border border-[#202427] text-sm text-white placeholder:text-[#7F8A90] rounded-md px-4 caret-white focus:outline-none disabled:opacity-60"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-md text-white bg-[#0A66FF] hover:bg-[#095BE6] shadow-md disabled:opacity-60"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP Code'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;

