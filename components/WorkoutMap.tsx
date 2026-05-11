'use client';

import React, { useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY || '';

import { PathPoint } from '@/lib/types';

interface WorkoutMapProps {
  currentLocation: { lat: number; lng: number } | null;
  path: PathPoint[];
  recentPath?: { lat: number; lng: number }[];
}

function Polyline({ path, color = '#3b82f6', opacity = 1.0, weight = 4, dashPattern }: { 
  path: { lat: number; lng: number }[], 
  color?: string, 
  opacity?: number, 
  weight?: number,
  dashPattern?: any[]
}) {
    const map = useMap();
    useEffect(() => {
        if (!map || path.length < 2) return;
        const polyline = new google.maps.Polyline({
            path,
            strokeColor: color,
            strokeOpacity: opacity,
            strokeWeight: weight,
            icons: dashPattern ? [{
              icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 2 },
              offset: '0',
              repeat: '10px'
            }] : []
        });
        polyline.setMap(map);
        return () => polyline.setMap(null);
    }, [map, path, color, opacity, weight, dashPattern]);
    return null;
}

function MapHandler({ center }: { center: { lat: number; lng: number } | null }) {
    const map = useMap();
    useEffect(() => {
        if (map && center) {
            map.panTo(center);
        }
    }, [map, center]);
    return null;
}

export function WorkoutMap({ currentLocation, path, recentPath }: WorkoutMapProps) {
  if (!API_KEY) {
      return (
          <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center p-4 text-center text-slate-500">
              <p>Configure a chave da API do Google Maps para visualizar o mapa.</p>
          </div>
      )
  }

  return (
    <APIProvider apiKey={API_KEY}>
        <Map
            defaultCenter={currentLocation || { lat: -23.5505, lng: -46.6333 }}
            defaultZoom={15}
            mapId="DEMO_MAP_ID"
            style={{ width: '100%', height: '100%' }}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            disableDefaultUI={false}
            mapTypeControl={true}
            zoomControl={true}
            gestureHandling={'greedy'}
        >
            <MapHandler center={currentLocation} />
            
            {/* Ghost Track - Last 24h ride */}
            {recentPath && recentPath.length > 1 && (
              <Polyline 
                path={recentPath} 
                color="#64748b" 
                opacity={0.3} 
                weight={3}
              />
            )}

            {/* Current Ride Path */}
            <Polyline path={path} />

            {currentLocation && (
                <AdvancedMarker position={currentLocation}>
                    <Pin background="#3b82f6" glyphColor="#fff" borderColor="#fff" />
                </AdvancedMarker>
            )}
        </Map>
    </APIProvider>
  );
}
