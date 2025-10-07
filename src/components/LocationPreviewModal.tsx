/* eslint-disable */
// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { ensureLeaflet } from '@/lib/leafletLoader';
import { MapPin, X, ExternalLink } from 'lucide-react';

const LocationPreviewModal = ({ location, onClose }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [mapError, setMapError] = useState('');

  const lat = location?.lat ? (typeof location.lat === 'string' ? parseFloat(location.lat) : location.lat) : null;
  const lng = location?.lng ? (typeof location.lng === 'string' ? parseFloat(location.lng) : location.lng) : null;

  useEffect(() => {
    if (!location || lat === null || lng === null) return;

    let isCancelled = false;

    ensureLeaflet()
      .then((L) => {
        if (isCancelled || !mapContainerRef.current) return;
        setMapError('');

        mapInstanceRef.current = L.map(mapContainerRef.current).setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap katkıda bulunanlar'
        }).addTo(mapInstanceRef.current);

        markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
        markerRef.current.bindPopup(location?.name || 'Seçilen Konum').openPopup();
      })
      .catch((error) => {
        console.error('Harita önizlemesi yüklenemedi:', error);
        setMapError('Harita önizlemesi yüklenirken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.');
      });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markerRef.current = null;
    };
  }, [location, lat, lng]);

  if (!location) return null;

  const directionsUrl = location.mapUrl
    ? location.mapUrl
    : lat !== null && lng !== null
      ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            {location.name || 'Konum Önizleme'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {location.imageUrl && (
          <div
            className="relative w-full bg-gray-50 flex items-center justify-center"
            style={{ aspectRatio: '16 / 9' }}
          >
            <img
              src={location.imageUrl}
              alt={location.name}
              className="max-h-full max-w-full object-contain"
            />
            {location.imageSource === 'google' && location.imageContext && (
              <a
                href={location.imageContext}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Google kaynağı
              </a>
            )}
          </div>
        )}

        <div className="p-6 space-y-4">
          {location.address && (
            <p className="text-sm text-gray-600">{location.address}</p>
          )}

          {mapError && (
            <div className="px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
              {mapError}
            </div>
          )}

          <div className="h-64 rounded-xl overflow-hidden border border-gray-200">
            {lat !== null && lng !== null ? (
              <div ref={mapContainerRef} className="w-full h-full" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                Koordinat bilgisi bulunamadı.
              </div>
            )}
          </div>

          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ExternalLink className="w-4 h-4" />
              Yol Tarifi Al
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationPreviewModal;
