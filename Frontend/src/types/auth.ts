export type UserRole = 'admin' | 'manager' | 'instructor' | 'student';

export interface SendOtpRequest {
  email: string;
  full_name: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface OtpResponse {
  message: string;
  expiresIn?: number;
  full_name?: string;
}
