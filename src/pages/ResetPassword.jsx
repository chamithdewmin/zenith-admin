import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Shield } from 'lucide-react';
import { apiFetch } from '@/services/apiClient';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('otp'); // 'otp' or 'password'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Get email from navigation state or prompt
    const emailFromState = location.state?.email;
    if (emailFromState) {
      setEmail(emailFromState);
    } else {
      // If no email in state, redirect to forgot password
      navigate('/forgot-password');
    }
  }, [location, navigate]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch('verify-otp.php', {
        method: 'POST',
        body: { email, otp: otp.trim() }
      });

      if (response.success) {
        setStep('password');
        setError('');
      } else {
        setError(response.message || 'Invalid OTP code. Please try again.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch('reset-password.php', {
        method: 'POST',
        body: { email, new_password: newPassword }
      });

      if (response.success) {
        // Success - redirect to login
        navigate('/login', { 
          state: { 
            message: 'Password reset successful! Please login with your new password.' 
          } 
        });
      } else {
        setError(response.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin | Reset Password</title>
        <meta name="description" content="Reset your password using OTP verification" />
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
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-white">
                {step === 'otp' ? 'Verify OTP Code' : 'Reset Password'}
              </h2>
              <p className="mt-2 text-sm text-[#9AA3A9]">
                {step === 'otp' 
                  ? `Enter the 6-digit OTP code sent to ${email}`
                  : 'Enter your new password below'}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-3 flex items-center gap-2 mb-4" role="alert">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            {/* OTP Verification Step */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <Label htmlFor="otp" className="text-sm font-medium text-[#B8C0C4]">
                    OTP Code
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtp(value);
                      }}
                      required
                      maxLength={6}
                      disabled={loading}
                      placeholder="000000"
                      className="h-12 bg-[#0B0D0F] border border-[#202427] text-sm text-white placeholder:text-[#7F8A90] rounded-md px-4 caret-white focus:outline-none disabled:opacity-60 text-center text-2xl tracking-widest font-mono"
                    />
                  </div>
                  <p className="text-xs text-[#7F8A90] mt-2">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3 rounded-md text-white bg-[#0A66FF] hover:bg-[#095BE6] shadow-md disabled:opacity-60"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </form>
            )}

            {/* Password Reset Step */}
            {step === 'password' && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <Label htmlFor="newPassword" className="text-sm font-medium text-[#B8C0C4]">
                    New Password
                  </Label>
                  <div className="mt-2 relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={loading}
                      placeholder="Enter new password"
                      className="h-12 bg-[#0B0D0F] border border-[#202427] text-sm text-white placeholder:text-[#7F8A90] rounded-md px-4 pr-12 caret-white focus:outline-none disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA3A9] hover:text-white"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-[#7F8A90] mt-1">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#B8C0C4]">
                    Confirm Password
                  </Label>
                  <div className="mt-2 relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={loading}
                      placeholder="Confirm new password"
                      className="h-12 bg-[#0B0D0F] border border-[#202427] text-sm text-white placeholder:text-[#7F8A90] rounded-md px-4 pr-12 caret-white focus:outline-none disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA3A9] hover:text-white"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword}
                  className="w-full py-3 rounded-md text-white bg-[#0A66FF] hover:bg-[#095BE6] shadow-md disabled:opacity-60"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;



