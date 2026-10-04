import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, User, ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import { ZekalianLogo } from '../../components/ZekalianLogo';

interface AdminLoginPageProps {
  onNavigate: (route: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { login, loginWithGoogle, currentUser } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // If already logged in, show quick proceed
  if (currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Anda Sedang Masuk sebagai {currentUser.full_name}
          </h2>
          <p className="text-xs text-slate-500">
            Peran: <strong className="uppercase">{currentUser.role}</strong>
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <button
              onClick={() => onNavigate('/admin')}
              className="w-full py-3 rounded-full bg-[#005DDD] text-white font-bold text-sm shadow-md cursor-pointer hover:bg-[#018EE3] transition-all"
            >
              Lanjut ke Dashboard
            </button>
            <button
              onClick={() => onNavigate('/')}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Kembali ke Halaman Publik
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await login(identifier, password);
    setIsLoading(false);

    if (res.success) {
      onNavigate('/admin');
    } else {
      setError(res.error || 'Login gagal.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);
    const res = await loginWithGoogle();
    setIsGoogleLoading(false);

    if (res.success) {
      onNavigate('/admin');
    } else {
      setError(res.error || 'Gagal masuk dengan akun Google.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xl relative overflow-hidden">
        {/* Official Agency Brand Header with Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-4">
            <ZekalianLogo size="lg" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Portal Masuk Admin
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Silakan masukkan kredensial akun Anda untuk mengakses sistem
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Google Sign-in Primary Button */}
        <div className="mb-5">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className="w-full py-3 px-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-xs active:scale-[0.99] cursor-pointer"
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
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleLoading ? 'Menghubungkan Akun Google...' : 'Masuk dengan Akun Google'}</span>
          </button>

          <div className="flex items-center my-4 gap-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[11px] font-bold uppercase text-slate-400">atau akun kredensial</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Identifier: Username / Email */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-1.5">
              Username atau Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Masukkan username atau email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#005DDD] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-700 mb-1.5">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#005DDD] focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full mt-2 py-3.5 rounded-full bg-[#005DDD] hover:bg-[#018EE3] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? <span>Memverifikasi...</span> : <span>Masuk ke Panel</span>}
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda Situs</span>
          </button>
        </form>
      </div>
    </div>
  );
};
