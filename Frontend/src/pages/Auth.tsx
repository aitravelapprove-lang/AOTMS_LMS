import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PhoneInput } from '@/components/ui/phone-input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';
import { Mail, Lock, User, Eye, EyeOff, Check, X, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

import Spline from '@splinetool/react-spline';
import { motion, AnimatePresence } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().default(''),
  countryCode: z.string().default('+91'),
  password: z.string().min(1, { message: 'Password is required' }),
});

const emailVerifySchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters' }).max(50, { message: 'Name must be less than 50 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

const otpSchema = z.object({
  otp: z.string().length(6, { message: 'Please enter 6-digit OTP' }),
});

const detailsSchema = z.object({
  phone: z.string().min(10, { message: 'Mobile number must be 10 digits' }).max(10, { message: 'Mobile number must be 10 digits' }),
  countryCode: z.string().default('+91'),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Terms & Privacy Policy',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type EmailVerifyFormData = z.infer<typeof emailVerifySchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type DetailsFormData = z.infer<typeof detailsSchema>;

type RegistrationStep = 'email' | 'otp' | 'details';

// Password strength checker
const getPasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  return { checks, score };
};

export default function Auth() {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login' || location.pathname === '/auth');
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('email');
  const [tempUserData, setTempUserData] = useState<{ fullName: string; email: string } | null>(null);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if already logged in
  const { userRole } = useAuth();
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', phone: '', countryCode: '+91', password: '' },
  });

  const emailVerifyForm = useForm<EmailVerifyFormData>({
    resolver: zodResolver(emailVerifySchema),
    defaultValues: { fullName: '', email: '' },
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const detailsForm = useForm<DetailsFormData>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { phone: '', countryCode: '+91', password: '', confirmPassword: '', agreeToTerms: false },
  });

  const watchPassword = detailsForm.watch('password');
  const passwordStrength = useMemo(() => getPasswordStrength(watchPassword || ''), [watchPassword]);

  useEffect(() => {
    if (otpResendTimer > 0) {
      const timer = setTimeout(() => setOtpResendTimer(otpResendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpResendTimer]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSendOtp = async (data: EmailVerifyFormData) => {
    setLoading(true);
    setTempUserData({ fullName: data.fullName, email: data.email });
    
    try {
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          full_name: data.fullName,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setRegistrationStep('otp');
        setOtpResendTimer(120);
        toast({
          title: 'OTP Sent',
          description: 'Please check your email for the 6-digit OTP.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to send OTP. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send OTP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (data: OtpFormData) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: tempUserData?.email,
          otp: data.otp,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setRegistrationStep('details');
        toast({
          title: 'Verified',
          description: 'Email verified successfully. Please complete your registration.',
        });
      } else {
        otpForm.setError('otp', { message: result.error || 'Invalid OTP. Please try again.' });
        toast({
          title: 'Verification Failed',
          description: result.error || 'Invalid OTP. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify OTP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!tempUserData || otpResendTimer > 0) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: tempUserData.email,
          full_name: tempUserData.fullName,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setOtpResendTimer(120);
        toast({
          title: 'OTP Resent',
          description: 'A new OTP has been sent to your email.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to resend OTP.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend OTP.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalRegister = async (data: DetailsFormData) => {
    if (!tempUserData) return;
    setLoading(true);
    const fullPhone = `${data.countryCode}${data.phone}`;
    const { error } = await signUp(tempUserData.email, data.password, tempUserData.fullName, fullPhone);
    
    if (error) {
      setLoading(false);
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      navigate('/');
    }
  };

  const handleOtpInputChange = (index: number, value: string, onChange: (value: string) => void) => {
    const newValue = value.replace(/[^0-9]/g, '');
    if (newValue.length <= 1) {
      const otpArray = otpForm.getValues('otp').split('');
      otpArray[index] = newValue;
      const newOtp = otpArray.join('').slice(0, 6);
      onChange(newOtp);
      
      if (newValue && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpForm.getValues('otp')[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    const { error } = await signIn(data.email, data.password);

    if (error) {
      setLoading(false);
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      // Data is already updated in useAuth and localStorage
      setLoading(false);
      toast({ title: 'Welcome back!' });

      const role = localStorage.getItem('user_role');
      const userStr = localStorage.getItem('user');
      const userData = userStr ? JSON.parse(userStr) : null;

      if (userData?.approval_status === 'pending' && role !== 'admin' && role !== 'manager') {
        navigate('/pending-approval');
      } else {
        navigate('/');
      }
    }
  };

  const toggleMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    navigate(newMode ? '/login' : '/signup', { replace: true });
    loginForm.reset();
    emailVerifyForm.reset();
    otpForm.reset();
    detailsForm.reset();
    setRegistrationStep('email');
    setTempUserData(null);
  };

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-1.5 text-xs ${met ? 'text-green-600' : 'text-muted-foreground'}`}>
      {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white relative overflow-hidden">
      {/* 
          Global Spline Background Layer - Brand Identity
          Hidden on mobile (sm) for performance, visible on tablet (md) and desktop (lg).
      */}
      <div className="absolute inset-0 z-0 w-full h-full pointer-events-none overflow-hidden text-center bg-gradient-to-br from-[#0075CF]/20 via-white to-[#FD5A1A]/20">
        <div className="hidden md:block w-[150vw] h-[120vh] absolute -top-[10vh] -left-[30vw] lg:w-[220vw] lg:-top-[15vh] lg:-left-[75vw] pointer-events-auto transition-all duration-700 ease-out mix-blend-multiply">
          <Spline 
            scene="https://prod.spline.design/atHJsNeB45CbbiBU/scene.splinecode" 
          />
        </div>
        {/* Subtle Brand Orbs for Depth - Optimized for all screens */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#0075CF]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#FD5A1A]/10 rounded-full blur-[120px]" />
      </div>

      {/* Left Panel — Purely Visual Spacing */}
      <div className="hidden md:flex md:w-1/2 relative flex-col pointer-events-none min-h-0 md:min-h-screen">
        <div className="relative md:absolute top-0 left-0 w-full p-8 lg:p-12 z-20 flex justify-center lg:justify-start pointer-events-none">
          <a href="/" className="pointer-events-auto transition-transform hover:scale-105 active:scale-95 inline-block">
            <img src={logo} alt="Logo" className="h-10 lg:h-12" />
          </a>
        </div>
      </div>

      {/* Right Panel — Interactive Form Area */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative z-10 min-h-screen">
        <div className="w-full max-w-md space-y-6 sm:space-y-8 bg-white/80 backdrop-blur-xl p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-white/40 shadow-2xl shadow-slate-200/50 relative">
          {/* Mobile-only Logo */}
          <div className="flex justify-center mb-4 md:hidden">
            <a href="/">
              <img src={logo} alt="AOTMS Logo" className="h-10" />
            </a>
          </div>
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-[#0075CF]/10 to-[#FD5A1A]/10 rounded-3xl flex items-center justify-center border border-slate-100 shadow-xl shadow-slate-200/50">
              <span className="text-[#0075CF] text-2xl font-black">✦</span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-950 mb-2 tracking-tight">
              {isLogin ? 'Welcome back' : registrationStep === 'email' ? 'Create account' : registrationStep === 'otp' ? 'Verify' : 'Complete'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isLogin
                ? 'Sign in to continue your learning journey.'
                : registrationStep === 'email'
                ? 'Enter your details to get started'
                : registrationStep === 'otp'
                ? 'Enter the OTP sent to your email'
                : 'Fill in your account details'}
            </p>
          </div>

          {/* Login Form */}
          {isLogin ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="login-email" className="text-sm font-medium text-foreground">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          className="h-12 bg-slate-50 text-slate-900 border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#0075CF]/10 focus:bg-white transition-all placeholder:text-slate-400 font-medium"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Number */}
                <FormField
                  control={loginForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">Phone Number <span className="text-muted-foreground text-xs">(Optional)</span></FormLabel>
                      <FormControl>
                        <PhoneInput
                          value={field.value}
                          onValueChange={field.onChange}
                          countryCode={loginForm.watch('countryCode')}
                          onCountryChange={(code) => loginForm.setValue('countryCode', code)}
                          placeholder="9876543210"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="login-password" className="text-sm font-medium text-foreground">Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            id="login-password"
                            type={showLoginPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="h-12 pr-12 bg-slate-50 text-slate-900 border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#0075CF]/10 focus:bg-white transition-all placeholder:text-slate-400 font-medium relative z-10"
                            autoComplete="current-password"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-[#0075CF] to-[#3391D9] text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#0075CF]/20 hover:shadow-[#0075CF]/40 transition-all duration-300 active:scale-[0.98]"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </Form>
          ) : (
            /* Multi-Step Registration Form */
            <div className="space-y-4">
              {/* Step Indicator */}
              {!isLogin && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className={`flex items-center gap-1.5 ${(registrationStep as string) === 'email' ? 'text-[#0075CF]' : (registrationStep as string) !== 'email' ? 'text-green-600' : 'text-slate-400'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${(registrationStep as string) === 'email' ? 'bg-[#0075CF] text-white shadow-lg shadow-[#0075CF]/30' : (registrationStep as string) !== 'email' ? 'bg-green-600 text-white' : 'bg-slate-100'}`}>
                      {(registrationStep as string) !== 'email' ? <Check className="h-3 w-3" /> : '1'}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Email</span>
                  </div>
                  <div className="w-8 h-px bg-slate-100" />
                  <div className={`flex items-center gap-1.5 ${(registrationStep as string) === 'otp' ? 'text-[#0075CF]' : (registrationStep as string) === 'details' ? 'text-green-600' : 'text-slate-400'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${(registrationStep as string) === 'otp' ? 'bg-[#0075CF] text-white shadow-lg shadow-[#0075CF]/30' : (registrationStep as string) === 'details' ? 'bg-green-600 text-white' : 'bg-slate-100'}`}>
                      {(registrationStep as string) === 'details' ? <Check className="h-3 w-3" /> : '2'}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Verify</span>
                  </div>
                  <div className="w-8 h-px bg-slate-100" />
                  <div className={`flex items-center gap-1.5 ${(registrationStep as string) === 'details' ? 'text-[#0075CF]' : 'text-slate-400'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${(registrationStep as string) === 'details' ? 'bg-[#0075CF] text-white shadow-lg shadow-[#0075CF]/30' : 'bg-slate-100'}`}>
                      3
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Details</span>
                  </div>
                </div>
              )}

              {/* Step 1: Email Verification */}
              {registrationStep === 'email' && (
                <Form {...emailVerifyForm}>
                  <form onSubmit={emailVerifyForm.handleSubmit(handleSendOtp)} className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold">Get Started</h3>
                      <p className="text-sm text-muted-foreground">Enter your name and email to begin</p>
                    </div>
                    
                    <FormField
                      control={emailVerifyForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="register-name" className="text-sm">Full Name</FormLabel>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                            <FormControl>
                              <Input
                                id="register-name"
                                type="text"
                                placeholder="John Doe"
                                className="pl-10 h-11 bg-background text-foreground border-input relative z-10 pointer-events-auto cursor-text"
                                autoComplete="name"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailVerifyForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="register-email" className="text-sm">Email Address</FormLabel>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                            <FormControl>
                              <Input
                                id="register-email"
                                type="email"
                                placeholder="student@example.com"
                                className="pl-10 h-11 bg-background text-foreground border-input relative z-10 pointer-events-auto cursor-text"
                                autoComplete="email"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 bg-gradient-to-r from-[#0075CF] to-[#3391D9] text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#0075CF]/20 hover:shadow-[#0075CF]/40 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {loading ? 'Sending OTP...' : 'Verify Email'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                </Form>
              )}

              {/* Step 2: OTP Verification */}
              {registrationStep === 'otp' && (
                <Form {...otpForm}>
                  <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">Verify Your Email</h3>
                      <p className="text-sm text-muted-foreground">
                        We've sent a 6-digit OTP to<br />
                        <span className="font-medium text-foreground">{tempUserData?.email}</span>
                      </p>
                    </div>

                    <div className="flex justify-center gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          ref={(el) => { otpInputRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          className="w-12 h-12 text-center text-lg font-semibold bg-background border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          onChange={(e) => handleOtpInputChange(index, e.target.value, otpForm.setValue.bind(null, 'otp'))}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          value={otpForm.getValues('otp')[index] || ''}
                        />
                      ))}
                    </div>
                    <FormField
                      control={otpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem className="hidden">
                          <FormControl>
                            <Input type="hidden" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 bg-gradient-to-r from-[#0075CF] to-[#3391D9] text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#0075CF]/20 hover:shadow-[#0075CF]/40 transition-all duration-300 active:scale-[0.98]"
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Didn't receive the code?{' '}
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={otpResendTimer > 0 || loading}
                          className="text-primary hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {otpResendTimer > 0 ? `Resend in ${otpResendTimer}s` : 'Resend OTP'}
                        </button>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setRegistrationStep('email');
                        otpForm.reset();
                      }}
                      className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Back to email
                    </button>
                  </form>
                </Form>
              )}

              {/* Step 3: Final Details */}
              {registrationStep === 'details' && (
                <Form {...detailsForm}>
                  <form onSubmit={detailsForm.handleSubmit(handleFinalRegister)} className="space-y-4">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold">Email Verified!</h3>
                      <p className="text-sm text-muted-foreground">Complete your account details</p>
                    </div>

                    <FormField
                      control={detailsForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Mobile Number <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <PhoneInput
                              value={field.value}
                              onValueChange={field.onChange}
                              countryCode={detailsForm.watch('countryCode')}
                              onCountryChange={(code) => detailsForm.setValue('countryCode', code)}
                              placeholder="8019952233"
                            />
                          </FormControl>
                          <FormMessage />
                          {field.value && field.value.length < 10 && (
                            <p className="text-[10px] text-orange-500 font-bold mt-1 animate-pulse">
                              Wait! Minimum 10 digits required for a valid number.
                            </p>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={detailsForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="register-password" className="text-sm">Password</FormLabel>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                            <FormControl>
                              <Input
                                id="register-password"
                                type={showRegisterPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-10 pr-10 h-11 bg-background text-foreground border-input relative z-10 pointer-events-auto cursor-text"
                                autoComplete="new-password"
                                {...field}
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors z-10"
                              tabIndex={-1}
                            >
                              {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={detailsForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="register-confirm-password" className="text-sm">Confirm Password</FormLabel>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                            <FormControl>
                              <Input
                                id="register-confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-10 pr-10 h-11 bg-background text-foreground border-input relative z-10 pointer-events-auto cursor-text"
                                autoComplete="new-password"
                                {...field}
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors z-10"
                              tabIndex={-1}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchPassword && watchPassword.length > 0 && (
                      <div className="p-2.5 bg-muted/50 rounded-lg grid grid-cols-2 gap-1">
                        <PasswordRequirement met={passwordStrength.checks.length} text="8+ characters" />
                        <PasswordRequirement met={passwordStrength.checks.uppercase} text="Uppercase" />
                        <PasswordRequirement met={passwordStrength.checks.lowercase} text="Lowercase" />
                        <PasswordRequirement met={passwordStrength.checks.number} text="Number" />
                      </div>
                    )}

                    <FormField
                      control={detailsForm.control}
                      name="agreeToTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-1">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-0.5"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-xs font-normal text-muted-foreground cursor-pointer">
                              I agree to the{' '}
                              <a href="/terms" className="text-accent hover:underline">Terms</a>
                              {' '}&{' '}
                              <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 bg-gradient-to-r from-[#0075CF] to-[#3391D9] text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#0075CF]/20 hover:shadow-[#0075CF]/40 transition-all duration-300 active:scale-[0.98]"
                    >
                      {loading ? 'Registering...' : 'Complete Registration'}
                    </Button>

                    <button
                      type="button"
                      onClick={() => {
                        setRegistrationStep('otp');
                        detailsForm.reset();
                      }}
                      className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Back to OTP
                    </button>
                  </form>
                </Form>
              )}
            </div>
          )}

          {/* Toggle Login/Register */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={toggleMode}
              className="text-[#0075CF] hover:underline font-bold"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
