'use client';

import React from 'react';

interface WorkoutMapProps {
  currentLocation: { lat: number; lng: number } | null;
  path: { lat: number; lng: number; timestamp: number }[];
}

export function WorkoutMap({ currentLocation, path }: WorkoutMapProps) {
  return (
    <div className="w-full h-full bg-slate-800 flex items-center justify-center relative">
      {/* Mock Map visualization */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/-46.6333,-23.5505,12/400x400?access_token=pk.eyJ1IjoiZGV2LW1hcmNoIiwiYSI6ImNscG96NXp6ajA1Ym0ycW85eGljMjNqNXAifQ')] bg-cover" />
      
      {!currentLocation ? (
        <div className="text-white/20 text-center px-8 z-10">
          <p className="text-xs font-black uppercase tracking-widest">Aguardando GPS...</p>
        </div>
      ) : (
        <div className="z-10 relative w-full h-full">
           {/* Path dots */}
           {path.map((p, i) => (
             <div 
               key={i} 
               className="absolute w-1 h-1 bg-blue-500 rounded-full"
               style={{ 
                 left: `${((p.lng + 46.7) * 1000) % 100}%`, 
                 top: `${((p.lat + 23.6) * 1000) % 100}%` 
               }}
             />
           ))}
           {/* Current pos */}
           <div className="absolute w-4 h-4 bg-white rounded-full p-1 shadow-lg shadow-blue-500/50 flex items-center justify-center"
             style={{ 
               left: `${((currentLocation.lng + 46.7) * 1000) % 100}%`, 
               top: `${((currentLocation.lat + 23.6) * 1000) % 100}%` 
             }}
           >
             <div className="w-full h-full bg-blue-600 rounded-full animate-ping" />
           </div>
        </div>
      )}
    </div>
  );
}
