/* eslint-disable */
// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { ensureLeaflet } from '@/lib/leafletLoader';
import { Search, MapPin, Loader2, X } from 'lucide-react';

const DEFAULT_CENTER = { lat: 39.925533, lng: 32.866287 }; // Ankara merkez

const formatAddress = (result) => {
  if (!result) return '';
  if (result.display_name) return result.display_name;
  if (result.address) {
    const parts = [
      result.address.road,
      result.address.neighbourhood,
      result.address.suburb,
      result.address.city || result.address.town || result.address.village,
      result.address.state,
      result.address.country
    ].filter(Boolean);
    return parts.join(', ');
  }
  return '';
};

const getAddressObject = (info) => {
  if (!info) return {};
  if (info.addressDetails) return info.addressDetails;
  if (info.address) return info.address;
  return {};
};

const extractLocationParts = (info) => {
  const address = getAddressObject(info);
  const normalizeString = (value) =>
    typeof value === 'string' && value.trim().length > 0 ? value.trim() : '';
  const pickFirstValid = (candidates = []) => {
    for (const candidate of candidates) {
      const normalized = normalizeString(candidate);
      if (normalized) return normalized;
    }
    return '';
  };

  const cityCandidates = [
    info?.city,
    address.city,
    address.town,
    address.municipality,
    address.village,
    address.state,
    address.province,
    address.region
  ];

  const districtCandidates = [
    info?.district,
    address.district,
    address.county,
    address.state_district,
    address.city_district,
    address.suburb,
    address.neighbourhood,
    address.village,
    address.hamlet
  ];

  let cityCandidate = pickFirstValid(cityCandidates);
  let districtCandidate = pickFirstValid(districtCandidates);

  if (cityCandidate && districtCandidate && cityCandidate.toLowerCase() === districtCandidate.toLowerCase()) {
    const filteredDistricts = districtCandidates.filter((candidate) => {
      const normalized = normalizeString(candidate);
      return normalized && normalized.toLowerCase() !== cityCandidate.toLowerCase();
    });
    districtCandidate = pickFirstValid(filteredDistricts);
  }

  return {
    city: cityCandidate,
    district: districtCandidate,
    addressDetails: address
  };
};

const enrichLocationInfo = (info) => {
  if (!info) return null;
  const parts = extractLocationParts(info);
  return {
    ...info,
    ...parts
  };
};

const buildLocationPayload = (info) => {
  if (!info) return null;
  const lat = typeof info.lat === 'string' ? parseFloat(info.lat) : info.lat;
  const lng = typeof info.lng === 'string' ? parseFloat(info.lng) : info.lng;
  const enriched = enrichLocationInfo(info);
  const addressDetails = enriched?.addressDetails || getAddressObject(info);
  return {
    name: info.name || info.displayName || 'Seçilen Konum',
    displayName: info.displayName || formatAddress(info) || info.name || 'Seçilen Konum',
    address: info.address || formatAddress(info) || info.name || '',
    lat,
    lng,
    source: info.source || 'manual',
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    boundingbox: info.boundingbox || null,
    city: enriched?.city || '',
    district: enriched?.district || '',
    addressDetails: addressDetails && Object.keys(addressDetails).length > 0 ? addressDetails : null
  };
};

const LocationPickerModal = ({ isOpen, onClose, onSelect, initialLocation }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(initialLocation || null);
  const [selectedPosition, setSelectedPosition] = useState(() => {
    if (!initialLocation) return null;
    const lat = typeof initialLocation.lat === 'string' ? parseFloat(initialLocation.lat) : initialLocation.lat;
    const lng = typeof initialLocation.lng === 'string' ? parseFloat(initialLocation.lng) : initialLocation.lng;
    if (!lat || !lng) return null;
    return { lat, lng };
  });

  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;

    ensureLeaflet()
      .then((L) => {
        if (isCancelled || !mapContainerRef.current) return;

        setMapError('');

        const lat = selectedPosition?.lat || DEFAULT_CENTER.lat;
        const lng = selectedPosition?.lng || DEFAULT_CENTER.lng;

        mapInstanceRef.current = L.map(mapContainerRef.current).setView([lat, lng], selectedPosition ? 15 : 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap katkıda bulunanlar'
        }).addTo(mapInstanceRef.current);

        if (selectedPosition) {
          markerRef.current = L.marker([selectedPosition.lat, selectedPosition.lng]).addTo(mapInstanceRef.current);
        }

        mapInstanceRef.current.on('click', async (event) => {
          const { lat: clickedLat, lng: clickedLng } = event.latlng;
          if (isCancelled) return;
          setSelectedPosition({ lat: clickedLat, lng: clickedLng });
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${clickedLat}&lon=${clickedLng}`,
              {
                headers: {
                  Accept: 'application/json',
                  'User-Agent': 'aktifite-app/1.0'
                }
              }
            );

            if (!response.ok) {
              throw new Error('Reverse geocode isteği başarısız oldu');
            }

            const data = await response.json();
            if (isCancelled) return;
            const enrichedInfo = enrichLocationInfo({
              name: data.name || data.display_name?.split(',')[0] || 'Seçilen Konum',
              displayName: data.display_name || '',
              address: formatAddress(data),
              lat: clickedLat,
              lng: clickedLng,
              source: 'reverse',
              addressDetails: data.address || null,
              boundingbox: data.boundingbox || null
            });
            setSelectedInfo(enrichedInfo);
          } catch (error) {
            console.error('Ters geocode başarısız oldu:', error);
            if (isCancelled) return;
            setSelectedInfo(
              enrichLocationInfo({
                name: 'Seçilen Konum',
                displayName: `Koordinatlar: ${clickedLat.toFixed(5)}, ${clickedLng.toFixed(5)}`,
                address: '',
                lat: clickedLat,
                lng: clickedLng,
                source: 'manual'
              })
            );
          }
        });

        setMapReady(true);
      })
      .catch((error) => {
        console.error('Leaflet yüklenemedi:', error);
        setMapError('Harita yüklenirken bir sorun oluştu. Lütfen internet bağlantınızı kontrol edin.');
      });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markerRef.current = null;
      setMapReady(false);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    // @ts-ignore
    const L = window.L;
    if (!selectedPosition) return;

    if (markerRef.current) {
      markerRef.current.setLatLng(selectedPosition);
    } else {
      markerRef.current = L.marker(selectedPosition).addTo(mapInstanceRef.current);
    }

    mapInstanceRef.current.setView(selectedPosition, 15);
  }, [selectedPosition, mapReady]);

  useEffect(() => {
    if (!isOpen) {
      setSearchResults([]);
      setSearchQuery('');
      return;
    }
    setSelectedInfo(initialLocation || null);
    setSelectedPosition(() => {
      if (!initialLocation) return null;
      const lat = typeof initialLocation.lat === 'string' ? parseFloat(initialLocation.lat) : initialLocation.lat;
      const lng = typeof initialLocation.lng === 'string' ? parseFloat(initialLocation.lng) : initialLocation.lng;
      if (!lat || !lng) return null;
      return { lat, lng };
    });
  }, [isOpen, initialLocation]);

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setMapError('');
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Arama isteği başarısız oldu');
      const results = await response.json();
      setSearchResults(results);
      if (results.length === 0) {
        setMapError('Aramanıza uygun sonuç bulunamadı.');
      }
    } catch (error) {
      console.error('Konum araması başarısız oldu:', error);
      setMapError('Konum araması sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result) => {
    if (!result) return;
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSelectedPosition({ lat, lng });
    setSelectedInfo(
      enrichLocationInfo({
        name: result.display_name?.split(',')[0] || 'Seçilen Konum',
        displayName: result.display_name || '',
        address: formatAddress(result),
        lat,
        lng,
        source: 'search',
        boundingbox: result.boundingbox || null,
        addressDetails: result.address || null
      })
    );
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 15);
    }
  };

  const handleConfirm = () => {
    if (!selectedPosition || !selectedInfo) {
      alert('Lütfen haritadan bir konum seçin.');
      return;
    }

    const payload = buildLocationPayload({ ...selectedInfo, ...selectedPosition });
    if (!payload) {
      alert('Konum bilgisi alınamadı. Lütfen tekrar deneyin.');
      return;
    }

    onSelect(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Konum Seç
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Adres, mekan veya konum ara"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              disabled={isSearching}
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Ara
            </button>
          </form>

          {mapError && (
            <div className="px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
              {mapError}
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
              {searchResults.map((result) => (
                <button
                  key={`${result.place_id}-${result.lat}-${result.lon}`}
                  type="button"
                  onClick={() => handleSelectResult(result)}
                  className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-blue-50 transition ${
                    selectedInfo?.displayName === result.display_name ? 'bg-blue-50' : 'bg-white'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    {result.display_name?.split(',')[0] || 'Konum'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{formatAddress(result)}</p>
                </button>
              ))}
            </div>
          )}

          <div className="h-72 rounded-xl overflow-hidden border border-gray-200">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>

          {selectedInfo && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
              <p className="font-semibold">Seçilen Konum</p>
              <p>{selectedInfo.name}</p>
              {selectedInfo.address && (
                <p className="text-xs text-blue-700 mt-1">{selectedInfo.address}</p>
              )}
              {selectedPosition && (
                <p className="text-xs text-blue-700 mt-1">
                  Koordinatlar: {selectedPosition.lat.toFixed(5)}, {selectedPosition.lng.toFixed(5)}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100">
            İptal
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Konumu Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
