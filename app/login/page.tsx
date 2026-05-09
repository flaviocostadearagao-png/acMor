'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/components/FirebaseProvider';
import { 
  signInWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  resetPassword 
} from '@/lib/firebase';
import { 
  Bike, 
  MapPin, 
  Trophy, 
  ExternalLink, 
  AlertCircle, 
  Loader2, 
  Mail, 
  Lock, 
  ArrowRight, 
  UserPlus 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

export default function LoginPage() {
  const { user, loading } = useFirebase();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError("O popup de login foi bloqueado. Por favor, permita popups.");
      } else if (err.code !== 'auth/cancelled-by-user') {
        setError("Erro ao tentar entrar. Tente abrir em uma nova aba.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoggingIn(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else if (mode === 'register') {
        if (password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres.');
        }
        await registerWithEmail(email, password);
      } else {
        await resetPassword(email);
        setSuccess("E-mail de recuperação enviado!");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/user-not-found') setError("Usuário não encontrado.");
      else if (err.code === 'auth/wrong-password') setError("Senha incorreta.");
      else if (err.code === 'auth/email-already-in-use') setError("E-mail já cadastrado.");
      else if (err.code === 'auth/invalid-email') setError("E-mail inválido.");
      else setError(err.message || "Ocorreu um erro no acesso.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100"
      >
        <div className="pt-10 pb-6 px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-lg shadow-blue-200">
            <Bike className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-1">PedalMatch</h1>
          <p className="text-slate-500 text-sm">Conecte-se com ciclistas e descubra novas rotas.</p>
        </div>

        <div className="px-8 pb-10 space-y-6">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none text-slate-900"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none text-slate-900"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar Conta' : 'Enviar Link'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-400 font-bold tracking-widest">OU</span></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-4 px-6 border-2 border-slate-100 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
          >
            <Image 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              width={20} 
              height={20} 
              className="w-5 h-5"
              referrerPolicy="no-referrer"
            />
            <span>Entrar com Google</span>
          </button>

          <AnimatePresence>
            {(error || success) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`${error ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'} border p-4 rounded-2xl flex items-start gap-2 overflow-hidden`}
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-tight">{error || success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-3 pt-2">
            {mode === 'login' ? (
              <>
                <button onClick={() => setMode('register')} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Não tem conta? Cadastre-se
                </button>
                <button onClick={() => setMode('reset')} className="text-xs font-medium text-slate-400 hover:text-slate-600">
                  Esqueceu a senha?
                </button>
              </>
            ) : (
              <button onClick={() => setMode('login')} className="text-sm font-bold text-blue-600 hover:text-blue-700">
                Já tem conta? Faça login
              </button>
            )}
          </div>

          <div className="pt-4 border-t border-slate-50 text-center">
             <p className="text-[10px] text-slate-400 mb-3 px-4 leading-relaxed line-clamp-2">
               Dica: Browsers em iFrames podem bloquear o login. Se tiver problemas, use o botão abaixo.
             </p>
             <a 
               href={typeof window !== 'undefined' ? window.location.href : '#'} 
               target="_blank" 
               rel="noopener noreferrer"
               className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
             >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir em Nova Aba
             </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
