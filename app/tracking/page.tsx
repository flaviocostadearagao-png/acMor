'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useFirebase } from '@/components/FirebaseProvider';
import { useRouter } from 'next/navigation';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  increment 
} from 'firebase/firestore';
import { 
  Play, 
  Square, 
  Timer, 
  Navigation, 
  Map as MapIcon, 
  Activity,
  ChevronLeft,
  AlertTriangle,
  Flame,
  Zap,
  TrendingUp,
  Trophy,
  Share2,
  Calendar,
  WifiOff,
  CloudOff,
  CloudLightning
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkoutMap } from '@/components/WorkoutMap';

interface WorkoutSummary {
  distance: number;
  duration: number;
  avgSpeed: number;
  path: {lat: number, lng: number, timestamp: number}[];
  date: string;
}

export default function TrackingPage() {
  const { user, loading, isOffline } = useFirebase();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [avgSpeed, setAvgSpeed] = useState(0);
  const [path, setPath] = useState<{lat: number, lng: number, timestamp: number}[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [summary, setSummary] = useState<WorkoutSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isRecording) {
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const newPoint = { lat: latitude, lng: longitude, timestamp: Date.now() };
            
            setCurrentLocation({ lat: latitude, lng: longitude });
            setPath(prev => [...prev, newPoint]);
            
            if (path.length > 0) {
              const lastPoint = path[path.length - 1];
              const d = calculateDistance(lastPoint.lat, lastPoint.lng, latitude, longitude);
              setDistance(prev => prev + d);
            }
          },
          (err) => setError(err.message),
          { enableHighAccuracy: true }
        );
      }
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    }
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isRecording]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  useEffect(() => {
    if (duration > 0) {
      const speedKmh = (distance / (duration / 3600));
      setAvgSpeed(parseFloat(speedKmh.toFixed(1)));
    }
  }, [duration, distance]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleStart = () => {
    setIsRecording(true);
    setDuration(0);
    setDistance(0);
    setPath([]);
  };

  const handleStop = () => {
    setIsRecording(false);
    setSummary({
      distance,
      duration,
      avgSpeed,
      path,
      date: new Date().toLocaleDateString('pt-BR')
    });
  };

  const handleSave = async () => {
    if (!user || !summary) return;
    setIsSaving(true);
    
    try {
      if (isOffline) {
        const localWorkouts = JSON.parse(localStorage.getItem('pedalmatch_offline_workouts') || '[]');
        localWorkouts.push({
          ...summary,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          status: 'pending_sync'
        });
        localStorage.setItem('pedalmatch_offline_workouts', JSON.stringify(localWorkouts));
        router.push('/history');
      } else {
        await addDoc(collection(db, 'workouts'), {
          userId: user.uid,
          distance: summary.distance,
          duration: summary.duration,
          avgSpeed: summary.avgSpeed,
          path: summary.path,
          date: summary.date,
          createdAt: serverTimestamp()
        });
        
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          'stats.totalDistance': increment(summary.distance),
          'stats.totalRides': increment(1),
          'stats.points': increment(Math.floor(summary.distance * 10))
        });
        
        router.push('/history');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'workouts');
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !user) return null;

  return (
    <main className="min-h-screen bg-slate-900 text-white pb-12 overflow-hidden flex flex-col">
      <header className="p-6 flex items-center justify-between">
        <button onClick={() => router.push('/')} className="text-white/60 hover:text-white transition-colors">
          <ChevronLeft className="w-8 h-8" />
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 ${mounted && isOffline ? 'bg-orange-500' : 'bg-green-500'} rounded-full animate-pulse`} />
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">
              {mounted && isOffline ? 'Modo Offline Ativo' : 'Sessão Online'}
            </span>
          </div>
        </div>
        <div className="w-8 h-8" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-12 px-6">
        <div className="text-center">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mb-4 block">Tempo Decorrido</span>
          <h1 className="text-7xl font-display font-medium tracking-tighter tabular-nums">{formatTime(duration)}</h1>
        </div>

        <div className="grid grid-cols-2 gap-8 w-full max-w-sm">
          <div className="text-center">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1 block">Distância</span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-display font-medium">{distance.toFixed(2)}</span>
              <span className="text-xs font-bold text-white/40">KM</span>
            </div>
          </div>
          <div className="text-center">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1 block">Vel. Média</span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-display font-medium">{avgSpeed}</span>
              <span className="text-xs font-bold text-white/40">KM/H</span>
            </div>
          </div>
        </div>

        <div className="w-full aspect-square max-w-sm bg-slate-800/50 rounded-[2.5rem] border border-white/5 overflow-hidden relative group">
          <WorkoutMap currentLocation={currentLocation} path={path} />
          
          <div className="absolute top-4 left-4 z-10">
            <div className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
              <Navigation className="w-5 h-5 text-blue-400" />
            </div>
          </div>

          <div className="absolute top-4 right-4 z-10">
            <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-[9px] font-black uppercase tracking-wider text-white/80">Sinal GPS Forte</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-12 mt-12 flex items-center justify-center relative">
        {mounted && isOffline && !summary && (
          <div className="absolute -top-12 left-0 right-0 flex justify-center">
            <div className="bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-2xl flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-orange-500" />
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Gravando localmente</span>
            </div>
          </div>
        )}

        {!isRecording ? (
          <button 
            onClick={handleStart}
            className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all"
          >
            <Play className="w-8 h-8 fill-current ml-1" />
          </button>
        ) : (
          <div className="flex items-center justify-center gap-6 w-full">
             <div className="flex items-center gap-8">
                <button 
                  onClick={() => setIsRecording(false)}
                  className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-xl border border-white/10 hover:bg-white/20 transition-all"
                >
                  <Timer className="w-6 h-6" />
                </button>
                <button 
                  onClick={handleStop}
                  className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-red-500/40 hover:scale-105 active:scale-95 transition-all"
                >
                  <Square className="w-8 h-8 fill-current" />
                </button>
              </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {summary && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-50 bg-slate-950 flex flex-col pt-12 overflow-hidden"
          >
            <div className="px-6 flex items-center justify-between mb-8">
              <button onClick={() => setSummary(null)} className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Relatório de Treino</h2>
              <div className="w-10 h-10" />
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-6">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/5 text-center">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-2 block">Pedal Concluído!</span>
                <h3 className="text-4xl font-display font-medium text-white mb-8">Excelente trabalho!</h3>
                <div className="grid grid-cols-3 gap-4">
                   <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                      <div className="text-blue-400 mb-2 flex justify-center"><Activity className="w-5 h-5" /></div>
                      <div className="text-lg font-display font-bold">{summary.distance.toFixed(1)}</div>
                      <div className="text-[8px] font-black text-white/30 uppercase">KM</div>
                   </div>
                   <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                      <div className="text-orange-400 mb-2 flex justify-center"><Timer className="w-5 h-5" /></div>
                      <div className="text-lg font-display font-medium">{formatTime(summary.duration)}</div>
                      <div className="text-[8px] font-black text-white/30 uppercase">Tempo</div>
                   </div>
                   <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                      <div className="text-green-400 mb-2 flex justify-center"><TrendingUp className="w-5 h-5" /></div>
                      <div className="text-lg font-display font-medium">{summary.avgSpeed}</div>
                      <div className="text-[8px] font-black text-white/30 uppercase">KM/H</div>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 rounded-[2rem] p-6 border border-white/5 flex flex-col items-center">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-4">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="text-xl font-display font-bold">{(summary.distance * 40).toFixed(0)}</span>
                  <span className="text-[9px] font-black text-white/30 uppercase mt-1">Calorias Estimadas</span>
                </div>
                <div className="bg-slate-900 rounded-[2rem] p-6 border border-white/5 flex flex-col items-center">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-4">
                    <Zap className="w-5 h-5 text-yellow-500" />
                  </div>
                  <span className="text-xl font-display font-bold">+{Math.floor(summary.distance * 10)}</span>
                  <span className="text-[9px] font-black text-white/30 uppercase mt-1">Pontos PedalMatch</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="space-y-4 bg-slate-900 rounded-[2.5rem] p-6 border border-white/5">
                  <h4 className="text-xs font-black text-white/40 uppercase tracking-widest text-center">Conquistas do Pedal</h4>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center shrink-0">
                      <Trophy className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold">Resistência Nível 1</h5>
                      <p className="text-[10px] text-white/50">Você pedalou mais de 5km sem parar!</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 bg-white/5 hover:bg-white/10 text-white p-6 rounded-[2rem] font-bold text-sm transition-all flex flex-col items-center gap-2 border border-white/5">
                    <Share2 className="w-5 h-5 text-white/60" />
                    Compartilhar
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-6 rounded-[2rem] font-black text-sm transition-all shadow-xl shadow-blue-500/20 flex flex-col items-center gap-2"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Calendar className="w-5 h-5" />
                        {isOffline ? "Salvar Localmente" : "Salvar Treino"}
                      </>
                    )}
                  </button>
                </div>
                {isOffline && (
                  <p className="text-[10px] text-center font-bold text-orange-400/60 uppercase tracking-widest mt-2">
                    Conecte-se para atualizar seu ranking e trilhas
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
