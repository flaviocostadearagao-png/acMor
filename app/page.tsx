'use client';

import React from 'react';
import { 
  Bike, 
  MapPin, 
  TrendingUp, 
  Trophy, 
  Users, 
  Activity,
  Play,
  Settings,
  Bell,
  ChevronRight,
  Flame,
  Zap,
  Navigation
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/components/FirebaseProvider';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useFirebase();

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-32">
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bike className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-medium leading-none mb-1">PedalMatch</h1>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">São Paulo, BR</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 bg-white/5 rounded-xl border border-white/5">
            <Bell className="w-5 h-5 text-white/60" />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 border border-white/10 overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
            ) : null}
          </div>
        </div>
      </header>

      <section className="px-6 mt-8">
        <div className="relative h-48 rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl transition-all group-hover:scale-110" />
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2 block">Sessão Rápida</span>
            <h2 className="text-3xl font-display font-medium mb-4">Pronto para o<br/>próximo pedal?</h2>
            <button 
              onClick={() => router.push('/tracking')}
              className="px-6 py-3 bg-white text-blue-700 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              Começar Agora
            </button>
          </div>
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute bottom-4 right-8 z-10"
          >
            <Bike className="w-24 h-24 text-white/10 rotate-12" />
          </motion.div>
        </div>
      </section>

      <section className="px-6 mt-12 grid grid-cols-2 gap-4">
        <div className="bg-slate-900/50 rounded-[2rem] p-6 border border-white/5">
          <div className="w-10 h-10 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-4">
            <Activity className="w-5 h-5 text-orange-500" />
          </div>
          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1">Total Distância</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-display font-bold">128.4</span>
            <span className="text-[10px] font-bold text-white/40">KM</span>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-[2rem] p-6 border border-white/5">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-4">
            <Zap className="w-5 h-5 text-yellow-500" />
          </div>
          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1">Pontos Acumulados</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-display font-bold">4,820</span>
            <span className="text-[10px] font-bold text-white/40">PTS</span>
          </div>
        </div>
      </section>

      <section className="px-6 mt-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Explorar Rotas Próximas</h3>
          <ChevronRight className="w-5 h-5 text-white/20" />
        </div>
        <div className="space-y-4">
           {[1, 2].map((i) => (
             <div key={i} className="bg-slate-900/50 rounded-3xl p-4 border border-white/5 flex items-center gap-4">
               <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center">
                 <Navigation className="w-6 h-6 text-blue-500" />
               </div>
               <div className="flex-1">
                 <h4 className="text-sm font-bold mb-1">Trilha da Cantareira {i}</h4>
                 <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1">
                     <Activity className="w-3 h-3 text-white/30" />
                     <span className="text-[10px] font-bold text-white/40">12km</span>
                   </div>
                   <div className="flex items-center gap-1">
                     <TrendingUp className="w-3 h-3 text-white/30" />
                     <span className="text-[10px] font-bold text-white/40">Ganho 450m</span>
                   </div>
                 </div>
               </div>
               <div className="w-10 h-10 flex items-center justify-center">
                 <ChevronRight className="w-5 h-5 text-white/10" />
               </div>
             </div>
           ))}
        </div>
      </section>
    </main>
  );
}
