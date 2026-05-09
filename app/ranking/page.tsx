'use client';

import React, { useEffect, useState } from 'react';
import { useFirebase } from '@/components/FirebaseProvider';
import { useRouter } from 'next/navigation';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { 
  Trophy, 
  ChevronRight, 
  Medal, 
  Activity, 
  Bike,
  Star,
  Users,
  ChevronLeft,
  WifiOff,
  CloudLightning
} from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Ranking() {
  const { user, loading, isOffline } = useFirebase();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users'),
      orderBy('stats.points', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    return () => unsubscribe();
  }, [user]);

  if (loading || !user) return null;

  const topThree = users.slice(0, 3);
  const remaining = users.slice(3);

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {mounted && isOffline && (
        <div className="bg-orange-500 text-white px-6 py-2.5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] sticky top-0 z-50">
          <WifiOff className="w-3.5 h-3.5" /> Modo Offline Ativado • Dados podem estar desatualizados
        </div>
      )}
      <header className="bg-blue-600 px-6 pt-12 pb-16 rounded-b-[4rem] text-center text-white shadow-xl shadow-blue-100 flex flex-col items-center relative">
        <button 
          onClick={() => router.push('/')} 
          className="absolute left-6 top-12 p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/30 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-display font-bold mb-8">Pedal Ranking</h1>
        
        {/* Podium */}
        <div className="flex items-end justify-center gap-4 w-full max-w-sm mb-4">
          {/* 2nd Place */}
          {topThree[1] && (
            <PodiamRank 
              user={topThree[1]} 
              rank={2} 
              height="h-28" 
              color="bg-slate-300" 
              iconColor="text-slate-500" 
            />
          )}
          {/* 1st Place */}
          {topThree[0] && (
            <PodiamRank 
              user={topThree[0]} 
              rank={1} 
              height="h-36" 
              color="bg-yellow-400" 
              iconColor="text-yellow-700" 
              isCenter 
            />
          )}
          {/* 3rd Place */}
          {topThree[2] && (
            <PodiamRank 
              user={topThree[2]} 
              rank={3} 
              height="h-24" 
              color="bg-orange-300" 
              iconColor="text-orange-700" 
            />
          )}
        </div>
      </header>

      <div className="px-6 -mt-8">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 p-2 border border-slate-50">
          <div className="flex items-center gap-4 p-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
            <span className="w-8 ml-2">#</span>
            <span className="flex-1">Ciclista</span>
            <span className="text-right mr-2">Pontos</span>
          </div>

          <div className="space-y-1">
            {remaining.map((u, idx) => (
              <motion.div 
                key={u.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors ${u.id === user.uid ? 'bg-blue-50 ring-1 ring-blue-100' : ''}`}
              >
                <span className="w-8 ml-2 text-sm font-display font-bold text-slate-400">{idx + 4}</span>
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden">
                    {u.photoURL ? (
                      <Image src={u.photoURL} alt={u.displayName} width={40} height={40} className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold bg-slate-100">
                        {u.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{u.displayName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{u.stats?.totalRides || 0} pedais</p>
                  </div>
                </div>
                <div className="text-right mr-2">
                  <p className="text-sm font-display font-bold text-blue-600">{u.stats?.points || 0}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {remaining.length === 0 && (
            <div className="p-12 text-center text-slate-400">
               <Trophy className="w-12 h-12 mx-auto mb-4 opacity-10" />
               <p className="text-sm">Explore o ranking completo pedalando!</p>
            </div>
          )}
        </div>
      </div>

    </main>
  );
}

function PodiamRank({ user, rank, height, color, iconColor, isCenter }: { user: any, rank: number, height: string, color: string, iconColor: string, isCenter?: boolean }) {
  return (
    <div className={`flex flex-col items-center ${isCenter ? 'z-10' : ''}`}>
      <div className={`relative ${isCenter ? 'w-20 h-20' : 'w-16 h-16'} rounded-full mb-3`}>
        <div className={`absolute inset-0 rounded-full border-4 border-white overflow-hidden shadow-lg`}>
          {user.photoURL ? (
            <Image src={user.photoURL} alt={user.displayName} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl uppercase">
               {user.displayName?.charAt(0)}
            </div>
          )}
        </div>
        <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 ${color} rounded-full flex items-center justify-center shadow-md`}>
           {rank === 1 ? <Star className={`w-4 h-4 ${iconColor}`} /> : <span className={`text-xs font-bold ${iconColor}`}>{rank}</span>}
        </div>
      </div>
      <p className="text-[10px] font-bold text-white mb-2 max-w-[80px] truncate">{user.displayName}</p>
      <div className={`${height} w-16 bg-white/10 backdrop-blur-md rounded-t-2xl flex flex-col items-center pt-2`}>
        <p className="text-xs font-bold text-white">{user.stats?.points || 0}</p>
        <p className="text-[8px] font-bold text-white/50 uppercase tracking-widest leading-none">PTS</p>
      </div>
    </div>
  );
}
