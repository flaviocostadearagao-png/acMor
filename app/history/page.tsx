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
  increment,
  getDoc
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
import { WorkoutItem } from '@/components/WorkoutItem';

export default function HistoryPage() {
  const { user, loading, isOffline } = useFirebase();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [workouts, setWorkouts] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);
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
      handleFirestoreError(error, OperationType.LIST, 'workouts');
    });

    return () => unsubscribe();
  }, [user]);

  const handleUpdate = async (workoutId: string, newName: string) => {
    try {
      await updateDoc(doc(db, 'workouts', workoutId), { name: newName });
    } catch (err) {
      console.error("Erro ao atualizar treino:", err);
    }
  };

  const confirmDelete = async () => {
    if (!user || !deletingWorkout) return;

    try {
      // Deletar o treino
      await deleteDoc(doc(db, 'workouts', deletingWorkout.id));
      
      // Decrementar estatísticas
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'stats.totalDistance': increment(-(deletingWorkout.distance || 0)),
        'stats.totalRides': increment(-1),
        'stats.points': increment(-Math.floor((deletingWorkout.distance || 0) * 10))
      });

      setDeletingWorkout(null);
    } catch (err) {
      console.error("Erro ao excluir treino:", err);
    }
  };

  if (loading || !user) return null;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32 transition-colors duration-300">
      {mounted && isOffline && (
        <div className="bg-orange-500 text-white px-6 py-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] sticky top-0 z-30">
          <WifiOff className="w-3.5 h-3.5" /> Modo Offline Ativado
        </div>
      )}
      <header className="bg-white dark:bg-slate-900 px-6 pt-12 pb-6 flex flex-col gap-4 sticky top-0 z-20 shadow-sm border-b border-slate-100 dark:border-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-2 -ml-2 text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Histórico Completo</h1>
        </div>
      </header>

      <section className="px-6 py-8">
        {workouts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 border-2 border-dashed border-slate-100 dark:border-white/5 shadow-sm transition-colors">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 dark:text-white/20 mx-auto mb-4">
              <HistoryIcon className="w-8 h-8" />
            </div>
            <p className="text-slate-400 dark:text-white/40 font-bold">Nenhum treino registrado ainda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <WorkoutItem 
                key={workout.id} 
                workout={workout}
                onUpdate={handleUpdate}
                onDelete={setDeletingWorkout}
              />
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
