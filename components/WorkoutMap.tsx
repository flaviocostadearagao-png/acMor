'use client';

import React, { useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY || '';

interface WorkoutMapProps {
  currentLocation: { lat: number; lng: number } | null;
  path: { lat: number; lng: number; timestamp: number }[];
}

function Polyline({ path }: { path: { lat: number; lng: number }[] }) {
    const map = useMap();
    useEffect(() => {
        if (!map || path.length < 2) return;
        const polyline = new google.maps.Polyline({
            path,
            strokeColor: '#3b82f6',
            strokeOpacity: 1.0,
            strokeWeight: 4,
        });
        polyline.setMap(map);
        return () => polyline.setMap(null);
    }, [map, path]);
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

export function WorkoutMap({ currentLocation, path }: WorkoutMapProps) {
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
