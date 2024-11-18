export interface VerifyOtpResponse {
  message: string;
  user?: {
    id: string;
    username: string;
    email: string;
    isVerified: boolean;
  };
}
