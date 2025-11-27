// src/pages/DriverAuth.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navigation, Chrome } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const DriverAuth = () => {
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
      toast.success("Welcome back, Driver!");
      navigate("/driver");
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      await loginWithGoogle("driver");
      toast.success("Signed in with Google!");
      navigate("/driver");
    } catch (error: any) {
      toast.error(error.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-4 rounded-2xl shadow-lg">
            <Navigation className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Driver Portal</h1>
          <p className="text-gray-400 text-sm">Sign in to start your route</p>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="flex items-center gap-2 text-gray-300 text-sm mb-2">
              <span>📧</span>
              Email
            </label>
            <Input
              type="email"
              placeholder="driver@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-gray-900 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500"
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
              className="h-12 bg-gray-900 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500"
              required
              disabled={loading}
            />
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-medium text-base rounded-lg transition-all shadow-lg"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-gray-800 text-gray-500">OR</span>
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

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Need access?{" "}
            <a href="#" className="text-orange-400 hover:text-orange-300 font-medium">
              Contact Admin
            </a>
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

export default DriverAuth;