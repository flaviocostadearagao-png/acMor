'use client';

import React, { useState } from 'react';
import { 
  History as HistoryIcon,
  Clock,
  MoreVertical,
  Trash2,
  Edit2,
  Check,
  X as CloseIcon,
  Activity,
  Map as MapIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkoutMap } from './WorkoutMap';

import { Workout } from '@/lib/types';

interface WorkoutItemProps {
  workout: Workout;
  onUpdate: (workoutId: string, newName: string) => Promise<void>;
  onDelete: (workout: Workout) => void;
  dark?: boolean;
}

export function WorkoutItem({ workout, onUpdate, onDelete }: WorkoutItemProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(workout.name || '');
  const [showMap, setShowMap] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    await onUpdate(workout.id, editName.trim());
    setIsEditing(false);
  };

  return (
    <motion.div 
      layout
      className="bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 p-5 rounded-[2rem] shadow-sm border group relative overflow-hidden transition-colors duration-300"
    >
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 dark:bg-blue-500/20 text-blue-500 dark:text-blue-400 w-10 h-10 rounded-2xl flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            {isEditing ? (
              <form onSubmit={handleUpdate} className="flex items-center gap-2">
                <input 
                  autoFocus
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white border-none rounded-lg px-2 py-1 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <button type="submit" className="text-green-500 hover:scale-110 active:scale-95 transition-transform">
                  <Check className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="text-red-400">
                  <CloseIcon className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{workout.name || 'Pedal de Treino'}</h4>
            )}
            <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-white/40 font-medium">
              <Clock className="w-3 h-3" />
              {workout.createdAt instanceof Date 
                ? workout.createdAt.toLocaleDateString('pt-BR') 
                : (workout.createdAt as any)?.toDate?.()?.toLocaleDateString('pt-BR') || 'Recente'}
            </div>
          </div>
        </div>
        <div className="text-right flex items-center gap-2">
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">{(workout.distance || 0).toFixed(1)} km</p>
            <p className="text-slate-400 dark:text-white/40 text-[10px] uppercase font-bold tracking-wider">{(workout.avgSpeed || 0).toFixed(1)} km/h</p>
          </div>
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="p-1 text-slate-400 dark:text-white/40 hover:text-blue-500 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {workout.path && workout.path.length > 0 && (
        <div className="mt-4">
            <button 
                onClick={() => setShowMap(!showMap)}
                className="w-full py-3 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40"
            >
                <MapIcon className="w-3.5 h-3.5" />
                {showMap ? 'Fechar Mapa' : 'Ver Trilha'}
            </button>
            
            <AnimatePresence>
                {showMap && (
                    <motion.div 
                        key="workout-map-container"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 160, opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 rounded-2xl overflow-hidden relative border border-slate-100 dark:border-white/5 shadow-inner"
                    >
                        <WorkoutMap 
                            currentLocation={workout.path[0]} 
                            path={workout.path} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      )}

      {/* Options Menu */}
      <AnimatePresence>
        {showOptions && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setShowOptions(false)} />
            <motion.div 
              key="options-backdrop"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-14 right-4 z-30 bg-white dark:bg-slate-800 shadow-xl dark:shadow-3xl rounded-2xl p-1 border border-slate-100 dark:border-white/10 min-w-[140px] transition-colors"
            >
              <button 
                onClick={() => {
                  setIsEditing(true);
                  setShowOptions(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-600 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors rounded-xl mb-1"
              >
                <Edit2 className="w-3.5 h-3.5" /> Editar Nome
              </button>
              <button 
                onClick={() => {
                  onDelete(workout);
                  setShowOptions(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors rounded-xl"
              >
                <Trash2 className="w-3.5 h-3.5" /> Excluir Treino
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
