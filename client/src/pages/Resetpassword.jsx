import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/user/reset-request`, { email });
      toast.success(res.data.msg || "Reset code sent to your email");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to send reset code");
    }
    setLoading(false);
  };

  const handleCodeVerify = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/user/verify-reset-code`, { email, code });
      toast.success(res.data.msg || "Code verified");
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Invalid or expired code");
    }
    setLoading(false);
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/user/set-new-password`, {
        email,
        code,
        newPassword
      });
      toast.success(res.data.msg || "Password reset successful");
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to reset password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-12">
  <div className="w-full max-w-md">
    {/* Card */}
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
      {/* Logo / Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
        <p className="text-gray-600 mt-2">
          {step === 1 && "Enter your email to receive a reset code"}
          {step === 2 && "Check your email for the 6-digit code"}
          {step === 3 && "Choose a strong new password"}
        </p>
      </div>

      {/* Step 1: Email */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder-gray-400"
              required
            />
          </div>

          <button
            onClick={handleEmailSubmit}
            disabled={loading || !email}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            {loading ? "Sending Code..." : "Send Reset Code"}
          </button>
        </div>
      )}

      {/* Step 2: Verify Code */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              placeholder="123456"
              maxLength="6"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // only numbers
              className="w-full px-4 py-3 text-center text-2xl tracking-widest font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
            />
            <p className="text-xs text-gray-500 text-center mt-2">Check your spam folder if not received</p>
          </div>

          <button
            onClick={handleCodeVerify}
            disabled={loading || code.length !== 6}
            className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </div>
      )}

      {/* Step 3: New Password */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-gray-900"
              required
            />
            <p className="text-xs text-gray-500 mt-2">Minimum 8 characters</p>
          </div>

          <button
            onClick={handlePasswordReset}
            disabled={loading || newPassword.length < 8}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            {loading ? "Updating..." : "Set New Password"}
          </button>
        </div>
      )}

      {/* Back to Login */}
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/login')}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
        >
          Back to Login
        </button>
      </div>
    </div>

    {/* Optional: Success Message or Brand */}
    <p className="text-center text-gray-500 text-sm mt-8">
      Secured by YourApp • {new Date().getFullYear()}
    </p>
  </div>
</div>
  );
}
