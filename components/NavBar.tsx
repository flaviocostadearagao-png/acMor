'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  Bike, 
  Trophy, 
  User, 
  Wifi,
  WifiOff
} from 'lucide-react';
import { useFirebase } from './FirebaseProvider';
import { motion } from 'framer-motion';

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isOffline, toggleOffline } = useFirebase();

  if (!user || pathname === '/tracking') return null;

  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Bike, label: 'Feed', path: '/feed', disabledOffline: true },
    { icon: Trophy, label: 'Ranking', path: '/ranking', disabledOffline: true },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 z-40 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const isDisabled = isOffline && item.disabledOffline;
          
          return (
            <button
              key={item.path}
              disabled={isDisabled}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 transition-all ${
                isActive 
                  ? 'text-blue-600' 
                  : isDisabled 
                    ? 'text-slate-300' 
                    : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <item.icon className="w-6 h-6" />
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                  />
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}

        <div className="w-px h-8 bg-slate-100 mx-2" />

        <button
          onClick={toggleOffline}
          className={`flex flex-col items-center gap-1 transition-all ${
            isOffline ? 'text-orange-500' : 'text-green-500 hover:text-green-600'
          }`}
        >
          <div className="relative">
            {isOffline ? <WifiOff className="w-6 h-6" /> : <Wifi className="w-6 h-6" />}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">
            {isOffline ? 'Offline' : 'Online'}
          </span>
        </button>
      </div>
    </nav>
  );
}
