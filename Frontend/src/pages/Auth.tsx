import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
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
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginConfirmPassword, setShowLoginConfirmPassword] = useState(false);
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
      if (userRole === 'admin') navigate('/admin');
      else if (userRole === 'instructor') navigate('/instructor');
      else if (userRole === 'manager') navigate('/manager');
      else navigate('/student-dashboard');
    }
  }, [user, authLoading, userRole, navigate]);

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

  const handleGoogleSignIn = async () => {
    toast({
      title: 'Google Sign In',
      description: 'Google authentication is currently disabled in backend-mode.',
      variant: 'default',
    });
    // Implementation would require backend OAuth flow
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

      const userStr = localStorage.getItem('user');
      const role = localStorage.getItem('user_role');
      const userData = userStr ? JSON.parse(userStr) : null;

      if (userData?.approval_status === 'pending' && role !== 'admin' && role !== 'manager') {
        navigate('/pending-approval');
      } else if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'instructor') {
        navigate('/instructor');
      } else if (role === 'manager') {
        navigate('/manager');
      } else {
        navigate('/student-dashboard');
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Gradient Background */}
      <div className="lg:w-1/2 bg-gradient-to-br from-accent/30 via-primary/20 to-accent/40 p-6 lg:p-10 flex flex-col relative overflow-hidden pointer-events-none">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 z-10 pointer-events-auto">
          <img src={logo} alt="AOTMS Logo" className="h-8 lg:h-10" />
        </a>

        {/* Motivational Text */}
        <div className="flex-1 flex flex-col justify-center mt-6 lg:mt-0 z-10">
          <p className="text-muted-foreground text-sm mb-2">You can easily</p>
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground leading-tight">
            Get access to your personal hub for learning and growth.
          </h1>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-accent/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/30 rounded-full blur-3xl pointer-events-none -z-10" />
      </div>

      {/* Right Panel - Auth Form */}
      <div className="lg:w-1/2 bg-background p-6 lg:p-8 flex items-center justify-center relative z-50 overflow-y-auto">
        <div className="w-full max-w-md relative z-50 pointer-events-auto py-4">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-accent text-2xl">✦</span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-1">
              {isLogin ? 'Welcome back' : registrationStep === 'email' ? 'Create an account' : registrationStep === 'otp' ? 'Verify Email' : 'Complete Registration'}
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
                          className="h-12 bg-muted/30 text-foreground border-0 rounded-xl focus:ring-2 focus:ring-primary/30 focus:bg-background transition-all placeholder:text-muted-foreground/60"
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
                            className="h-12 pr-12 bg-muted/30 text-foreground border-0 rounded-xl focus:ring-2 focus:ring-primary/30 focus:bg-background transition-all placeholder:text-muted-foreground/60 relative z-10"
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
                  className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all"
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
                  <div className={`flex items-center gap-1.5 ${(registrationStep as string) === 'email' ? 'text-primary' : (registrationStep as string) !== 'email' ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${(registrationStep as string) === 'email' ? 'bg-primary text-primary-foreground' : (registrationStep as string) !== 'email' ? 'bg-green-600 text-white' : 'bg-muted'}`}>
                      {(registrationStep as string) !== 'email' ? <Check className="h-3 w-3" /> : '1'}
                    </div>
                    <span className="text-xs">Email</span>
                  </div>
                  <div className="w-8 h-px bg-border" />
                  <div className={`flex items-center gap-1.5 ${(registrationStep as string) === 'otp' ? 'text-primary' : (registrationStep as string) === 'details' ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${(registrationStep as string) === 'otp' ? 'bg-primary text-primary-foreground' : (registrationStep as string) === 'details' ? 'bg-green-600 text-white' : 'bg-muted'}`}>
                      {(registrationStep as string) === 'details' ? <Check className="h-3 w-3" /> : '2'}
                    </div>
                    <span className="text-xs">Verify</span>
                  </div>
                  <div className="w-8 h-px bg-border" />
                  <div className={`flex items-center gap-1.5 ${(registrationStep as string) === 'details' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${(registrationStep as string) === 'details' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      3
                    </div>
                    <span className="text-xs">Details</span>
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
                      className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 font-medium text-sm rounded-lg flex items-center justify-center gap-2"
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
                      className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 font-medium text-sm rounded-lg"
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
                      className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 font-medium text-sm rounded-lg"
                    >
                      {loading ? 'Creating account...' : 'Create Account'}
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

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-xs">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google Sign In Button */}
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            variant="outline"
            className="w-full h-11 font-medium text-sm rounded-lg flex items-center justify-center gap-2 border hover:bg-muted/50"
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
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>

          {/* Toggle Login/Register */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={toggleMode}
              className="text-accent hover:underline font-medium"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
