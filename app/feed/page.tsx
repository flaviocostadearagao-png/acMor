'use client';

import React, { useEffect, useState } from 'react';
import { useFirebase } from '@/components/FirebaseProvider';
import { useRouter } from 'next/navigation';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  increment 
} from 'firebase/firestore';
import { 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  Users, 
  Calendar, 
  Bike, 
  X,
  ChevronRight,
  TrendingUp,
  Award,
  ChevronLeft,
  WifiOff,
  CloudOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function Feed() {
  const { user, loading, isOffline } = useFirebase();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [rides, setRides] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  // New Ride Form
  const [newRide, setNewRide] = useState({
    title: '',
    description: '',
    level: 'Iniciante',
    distance: '',
    startTime: '',
    address: ''
  });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'rides'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRides(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'rides');
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'rides'), {
        ...newRide,
        distance: Number(newRide.distance),
        creatorId: user.uid,
        creatorName: user.displayName || 'Membro',
        participantCount: 1,
        createdAt: serverTimestamp(),
      });
      setShowModal(false);
      setNewRide({ title: '', description: '', level: 'Iniciante', distance: '', startTime: '', address: '' });
    } catch (err) {
      console.error("Error creating ride:", err);
    }
  };

  const joinRide = async (rideId: string) => {
    if (!user) return;
    try {
      const rideRef = doc(db, 'rides', rideId);
      const participantRef = doc(db, 'rides', rideId, 'participants', user.uid);
      
      // Add participant record
      await addDoc(collection(rideRef, 'participants'), {
        userId: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        joinedAt: serverTimestamp()
      });

      // Increment count
      await updateDoc(rideRef, {
        participantCount: increment(1)
      });
      
      alert("Você confirmou sua presença!");
    } catch (err: any) {
      console.error("Error joining ride:", err);
      if (err.message?.includes('permission-denied')) {
        alert("Você já está participando ou não tem permissão.");
      } else {
        alert("Erro ao confirmar presença.");
      }
    }
  };

  if (loading || !user) return null;

  const filteredRides = rides.filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || r.address.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {mounted && isOffline && (
        <div className="bg-orange-500 text-white px-6 py-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] sticky top-0 z-30">
          <WifiOff className="w-3.5 h-3.5" /> Modo Offline Ativado
        </div>
      )}
      <header className="bg-white px-6 pt-12 pb-6 flex flex-col gap-4 sticky top-0 z-20 shadow-sm border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-display font-bold text-slate-900">Explorar</h1>
          </div>
          <button 
            disabled={isOffline}
            onClick={() => setShowModal(true)}
            className={`w-10 h-10 ${isOffline ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white shadow-blue-200'} rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all`}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por nome ou cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none text-slate-900"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6">
        {filteredRides.map((ride, idx) => (
          <motion.div 
            key={ride.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100"
          >
            <div className="relative h-48 bg-slate-200">
              <Image 
                src={`https://picsum.photos/seed/${ride.id}/600/400`} 
                alt={ride.title} 
                fill
                className="object-cover" 
              />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md ${
                  ride.level === 'Iniciante' ? 'bg-green-500/80' : 
                  ride.level === 'Intermediário' ? 'bg-orange-500/80' : 'bg-red-500/80'
                }`}>
                  {ride.level}
                </span>
              </div>
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-xs font-bold text-slate-900 shadow-sm flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-600" /> {ride.participantCount || 1} Ciclistas
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-display font-bold text-slate-900 mb-2">{ride.title}</h3>
              <div className="space-y-2 mb-6">
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" /> {ride.address}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" /> {new Date(ride.startTime).toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" /> {ride.distance}km planejados
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Bike className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase leading-tight">Organizador</p>
                    <p className="text-xs font-bold text-slate-700 leading-tight">{ride.creatorName}</p>
                  </div>
                </div>
                <button 
                  disabled={isOffline}
                  onClick={() => joinRide(ride.id)}
                  className={`font-bold py-3 px-6 rounded-2xl shadow-lg flex items-center gap-2 active:scale-95 transition-all text-sm ${
                    isOffline ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'
                  }`}
                >
                  {isOffline ? 'Offline' : 'Confirmar'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute right-8 top-8 text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">Criar Novo Pedal</h2>
              
              <form onSubmit={handleCreateRide} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Título</label>
                  <input 
                    required
                    type="text"
                    placeholder="Ex: Pedal de Sábado"
                    value={newRide.title}
                    onChange={(e) => setNewRide({...newRide, title: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Distância (km)</label>
                    <input 
                      required
                      type="number"
                      placeholder="30"
                      value={newRide.distance}
                      onChange={(e) => setNewRide({...newRide, distance: e.target.value})}
                      className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nível</label>
                    <select 
                      value={newRide.level}
                      onChange={(e) => setNewRide({...newRide, level: e.target.value})}
                      className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none appearance-none"
                    >
                      <option>Iniciante</option>
                      <option>Intermediário</option>
                      <option>Avançado</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Data e Hora</label>
                  <input 
                    required
                    type="datetime-local"
                    value={newRide.startTime}
                    onChange={(e) => setNewRide({...newRide, startTime: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ponto de Encontro</label>
                  <input 
                    required
                    type="text"
                    placeholder="Rua, Parque, Praça..."
                    value={newRide.address}
                    onChange={(e) => setNewRide({...newRide, address: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-200 mt-4 active:scale-95 transition-all"
                >
                  Publicar Pedal
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
