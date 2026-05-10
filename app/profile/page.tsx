'use client';

import React, { useEffect, useState } from 'react';
import { useFirebase } from '@/components/FirebaseProvider';
import { useRouter } from 'next/navigation';
import { db, logout } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc,
  deleteDoc,
  increment
} from 'firebase/firestore';
import { 
  User, 
  Settings, 
  LogOut, 
  Mail, 
  Calendar, 
  MapPin, 
  Edit3, 
  ChevronRight,
  Shield,
  Heart,
  Share2,
  Bell,
  Camera,
  Activity,
  Clock,
  MoreVertical,
  Trash2,
  Edit2,
  Check,
  X as CloseIcon,
  ChevronLeft,
  TrendingUp,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { WorkoutItem } from '@/components/WorkoutItem';

export default function Profile() {
  const { user, loading } = useFirebase();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, 'users', user.uid);
    const unsubscribeProfile = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        setProfile(snap.data());
      }
    });

    const workoutsQuery = query(
      collection(db, 'workouts'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeWorkouts = onSnapshot(workoutsQuery, (snap) => {
      setWorkouts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeProfile();
      unsubscribeWorkouts();
    };
  }, [user]);

  const handleUpdate = async (workoutId: string, newName: string) => {
    try {
      await updateDoc(doc(db, 'workouts', workoutId), { name: newName });
    } catch (err) {
      console.error("Erro ao atualizar treino:", err);
    }
  };

  const [deletingWorkout, setDeletingWorkout] = useState<any | null>(null);

  const confirmDelete = async () => {
    if (!user || !deletingWorkout) return;

    try {
      await deleteDoc(doc(db, 'workouts', deletingWorkout.id));
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'stats.totalDistance': increment(-(deletingWorkout.distance || 0)),
        'stats.totalRides': increment(-1),
        'stats.points': increment(-Math.floor((deletingWorkout.distance || 0) * 10))
      });

      setDeletingWorkout(null);
    } catch (err) {
      console.error("Erro ao deletar treino:", err);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading || !user || !profile) return null;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32 transition-colors duration-300">
      <header className="relative bg-white dark:bg-slate-900 pt-12 pb-8 px-6 rounded-b-[3rem] shadow-sm border-b border-slate-100 dark:border-white/5 transition-colors">
        <div className="absolute top-8 left-6">
          <button onClick={() => router.push('/')} className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute top-8 right-6">
          <button className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative group cursor-pointer mb-4">
            <div className="w-28 h-28 rounded-[2.5rem] bg-blue-100 dark:bg-blue-500/20 overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
              {profile.photoURL ? (
                <Image src={profile.photoURL} alt="Profile" width={112} height={112} className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-4xl">
                  {profile.displayName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white border-4 border-white dark:border-slate-800 shadow-lg group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
          </div>

          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white transition-colors">{profile.displayName}</h1>
          <p className="text-slate-400 dark:text-white/40 text-sm mb-4 leading-relaxed max-w-[240px] text-center transition-colors">
            {profile.bio}
          </p>
          
          <div className="flex items-center gap-2">
            <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100 dark:border-blue-500/20 flex items-center gap-1.5 transition-colors">
              <Shield className="w-3.5 h-3.5" /> Ciclista Verificado
            </span>
          </div>
        </div>
      </header>

      <section className="px-6 mt-8">
        <h3 className="text-xs font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest ml-1 mb-4">Estatísticas Vitais</h3>
        <div className="grid grid-cols-2 gap-4">
          <ProfileStat icon={MapPin} label="Total km" value={`${profile.stats?.totalDistance?.toFixed(1) || 0}km`} />
          <ProfileStat icon={TrendingUp} label="Este Mês" value={`${profile.stats?.monthlyDistance?.toFixed(1) || 0}km`} />
          <ProfileStat icon={Calendar} label="Pedais" value={`${profile.stats?.totalRides || 0}`} />
          <ProfileStat icon={Trophy} label="Recorde" value={`${profile.records?.longestRide?.toFixed(1) || 0}km`} />
        </div>
      </section>

      <section className="px-6 mt-8">
        <h3 className="text-xs font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest ml-1 mb-4">Recordes Pessoais</h3>
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-white/5 shadow-sm space-y-6 transition-colors">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 relative">
                    <Trophy className="w-5 h-5" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white dark:border-slate-900"></div>
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Maior Distância</h4>
                    <p className="text-[10px] text-slate-400 dark:text-white/30 font-bold uppercase tracking-wider">Seu melhor pedal único</p>
                 </div>
              </div>
              <p className="text-lg font-display font-bold text-blue-600 dark:text-blue-400">{(profile.longest_ride || 0).toFixed(1)} <span className="text-[10px] uppercase">km</span></p>
           </div>
           
           <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-white/5">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                    <Activity className="w-5 h-5" />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Consistência</h4>
                    <p className="text-[10px] text-slate-400 dark:text-white/30 font-bold uppercase tracking-wider">Pontos acumulados</p>
                 </div>
              </div>
              <p className="text-lg font-display font-bold text-slate-900 dark:text-white">{profile.points || 0} <span className="text-[10px] uppercase">pts</span></p>
           </div>
        </div>
      </section>

      <section className="px-6 mt-8">
        <h3 className="text-xs font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest ml-1 mb-4">Meus Treinos Recentemente</h3>
        <div className="space-y-4">
          {workouts.length === 0 ? (
            <p className="text-center py-8 text-slate-400 dark:text-white/20 text-sm italic bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-white/5 transition-colors">
              Nenhum treino registrado ainda.
            </p>
          ) : (
            workouts.slice(0, 5).map((workout) => (
              <WorkoutItem 
                key={workout.id}
                workout={workout}
                onUpdate={handleUpdate}
                onDelete={setDeletingWorkout}
              />
            ))
          )}
        </div>
      </section>


      <section className="px-6 mt-8">
        <h3 className="text-xs font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest ml-1 mb-4">Preferências</h3>
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 dark:border-white/5 transition-colors">
           <ProfileLink icon={Bell} label="Notificações" detail="Ativado" />
           <ProfileLink icon={Share2} label="Sincronizar Celular" detail="Configurado" />
           <ProfileLink icon={Heart} label="Favoritos" detail="12 rotas" />
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-4 p-5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
           >
             <LogOut className="w-5 h-5" />
             <span className="flex-1 text-left font-bold text-sm">Sair da Conta</span>
             <ChevronRight className="w-4 h-4" />
           </button>
        </div>
      </section>

      <div className="px-6 mt-8 text-center">
        <p className="text-[10px] font-bold text-slate-300 dark:text-white/10 uppercase tracking-[0.3em] transition-colors">PedalMatch v0.1.0 (BETA)</p>
      </div>

      <AnimatePresence>
        {deletingWorkout && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl transition-colors duration-300"
            >
              <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white text-center mb-2">Excluir Treino?</h3>
              <p className="text-slate-500 dark:text-white/40 text-center text-sm mb-8 leading-relaxed">
                Esta ação excluirá permanentemente o treino <span className="font-bold text-slate-900 dark:text-white">&quot;{deletingWorkout.name || 'Pedal sem nome'}&quot;</span> e não pode ser desfeita.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeletingWorkout(null)}
                  className="flex-1 h-16 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white rounded-2xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 h-16 bg-red-500 text-white rounded-2xl font-bold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function ProfileStat({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 flex flex-col items-center text-center transition-colors">
      <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest transition-colors">{label}</p>
      <p className="text-lg font-display font-bold text-slate-900 dark:text-white leading-tight transition-colors">{value}</p>
    </div>
  );
}

function ProfileLink({ icon: Icon, label, detail }: { icon: any, label: string, detail: string }) {
  return (
    <div className="flex items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-50 dark:border-white/5 last:border-0 cursor-pointer">
      <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 dark:text-white/20 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white transition-colors">{label}</h4>
        <p className="text-[10px] text-slate-400 dark:text-white/20 font-bold uppercase tracking-widest transition-colors">{detail}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-white/10 transition-colors" />
    </div>
  );
}
