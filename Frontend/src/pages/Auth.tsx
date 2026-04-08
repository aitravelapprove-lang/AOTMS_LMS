import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import logo from "@/assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCharactersLogin } from "@/components/ui/animated-characters-login-page";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().default(""),
  countryCode: z.string().default("+91"),
  password: z.string().min(1, { message: "Password is required" }),
});

const emailVerifySchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be less than 50 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const otpSchema = z.object({
  otp: z.string().length(6, { message: "Please enter 6-digit OTP" }),
});

const detailsSchema = z
  .object({
    phone: z
      .string()
      .min(10, { message: "Mobile number must be 10 digits" })
      .max(10, { message: "Mobile number must be 10 digits" }),
    countryCode: z.string().default("+91"),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Terms & Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type EmailVerifyFormData = z.infer<typeof emailVerifySchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type DetailsFormData = z.infer<typeof detailsSchema>;

type RegistrationStep = "email" | "otp" | "details";

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
  const [isLogin, setIsLogin] = useState(
    location.pathname === "/login" || location.pathname === "/auth",
  );
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationStep, setRegistrationStep] =
    useState<RegistrationStep>("email");
  const [tempUserData, setTempUserData] = useState<{
    fullName: string;
    email: string;
  } | null>(null);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const [loginStep, setLoginStep] = useState<'credentials' | 'admin-otp'>('credentials');
  const [adminLoginEmail, setAdminLoginEmail] = useState('');
  const [adminOtpResendTimer, setAdminOtpResendTimer] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const { signIn, signUp, user, loading: authLoading, verifyAdminOtp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", phone: "", countryCode: "+91", password: "" },
  });

  const emailVerifyForm = useForm<EmailVerifyFormData>({
    resolver: zodResolver(emailVerifySchema),
    defaultValues: { fullName: "", email: "" },
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const detailsForm = useForm<DetailsFormData>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      phone: "",
      countryCode: "+91",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const watchPassword = detailsForm.watch("password");
  const passwordStrength = useMemo(
    () => getPasswordStrength(watchPassword || ""),
    [watchPassword],
  );

  useEffect(() => {
    if (otpResendTimer > 0) {
      const timer = setTimeout(
        () => setOtpResendTimer(otpResendTimer - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [otpResendTimer]);

  useEffect(() => {
    if (adminOtpResendTimer > 0) {
      const timer = setTimeout(() => setAdminOtpResendTimer(adminOtpResendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [adminOtpResendTimer]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const handleSendOtp = async (data: EmailVerifyFormData) => {
    setLoading(true);
    setTempUserData({ fullName: data.fullName, email: data.email });

    try {
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          full_name: data.fullName,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setRegistrationStep("otp");
        setOtpResendTimer(120);
        toast({
          title: "OTP Sent",
          description: "Please check your email for the 6-digit OTP.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (data: OtpFormData) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: tempUserData?.email,
          otp: data.otp,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setRegistrationStep("details");
        toast({
          title: "Verified",
          description:
            "Email verified successfully. Please complete your registration.",
        });
      } else {
        otpForm.setError("otp", {
          message: result.error || "Invalid OTP. Please try again.",
        });
        toast({
          title: "Verification Failed",
          description: result.error || "Invalid OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: tempUserData.email,
          full_name: tempUserData.fullName,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setOtpResendTimer(120);
        toast({
          title: "OTP Resent",
          description: "A new OTP has been sent to your email.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to resend OTP.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend OTP.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalRegister = async (data: DetailsFormData) => {
    if (!tempUserData) return;
    setLoading(true);
    const fullPhone = `${data.countryCode}${data.phone}`;
    const { error } = await signUp(
      tempUserData.email,
      data.password,
      tempUserData.fullName,
      fullPhone,
    );

    if (error) {
      setLoading(false);
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  const handleOtpInputChange = (
    index: number,
    value: string,
    onChange: (value: string) => void,
  ) => {
    const newValue = value.replace(/[^0-9]/g, "");
    if (newValue.length <= 1) {
      const otpArray = otpForm.getValues("otp").split("");
      otpArray[index] = newValue;
      const newOtp = otpArray.join("").slice(0, 6);
      onChange(newOtp);

      if (newValue && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      e.key === "Backspace" &&
      !otpForm.getValues("otp")[index] &&
      index > 0
    ) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    const result = await signIn(data.email, data.password);

    if (result.error) {
      setLoading(false);
      toast({
        title: "Login Failed",
        description: result.error.message,
        variant: "destructive",
      });
    } else if (result.requiresAdminOtp) {
      setLoading(false);
      setAdminLoginEmail(data.email);
      setLoginStep('admin-otp');
      setAdminOtpResendTimer(120);
      otpForm.reset();
      toast({
        title: 'OTP Required',
        description: 'A verification code has been sent to your admin email.',
      });
    } else {
      setLoading(false);
      toast({ title: "Welcome back!" });

      const role = localStorage.getItem("user_role");
      const userStr = localStorage.getItem("user");
      const userData = userStr ? JSON.parse(userStr) : null;

      if (
        userData?.approval_status === "pending" &&
        role !== "admin" &&
        role !== "manager"
      ) {
        navigate("/pending-approval");
      } else {
        navigate("/");
      }
    }
  };

  const handleAdminOtpVerify = async (data: OtpFormData) => {
    setLoading(true);
    const { error } = await verifyAdminOtp(adminLoginEmail, data.otp);

    if (error) {
      setLoading(false);
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setLoading(false);
      toast({ title: 'Admin Login Verified', description: 'Welcome to the admin panel.' });
      navigate('/');
    }
  };

  const handleAdminOtpResend = async () => {
    if (adminOtpResendTimer > 0) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/admin-resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminLoginEmail }),
      });
      if (response.ok) {
        setAdminOtpResendTimer(120);
        toast({ title: 'OTP Resent', description: 'A new OTP has been sent to your email.' });
      } else {
        const result = await response.json();
        toast({ title: 'Error', description: result.error || 'Failed to resend OTP.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to resend OTP.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    navigate(newMode ? "/login" : "/signup", { replace: true });
    loginForm.reset();
    emailVerifyForm.reset();
    otpForm.reset();
    detailsForm.reset();
    setRegistrationStep("email");
    setTempUserData(null);
    setLoginStep('credentials');
    setAdminLoginEmail('');
  };

  const PasswordRequirement = ({
    met,
    text,
  }: {
    met: boolean;
    text: string;
  }) => (
    <div
      className={`flex items-center gap-1.5 text-xs ${met ? "text-green-600" : "text-muted-foreground"}`}
    >
      {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      <span>{text}</span>
    </div>
  );

  const loginPassword = loginForm.watch("password");
  const signupPassword = detailsForm.watch("password");

  return (
    <AnimatedCharactersLogin
      email={
        isLogin ? loginForm.watch("email") : emailVerifyForm.watch("email")
      }
      password={isLogin ? loginPassword : signupPassword}
      showPassword={
        isLogin
          ? showLoginPassword
          : registrationStep === "details"
            ? showRegisterPassword
            : false
      }
      isTyping={isTyping}
      logo={logo}
    >
      <div className="space-y-6 relative">
        {/* Header */}
        <div className="text-center mb-8">
          {logo && (
            <div className="flex justify-center mb-6">
              <img
                src={logo}
                alt="Logo"
                className="h-12 md:h-14 lg:h-16 w-auto object-contain"
              />
            </div>
          )}
          <h2 className="text-3xl font-black text-slate-950 mb-2 tracking-tight">
            {isLogin
              ? loginStep === 'admin-otp' ? 'Admin Verification' : 'Welcome back'
              : registrationStep === "email"
                ? "Create account"
                : registrationStep === "otp"
                  ? "Verify"
                  : "Complete"}
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            {isLogin
              ? loginStep === 'admin-otp'
                ? `Enter the OTP sent to ${adminLoginEmail}`
                : "Sign in to continue your learning journey."
              : registrationStep === "email"
                ? "Enter your details to get started"
                : registrationStep === "otp"
                  ? "Enter the OTP sent to your email"
                  : "Fill in your account details"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Login Form */}
          {isLogin ? (
            <motion.div
              key={loginStep === 'admin-otp' ? 'admin-otp' : 'login'}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {loginStep === 'admin-otp' ? (
                /* Admin OTP Verification Step */
                <Form {...otpForm}>
                  <form onSubmit={otpForm.handleSubmit(handleAdminOtpVerify)} className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-[#0075CF]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#0075CF]/20">
                        <ShieldCheck className="h-8 w-8 text-[#0075CF]" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Admin Verification</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">
                        Secure access verification required
                      </p>
                    </div>

                    <div className="flex justify-center gap-3">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          ref={(el) => { otpInputRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          className="w-12 h-14 text-center text-xl font-bold bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#0075CF] focus:ring-4 focus:ring-[#0075CF]/10 outline-none transition-all"
                          onChange={(e) => handleOtpInputChange(index, e.target.value, otpForm.setValue.bind(null, 'otp'))}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          value={otpForm.getValues('otp')[index] || ''}
                          onFocus={() => setIsTyping(true)}
                          onBlur={() => setIsTyping(false)}
                        />
                      ))}
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 bg-[#0075CF] hover:bg-[#0075CF]/90 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#0075CF]/20 transition-all active:scale-[0.98]"
                    >
                      {loading ? 'Verifying...' : 'Unlock Admin Portal'}
                    </Button>

                    <div className="text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        No code?{' '}
                        <button
                          type="button"
                          onClick={handleAdminOtpResend}
                          disabled={adminOtpResendTimer > 0 || loading}
                          className="text-[#0075CF] hover:underline disabled:opacity-50"
                        >
                          {adminOtpResendTimer > 0 ? `Retry in ${adminOtpResendTimer}s` : 'Resend Code'}
                        </button>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setLoginStep('credentials');
                        otpForm.reset();
                        setAdminLoginEmail('');
                      }}
                      className="w-full text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Use Different Account
                    </button>
                  </form>
                </Form>
              ) : (
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Email Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="admin@aotms.in"
                              className="h-14 bg-slate-50 border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#0075CF]/10 transition-all font-medium text-slate-900"
                              autoComplete="email"
                              onFocus={() => setIsTyping(true)}
                              onBlur={() => setIsTyping(false)}
                              {...field}
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
                          <FormLabel className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Security Key</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                type={showLoginPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="h-14 pr-14 bg-slate-50 border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#0075CF]/10 transition-all font-medium text-slate-900"
                                autoComplete="current-password"
                                onFocus={() => setIsTyping(true)}
                                onBlur={() => setIsTyping(false)}
                                {...field}
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
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
                      className="w-full h-14 bg-[#0075CF] hover:bg-[#0075CF]/90 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#0075CF]/20 transition-all active:scale-[0.98]"
                    >
                      {loading ? "Authenticating..." : "Sign In to Portal"}
                    </Button>
                  </form>
                </Form>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Multi-Step Registration Form */}
              <div className="space-y-4">
                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div
                    className={`flex items-center gap-1.5 ${registrationStep === "email" ? "text-[#0075CF]" : "text-slate-400"}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${registrationStep === "email" ? "bg-[#0075CF] text-white" : "bg-slate-100"}`}
                    >
                      1
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Start
                    </span>
                  </div>
                  <div className="w-8 h-px bg-slate-100" />
                  <div
                    className={`flex items-center gap-1.5 ${registrationStep === "otp" ? "text-[#0075CF]" : "text-slate-400"}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${registrationStep === "otp" ? "bg-[#0075CF] text-white" : "bg-slate-100"}`}
                    >
                      2
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Verify
                    </span>
                  </div>
                  <div className="w-8 h-px bg-slate-100" />
                  <div
                    className={`flex items-center gap-1.5 ${registrationStep === "details" ? "text-[#0075CF]" : "text-slate-400"}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${registrationStep === "details" ? "bg-[#0075CF] text-white" : "bg-slate-100"}`}
                    >
                      3
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Finish
                    </span>
                  </div>
                </div>

                {/* Step 1: Email Verification */}
                {registrationStep === "email" && (
                  <Form {...emailVerifyForm}>
                    <form
                      onSubmit={emailVerifyForm.handleSubmit(handleSendOtp)}
                      className="space-y-4"
                    >
                      <FormField
                        control={emailVerifyForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold">
                              Full Name
                            </FormLabel>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                              <FormControl>
                                <Input
                                  placeholder="Enter Your Full Name"
                                  className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-[#0075CF]/10 transition-all"
                                  onFocus={() => setIsTyping(true)}
                                  onBlur={() => setIsTyping(false)}
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
                            <FormLabel className="text-sm font-semibold">
                              Email Address
                            </FormLabel>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="student@example.com"
                                  className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-[#0075CF]/10 transition-all"
                                  onFocus={() => setIsTyping(true)}
                                  onBlur={() => setIsTyping(false)}
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
                        className="w-full h-12 bg-[#0075CF] hover:bg-[#0075CF]/90 text-white font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? "Sending..." : "Verify Email"}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </form>
                  </Form>
                )}

                {/* Step 2: OTP Verification */}
                {registrationStep === "otp" && (
                  <Form {...otpForm}>
                    <form
                      onSubmit={otpForm.handleSubmit(handleVerifyOtp)}
                      className="space-y-4 text-center"
                    >
                      <p className="text-sm text-slate-500 mb-6 font-medium">
                        We sent a code to{" "}
                        <span className="font-bold text-slate-900">
                          {tempUserData?.email}
                        </span>
                      </p>

                      <div className="flex justify-center gap-2 mb-6">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <input
                            key={index}
                            ref={(el) => {
                              otpInputRefs.current[index] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            className="w-12 h-12 text-center text-lg font-black bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-[#0075CF] focus:ring-4 focus:ring-[#0075CF]/10 outline-none transition-all"
                            onChange={(e) =>
                              handleOtpInputChange(
                                index,
                                e.target.value,
                                otpForm.setValue.bind(null, "otp"),
                              )
                            }
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onFocus={() => setIsTyping(true)}
                            onBlur={() => setIsTyping(false)}
                            value={otpForm.getValues("otp")[index] || ""}
                          />
                        ))}
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-[#0075CF] hover:bg-[#0075CF]/90 text-white font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        {loading ? "Verifying..." : "Verify OTP"}
                      </Button>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={otpResendTimer > 0 || loading}
                          className="text-xs text-[#0075CF] hover:underline font-bold disabled:opacity-50"
                        >
                          {otpResendTimer > 0
                            ? `Resend in ${otpResendTimer}s`
                            : "Resend Code"}
                        </button>
                      </div>
                    </form>
                  </Form>
                )}

                {/* Step 3: Final Details */}
                {registrationStep === "details" && (
                  <Form {...detailsForm}>
                    <form
                      onSubmit={detailsForm.handleSubmit(handleFinalRegister)}
                      className="space-y-4"
                    >
                      <FormField
                        control={detailsForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold">
                              Mobile Number
                            </FormLabel>
                            <FormControl>
                              <PhoneInput
                                value={field.value}
                                onValueChange={field.onChange}
                                countryCode={detailsForm.watch("countryCode")}
                                onCountryChange={(code) =>
                                  detailsForm.setValue("countryCode", code)
                                }
                                placeholder="8019952233"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={detailsForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold">
                              Create Password
                            </FormLabel>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                              <FormControl>
                                <Input
                                  type={
                                    showRegisterPassword ? "text" : "password"
                                  }
                                  placeholder="••••••••"
                                  className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-4 focus:ring-[#0075CF]/10 transition-all font-medium"
                                  autoComplete="new-password"
                                  onFocus={() => setIsTyping(true)}
                                  onBlur={() => setIsTyping(false)}
                                  {...field}
                                />
                              </FormControl>
                              <button
                                type="button"
                                onClick={() =>
                                  setShowRegisterPassword(!showRegisterPassword)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
                                tabIndex={-1}
                              >
                                {showRegisterPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watchPassword && watchPassword.length > 0 && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-1.5">
                          <PasswordRequirement
                            met={passwordStrength.checks.length}
                            text="8+ chars"
                          />
                          <PasswordRequirement
                            met={passwordStrength.checks.uppercase}
                            text="Uppercase"
                          />
                          <PasswordRequirement
                            met={passwordStrength.checks.lowercase}
                            text="Lowercase"
                          />
                          <PasswordRequirement
                            met={passwordStrength.checks.number}
                            text="Number"
                          />
                        </div>
                      )}

                      <FormField
                        control={detailsForm.control}
                        name="agreeToTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="rounded-md"
                              />
                            </FormControl>
                            <div className="leading-none">
                              <FormLabel className="text-[10px] text-slate-500 font-medium">
                                I agree to the{" "}
                                <a
                                  href="/terms"
                                  className="text-[#0075CF] underline"
                                >
                                  Terms
                                </a>{" "}
                                &{" "}
                                <a
                                  href="/privacy"
                                  className="text-[#0075CF] underline"
                                >
                                  Privacy Policy
                                </a>
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-[#0075CF] hover:bg-[#0075CF]/90 text-white font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        {loading ? "Registering..." : "Complete Account"}
                      </Button>
                    </form>
                  </Form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Toggle */}
        <div className="pt-8 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={toggleMode}
              className="text-[#0075CF] hover:underline font-bold"
            >
              {isLogin ? "Create Account" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </AnimatedCharactersLogin>
  );
}
