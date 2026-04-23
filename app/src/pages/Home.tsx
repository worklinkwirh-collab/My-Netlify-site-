import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Shield, TrendingUp, Landmark, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import BlueprintGlobe from '@/components/BlueprintGlobe';
import { initializeStore, getUserByEmail, setSession, generateId, generateOtp } from '@/lib/store';

type LoginMode = 'login' | 'otp';

export default function Home() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<LoginMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showOtpDisplay, setShowOtpDisplay] = useState(false);

  initializeStore();

  // 🔐 SINGLE LOGIN HANDLER (USER + ADMIN)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = getUserByEmail(email);

    if (!user) {
      setError('Invalid credentials. Please check your email.');
      return;
    }

    if (password !== user.pin) {
      setError('Invalid PIN. Please try again.');
      return;
    }

    const otp = generateOtp();
    setGeneratedOtp(otp);
    setShowOtpDisplay(true);
    setMode('otp');
  };

  // 🔐 OTP VERIFICATION + ROLE ROUTING
  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otpCode !== generatedOtp) {
      setError('Invalid verification code. Please try again.');
      return;
    }

    const user = getUserByEmail(email);

    if (!user) {
      setError('Session expired. Please login again.');
      setMode('login');
      return;
    }

    if (user.role === 'admin') {
      const session = {
        role: 'admin' as const,
        email: user.email,
        token: generateId('tkn'),
        expiresAt: Date.now() + 3600000,
      };
      setSession(session);
      navigate('/admin');
    } else {
      const session = {
        role: 'user' as const,
        userId: user.id,
        email: user.email,
        token: generateId('tkn'),
        expiresAt: Date.now() + 3600000,
      };
      setSession(session);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#001233]">
      
      {/* NAVIGATION */}
      <nav className="h-20 bg-white/5 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-[#3A86FF]" />
          <div className="text-white text-xl tracking-wider">
            <span className="font-bold">ATLAS</span>
            <span className="font-light ml-1">LEDGER</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <span className="text-white/80">Business Banking</span>
          <span>Institutional Trading</span>
          <span>Global Transfers</span>
          <span>Crypto Services</span>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="relative min-h-[600px] flex">
        <div className="absolute inset-0 bg-gradient-to-r from-[#001233] via-[#001845] to-[#001233]" />

        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-8 px-6 lg:px-12 py-16 items-center">

          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-semibold text-white leading-tight">
              Global Financial
              <br />
              Network
            </h1>

            <p className="text-lg text-white/60 max-w-md">
              Real-time business banking, institutional trading, and secure multi-currency accounts for enterprises worldwide.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-[#2A9D8F] text-sm">
                <Shield className="w-5 h-5" />
                <span>Bank-Grade Security</span>
              </div>

              <div className="flex items-center gap-2 text-[#3A86FF] text-sm">
                <TrendingUp className="w-5 h-5" />
                <span>Real-Time Trading</span>
              </div>

              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Landmark className="w-5 h-5" />
                <span>FDIC Insured</span>
              </div>
            </div>
          </div>

          <div className="h-[400px] lg:h-[500px] relative">
            <BlueprintGlobe />
          </div>
        </div>
      </div>

      {/* LOGIN SECTION */}
      <div className="bg-[#EDF2FB] py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          <div className="grid lg:grid-cols-2 gap-12 items-start">

            {/* LEFT INFO */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-[#001845] mb-4">
                  Institutional-Grade Banking
                </h2>

                <p className="text-[#5C677D]">
                  AtlasLedger provides comprehensive financial services for businesses including multi-currency accounts, wire transfers, crypto trading, and loan facilities.
                </p>
              </div>
            </div>

            {/* LOGIN BOX */}
            <div className="bg-white p-8 shadow-lg">

              {error && (
                <div className="flex items-center gap-2 p-3 bg-[#E63946]/10 text-[#E63946] text-sm mb-4">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {showOtpDisplay && generatedOtp && (
                <div className="p-4 bg-[#2A9D8F]/10 border border-[#2A9D8F] mb-4">
                  <p className="text-xs text-[#5C677D] uppercase tracking-wider mb-1">
                    Verification Code
                  </p>
                  <p className="text-3xl font-mono font-bold text-[#001845] tracking-[0.5em]">
                    {generatedOtp}
                  </p>
                </div>
              )}

              {mode === 'otp' ? (
                <form onSubmit={handleOtpVerify} className="space-y-4">

                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    placeholder="000000"
                    className="w-full px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] font-mono text-center tracking-[0.3em]"
                    maxLength={6}
                  />

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#001233] text-white text-sm font-medium hover:bg-[#001845]"
                  >
                    Verify & Access Account
                  </button>

                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA]"
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="PIN"
                      className="w-full px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] pr-10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#001233] text-white text-sm font-medium hover:bg-[#001845]"
                  >
                    <Lock className="w-4 h-4 inline mr-2" />
                    Secure Login
                  </button>

                </form>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#001233] border-t border-white/10 py-8 px-6 lg:px-12">
        <div className="text-white/40 text-xs text-center">
          AtlasLedger Financial Services © 2026
        </div>
      </footer>

    </div>
  );
}