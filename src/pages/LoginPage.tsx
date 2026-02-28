import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple demo authentication
    if (email === 'admin@mscelectric.io' && password === 'admin123') {
      onLogin();
      toast.success('Welcome back, Admin!');
      navigate('/admin');
    } else {
      toast.error('Invalid credentials. Try admin@mscelectric.io / admin123');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0C0F] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#F2C94C]/5 via-transparent to-transparent" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F2C94C]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#F2C94C]/5 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 md:p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-[#F2C94C]/20 flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-[#F2C94C]" />
            </div>
            <h1 className="font-display font-bold text-2xl text-[#F6F7F9]">
              MSC Electric
            </h1>
            <p className="text-[#A9AFB8] text-sm mt-1">
              Admin Dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-mono text-xs text-[#A9AFB8] mb-2">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6A6D75]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-[#F6F7F9] placeholder:text-[#6A6D75] focus:outline-none focus:border-[#F2C94C] transition-colors"
                  placeholder="admin@mscelectric.io"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-[#A9AFB8] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6A6D75]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-12 py-3 text-[#F6F7F9] placeholder:text-[#6A6D75] focus:outline-none focus:border-[#F2C94C] transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6A6D75] hover:text-[#A9AFB8] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#0B0C0F] border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-[#F2C94C]/10 rounded-lg">
            <p className="text-[#F2C94C] text-xs font-mono text-center">
              Demo: admin@mscelectric.io / admin123
            </p>
          </div>

          {/* Back to Site */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-[#A9AFB8] text-sm hover:text-[#F6F7F9] transition-colors"
            >
              ← Back to website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
