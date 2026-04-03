import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, Lock, User, Building2, HardHat, Wrench, Database } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

type UserType = 'admin' | 'client' | 'employee' | 'subcontractor' | 'gc';

interface LoginOption {
  type: UserType;
  label: string;
  icon: React.ElementType;
  description: string;
  demoEmail: string;
  demoPassword: string;
}

const loginOptions: LoginOption[] = [
  {
    type: 'admin',
    label: 'Administrator',
    icon: Building2,
    description: 'Full system access - manage all projects, invoices, and users',
    demoEmail: 'admin@mscelectric.io',
    demoPassword: 'admin123',
  },
  {
    type: 'client',
    label: 'Client',
    icon: User,
    description: 'Track your projects, view invoices, and communicate with the team',
    demoEmail: 'johnson.family@email.com',
    demoPassword: 'client123',
  },
];

export function UnifiedLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated && user) {
    const redirectPath = `/${user.role}`;
    navigate(redirectPath, { replace: true });
    return null;
  }

  const handleTypeSelect = (type: UserType) => {
    setSelectedType(type);
    const option = loginOptions.find(o => o.type === type);
    if (option) {
      setEmail(option.demoEmail);
      setPassword(option.demoPassword);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);

    if (success) {
      // Navigation will happen automatically due to the redirect above
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0C0F] flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0B0C0F] via-[#111318] to-[#1a1d24] flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F2C94C]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#F2C94C]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center">
          <div className="w-24 h-24 rounded-2xl bg-[#F2C94C]/20 flex items-center justify-center mx-auto mb-8">
            <Zap className="w-12 h-12 text-[#F2C94C]" />
          </div>
          <h1 className="font-display font-bold text-4xl text-[#F6F7F9] mb-4">
            MSC Electric
          </h1>
          <p className="text-[#A9AFB8] text-lg max-w-md mb-8">
            Intelligent Project Management Platform
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-[#6A6D75]">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-[#F2C94C]">5000+</p>
              <p>Projects Completed</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-[#F2C94C]">30+</p>
              <p>Years Experience</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-[#F2C94C]">24/7</p>
              <p>Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-[#F2C94C]/20 flex items-center justify-center">
              <Zap className="w-8 h-8 text-[#F2C94C]" />
            </div>
          </div>

          {!selectedType ? (
            // User Type Selection
            <div className="space-y-4">
              <div className="text-center mb-8">
                <h2 className="font-display font-bold text-2xl text-[#F6F7F9] mb-2">
                  Welcome Back
                </h2>
                <p className="text-[#A9AFB8]">
                  Select your account type to continue
                </p>
              </div>

              <div className="space-y-3">
                {loginOptions.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => handleTypeSelect(option.type)}
                    className="w-full glass-card rounded-xl p-4 flex items-center gap-4 hover:border-[#F2C94C]/50 transition-all group text-left"
                  >
                    <div className="w-12 h-12 rounded-lg bg-[#F2C94C]/10 flex items-center justify-center group-hover:bg-[#F2C94C]/20 transition-colors">
                      <option.icon className="w-6 h-6 text-[#F2C94C]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-[#F6F7F9]">
                        {option.label}
                      </h3>
                      <p className="text-[#6A6D75] text-sm">
                        {option.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Login Form
            <div>
              <button
                onClick={() => setSelectedType(null)}
                className="text-[#A9AFB8] text-sm hover:text-[#F6F7F9] mb-6 flex items-center gap-2"
              >
                ← Back
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-xl bg-[#F2C94C]/20 flex items-center justify-center mx-auto mb-4">
                  {(() => {
                    const OptionIcon = loginOptions.find(o => o.type === selectedType)?.icon || User;
                    return <OptionIcon className="w-8 h-8 text-[#F2C94C]" />;
                  })()}
                </div>
                <h2 className="font-display font-bold text-2xl text-[#F6F7F9]">
                  {loginOptions.find(o => o.type === selectedType)?.label} Login
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs text-[#A9AFB8] mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6A6D75]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-[#F6F7F9] placeholder:text-[#6A6D75] focus:outline-none focus:border-[#F2C94C] transition-colors"
                      placeholder="Enter your email"
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
                      placeholder="Enter your password"
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

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-[#A9AFB8] cursor-pointer">
                    <input type="checkbox" className="rounded border-white/20 bg-white/5" />
                    Remember me
                  </label>
                  <a href="#" className="text-[#F2C94C] hover:underline">
                    Forgot password?
                  </a>
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
            </div>
          )}

          {/* Back to Website */}
          <div className="mt-8 text-center">
            <a
              href="/"
              className="text-[#6A6D75] text-sm hover:text-[#A9AFB8] transition-colors"
            >
              ← Back to website
            </a>
          </div>
        </div>
      </div >
    </div >
  );
}
