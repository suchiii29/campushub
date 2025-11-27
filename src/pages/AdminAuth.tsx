// src/pages/AdminAuth.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Chrome } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const AdminAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    
    try {
      await login(email, password);
      toast.success("Welcome back, Admin!");
      navigate("/admin");
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      await loginWithGoogle("admin");
      toast.success("Signed in with Google!");
      navigate("/admin");
    } catch (error: any) {
      toast.error(error.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400 text-sm">Secure administrator access</p>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="flex items-center gap-2 text-gray-300 text-sm mb-2">
              <span>🔐</span>
              Admin Email
            </label>
            <Input
              type="email"
              placeholder="admin@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
              required
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="flex items-center gap-2 text-gray-300 text-sm mb-2">
              <span>🔒</span>
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
              required
              disabled={loading}
            />
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium text-base rounded-lg transition-all shadow-lg"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Sign In"}
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-gray-900 text-gray-500">OR</span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full h-12 bg-white hover:bg-gray-100 text-gray-900 font-medium text-base rounded-lg transition-all border-0"
            disabled={loading}
          >
            <Chrome className="h-5 w-5 mr-2" />
            Sign in with Google
          </Button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-purple-900/30 border border-purple-700/50 rounded-lg">
          <p className="text-xs text-purple-300 text-center">
            🔒 Secure admin access only. All login attempts are monitored.
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-4">
          <a href="/" className="text-gray-500 hover:text-gray-400 text-sm">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;