'use client';

import React, { useEffect, useState } from 'react';
import { useFirebase } from '@/components/FirebaseProvider';
import { useRouter } from 'next/navigation';
import { db, logout, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc,
  setDoc,
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
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

export default function Profile() {
  const { user, loading } = useFirebase();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showOptionsId, setShowOptionsId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    // Listen to profile data
    const profileUnsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        const initialData = {
          displayName: user.displayName || 'Ciclista',
          email: user.email,
          photoURL: user.photoURL,
          bio: 'Adoro pedalar pelos parques da cidade.',
          stats: { totalDistance: 0, totalRides: 0, points: 0 },
          createdAt: new Date().toISOString()
        };
        setDoc(doc(db, 'users', user.uid), initialData).catch(e => console.error("Error creating profile:", e));
      }
    });

    // Listen to user workouts
    const q = query(
      collection(db, 'workouts'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const workoutsUnsubscribe = onSnapshot(q, (snapshot) => {
      setWorkouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      profileUnsubscribe();
      workoutsUnsubscribe();
    };
  }, [user]);

  const handleEditWorkout = async (e: React.FormEvent, workoutId: string) => {
    e.preventDefault();
    if (!user || !editValue.trim()) return;

    try {
      await updateDoc(doc(db, 'workouts', workoutId), {
        name: editValue
      });
      setEditingId(null);
    } catch (err) {
      console.error("Error updating workout name:", err);
    }
  };

  const [deletingWorkout, setDeletingWorkout] = useState<any | null>(null);

  const confirmDelete = async () => {
    if (!user || !deletingWorkout) return;

    try {
      await deleteDoc(doc(db, 'workouts', deletingWorkout.id));
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        "stats.totalDistance": increment(-(deletingWorkout.distance || 0)),
        "stats.totalRides": increment(-1),
        "stats.points": increment(-(Math.floor((deletingWorkout.distance || 0) * 10)))
      });
      setDeletingWorkout(null);
      setShowOptionsId(null);
    } catch (err) {
      console.error("Error deleting workout:", err);
      handleFirestoreError(err, OperationType.WRITE, `workouts/${deletingWorkout.id}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading || !user || !profile) return null;

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <header className="relative bg-white pt-12 pb-8 px-6 rounded-b-[3rem] shadow-sm">
        <div className="absolute top-8 left-6">
          <button onClick={() => router.push('/')} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute top-8 right-6">
          <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-600 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative group cursor-pointer mb-4">
            <div className="w-28 h-28 rounded-[2.5rem] bg-blue-100 overflow-hidden border-4 border-white shadow-xl">
              {user.photoURL ? (
                <Image src={user.photoURL} alt="Profile" width={112} height={112} className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold text-4xl">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-lg group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
          </div>

          <h1 className="text-2xl font-display font-bold text-slate-900">{profile.displayName}</h1>
          <p className="text-slate-400 text-sm mb-4 leading-relaxed max-w-[240px] text-center">
            {profile.bio}
          </p>
          
          <div className="flex items-center gap-2">
            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Ciclista Verificado
            </span>
          </div>
        </div>
      </header>

      <section className="px-6 mt-8">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-4">Estatísticas Vitais</h3>
        <div className="grid grid-cols-2 gap-4">
          <ProfileStat icon={MapPin} label="Total km" value={`${profile.stats?.totalDistance?.toFixed(1) || 0}km`} />
          <ProfileStat icon={Calendar} label="Pedais" value={`${profile.stats?.totalRides || 0}`} />
        </div>
      </section>

      <section className="px-6 mt-8">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-4">Meus Treinos Recentemente</h3>
        <div className="space-y-4">
          {workouts.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-sm italic bg-white rounded-3xl border border-dashed border-slate-200">
              Nenhum treino registrado ainda.
            </p>
          ) : (
            workouts.slice(0, 10).map((workout, idx) => (
              <motion.div 
                key={workout.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 relative"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  {editingId === workout.id ? (
                    <form onSubmit={(e) => handleEditWorkout(e, workout.id)} className="flex items-center gap-2">
                      <input 
                        autoFocus
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="bg-slate-50 border border-blue-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-900 w-full"
                      />
                      <button type="submit" className="text-green-500 hover:scale-110 transition-transform">
                        <Check className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="text-slate-400 hover:scale-110 transition-transform ml-1">
                        <CloseIcon className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <h4 className="font-bold text-slate-900 text-sm truncate">{workout.name || "Pedal sem nome"}</h4>
                      <p className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(workout.createdAt?.seconds * 1000).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 text-sm">{(workout.distance || 0).toFixed(1)}km</p>
                  <button 
                    onClick={() => setShowOptionsId(showOptionsId === workout.id ? null : workout.id)}
                    className="p-1 text-slate-300 hover:text-slate-600 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <AnimatePresence>
                  {showOptionsId === workout.id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-4 top-12 w-40 bg-white shadow-2xl border border-slate-100 rounded-2xl p-1 z-30"
                    >
                      <button 
                        onClick={() => {
                          setEditingId(workout.id);
                          setEditValue(workout.name || "");
                          setShowOptionsId(null);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors rounded-xl"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Editar Nome
                      </button>
                      <button 
                        onClick={() => {
                          setDeletingWorkout(workout);
                          setShowOptionsId(null);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors rounded-xl"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Excluir
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </section>

      <section className="px-6 mt-8">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-4">Preferências</h3>
        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100">
           <ProfileLink icon={Bell} label="Notificações" detail="Ativado" />
           <ProfileLink icon={Share2} label="Sincronizar Celular" detail="Configurado" />
           <ProfileLink icon={Heart} label="Favoritos" detail="12 rotas" />
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-4 p-5 text-red-500 hover:bg-red-50 transition-colors"
           >
             <LogOut className="w-5 h-5" />
             <span className="flex-1 text-left font-bold text-sm">Sair da Conta</span>
             <ChevronRight className="w-4 h-4" />
           </button>
        </div>
      </section>

      <div className="px-6 mt-8 text-center">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">PedalMatch v0.1.0 (BETA)</p>
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
              className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 text-center mb-2">Excluir Treino?</h3>
              <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">
                Esta ação excluirá permanentemente o treino <span className="font-bold text-slate-900">"{deletingWorkout.name || 'Pedal sem nome'}"</span> e não pode ser desfeita.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeletingWorkout(null)}
                  className="flex-1 h-16 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors"
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
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600 mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-lg font-display font-bold text-slate-900 leading-tight">{value}</p>
    </div>
  );
}

function ProfileLink({ icon: Icon, label, detail }: { icon: any, label: string, detail: string }) {
  return (
    <div className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-slate-900">{label}</h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{detail}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300" />
    </div>
  );
}
