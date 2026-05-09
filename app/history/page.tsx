'use client'

import React, { useEffect, useState } from 'react';
import { useFirebase } from '@/components/FirebaseProvider';
import { useRouter } from 'next/navigation';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  increment 
} from 'firebase/firestore';
import { 
  ChevronLeft, 
  History as HistoryIcon,
  Clock,
  MapPin,
  MoreVertical,
  Trash2,
  Edit2,
  Check,
  X as CloseIcon,
  WifiOff,
  CloudOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HistoryPage() {
  const { user, loading, isOffline } = useFirebase();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [workouts, setWorkouts] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [showOptionsId, setShowOptionsId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deletingWorkout, setDeletingWorkout] = useState<any | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'workouts'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setWorkouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'workouts history');
    });

    return () => unsubscribe();
  }, [user]);

  const handleEditWorkout = async (e: React.FormEvent, workoutId: string) => {
    e.preventDefault();
    if (!editName.trim()) return;

    try {
      await updateDoc(doc(db, 'workouts', workoutId), {
        name: editName.trim()
      });
      setEditingId(null);
      setEditName('');
    } catch (err) {
      console.error("Error updating workout name:", err);
      handleFirestoreError(err, OperationType.WRITE, `workouts/${workoutId}`);
    }
  };

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

  if (loading || !user) return null;

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      {mounted && isOffline && (
        <div className="bg-orange-500 text-white px-6 py-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] sticky top-0 z-30">
          <WifiOff className="w-3.5 h-3.5" /> Modo Offline Ativado
        </div>
      )}
      <header className="bg-white px-6 pt-12 pb-6 flex flex-col gap-4 sticky top-0 z-20 shadow-sm border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-display font-bold text-slate-900">Histórico Completo</h1>
        </div>
      </header>

      <section className="px-6 py-8">
        {workouts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] p-12 border-2 border-dashed border-slate-100">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4">
              <HistoryIcon className="w-8 h-8" />
            </div>
            <p className="text-slate-400 font-bold">Nenhum treino registrado ainda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <motion.div 
                layout
                key={workout.id} 
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 group relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                      <HistoryIcon className="w-5 h-5" />
                    </div>
                    <div>
                      {editingId === workout.id ? (
                        <form onSubmit={(e) => handleEditWorkout(e, workout.id)} className="flex items-center gap-2">
                          <input 
                            autoFocus
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-slate-50 border-none rounded-lg px-2 py-1 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100"
                          />
                          <button type="submit" className="text-green-500 hover:scale-110 active:scale-95 transition-transform">
                            <Check className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => setEditingId(null)} className="text-red-400">
                            <CloseIcon className="w-4 h-4" />
                          </button>
                        </form>
                      ) : (
                        <h4 className="font-bold text-slate-900 text-sm">{workout.name || 'Pedal de Treino'}</h4>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                        <Clock className="w-3 h-3" />
                        {workout.createdAt?.toDate ? workout.createdAt.toDate().toLocaleDateString('pt-BR') : 'Recentemente'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{(workout.distance || 0).toFixed(1)} km</p>
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{(workout.duration || 0)} min</p>
                    </div>
                    <button 
                      onClick={() => setShowOptionsId(showOptionsId === workout.id ? null : workout.id)}
                      className="p-1 text-slate-300 hover:text-slate-600 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Options Menu */}
                <AnimatePresence>
                  {showOptionsId === workout.id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute top-14 right-4 z-10 bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-1 border border-slate-100 min-w-[140px]"
                    >
                      <button 
                        onClick={() => {
                          setEditingId(workout.id);
                          setEditName(workout.name || '');
                          setShowOptionsId(null);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors rounded-xl mb-1"
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
                        <Trash2 className="w-3.5 h-3.5" /> Excluir Treino
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </section>

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
