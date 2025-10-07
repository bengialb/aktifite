/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Plus,
  Check,
  X,
  User,
  Home,
  PlusCircle,
  UserCircle,
  Search,
  Filter,
  Bell,
  ChevronRight,
  MessageCircle,
  Send,
  Camera,
  Inbox,
  ArrowLeft,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import LocationPickerModal from '@/components/LocationPickerModal';
import LocationPreviewModal from '@/components/LocationPreviewModal';

const SportsApp = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [currentUser, setCurrentUser] = useState({
    id: 1,
    name: storedUser.name || 'Mehmet Yılmaz',
    avatar: '👤',
    profileImage: null,
    email: storedUser.email || '',
    city: storedUser.city || '',
    birthDate: storedUser.birthDate || '',
    favoriteSports: storedUser.favoriteSports || []
  });

  const [currentView, setCurrentView] = useState('home');
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        navigate('/', { replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name,email,city,birth_date,favorite_sports')
        .eq('id', session.user.id)
        .single();

      const userData = {
        name: profile?.full_name || '',
        email: profile?.email || session.user.email || '',
        city: profile?.city || '',
        birthDate: profile?.birth_date || '',
        favoriteSports: profile?.favorite_sports || [],
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setCurrentUser((prev) => ({ ...prev, ...userData, id: session.user.id }));
    };

    loadProfile();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate('/', { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Çıkış başarısız:', error);
      await supabase.auth.signOut({ scope: 'local' });
    }
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  const sportEmojis = {
    'Tenis': '🎾',
    'Basketbol': '🏀',
    'Futbol': '⚽',
    'Voleybol': '🏐',
    'Yüzme': '🏊',
    'Koşu': '🏃',
    'Bisiklet': '🚴',
    'Yoga': '🧘',
    'Masa Tenisi': '🏓',
    'Badminton': '🏸',
    'Golf': '⛳',
    'Boks': '🥊',
    'Dans': '💃',
    'Kayak': '⛷️'
  };

  const sports = Object.keys(sportEmojis);

  const cities = [
    'İstanbul (Avrupa)',
    'İstanbul (Asya)',
    'Ankara',
    'İzmir'
  ];

  const [messages, setMessages] = useState([
    {
      id: 1,
      chatId: 'chat_1',
      activityId: 1,
      activityTitle: 'Sabah Tenis Maçı',
      participants: [
        { id: 1, name: 'Mehmet Yılmaz', avatar: '👤' },
        { id: 2, name: 'Ayşe Kaya', avatar: '👩' }
      ],
      messages: [
        { senderId: 1, text: 'Merhaba, aktifiteniz için raket getirmem gerekiyor mu?', timestamp: '2025-02-08T10:00:00' },
        { senderId: 2, text: 'Merhaba! Evet, raket getirmeniz gerekiyor. Top bizde var.', timestamp: '2025-02-08T10:05:00' },
        { senderId: 1, text: 'Tamam, teşekkürler! Görüşmek üzere 👍', timestamp: '2025-02-08T10:06:00' }
      ],
      lastMessage: 'Tamam, teşekkürler! Görüşmek üzere 👍',
      lastMessageTime: '2025-02-08T10:06:00',
      unread: false
    },
    {
      id: 2,
      chatId: 'chat_2',
      activityId: 3,
      activityTitle: 'Yoga Seansı',
      participants: [
        { id: 1, name: 'Mehmet Yılmaz', avatar: '👤' },
        { id: 9, name: 'Elif Yılmaz', avatar: '👩‍🦱' }
      ],
      messages: [
        { senderId: 9, text: 'Merhaba, yoga matınız var mı?', timestamp: '2025-02-08T09:00:00' },
        { senderId: 1, text: 'Merhaba, hayır maalesef yok', timestamp: '2025-02-08T09:10:00' },
        { senderId: 9, text: 'Sorun değil, size yedek mat getirebilirim 😊', timestamp: '2025-02-08T09:15:00' }
      ],
      lastMessage: 'Sorun değil, size yedek mat getirebilirim 😊',
      lastMessageTime: '2025-02-08T09:15:00',
      unread: true
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(1);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'request_received',
      message: 'Ali Demir "Sabah Tenis Maçı" aktifitenize katılmak istiyor',
      activityId: 1,
      userId: 3,
      read: false,
      timestamp: '2025-02-08T10:30:00',
      sportEmoji: '🎾'
    },
    {
      id: 2,
      type: 'request_accepted',
      message: 'Yoga Seansı aktifitesine katılım isteğiniz onaylandı!',
      activityId: 3,
      read: false,
      timestamp: '2025-02-08T09:15:00',
      sportEmoji: '🧘'
    },
    {
      id: 3,
      type: 'request_rejected',
      message: 'Futbol Maçı aktifitesine katılım isteğiniz reddedildi',
      activityId: 4,
      read: true,
      timestamp: '2025-02-07T18:00:00',
      sportEmoji: '⚽'
    }
  ]);

  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('activities')
        .select(`*, participants:activity_participants(user_id, profiles(full_name))`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Aktifiteler alınamadı:', error);
        return;
      }

      const mapped = data.map((act) => {
        const locationInfo = normalizeLocationDetails(act.location);

        return {
          id: act.id,
          sport: act.sport_type,
          title: act.title,
          date: act.date,
          time: act.time,
          location: locationInfo.name,
          locationDetails: locationInfo.details,
          city: act.city,
          maxParticipants: act.max_participants,
          currentParticipants: act.participants?.length || 0,
          createdBy: { id: act.organizer_id, name: 'Organizatör', avatar: '👤' },
          participants: (act.participants || []).map((p) => ({
            id: p.user_id,
            name: p.profiles?.full_name || 'Kullanıcı',
            avatar: '👤'
          })),
          requests: [],
          description: act.description || ''
        };
      });

      setActivities(mapped);
    };

    fetchActivities();
  }, []);

  const [filterSport, setFilterSport] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newActivity, setNewActivity] = useState({
    sport: 'Tenis',
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    city: 'Ankara',
    maxParticipants: 2,
    description: '',
    locationDetails: null
  });

  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [locationPreview, setLocationPreview] = useState(null);
  const [locationImageError, setLocationImageError] = useState('');
  const [isFetchingLocationImage, setIsFetchingLocationImage] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const normalizeLocationDetails = (rawLocation) => {
    if (!rawLocation) {
      return { name: '', details: null };
    }

    if (typeof rawLocation === 'object' && !Array.isArray(rawLocation)) {
      const lat = rawLocation.lat !== undefined ? (typeof rawLocation.lat === 'string' ? parseFloat(rawLocation.lat) : rawLocation.lat) : null;
      const lng = rawLocation.lng !== undefined ? (typeof rawLocation.lng === 'string' ? parseFloat(rawLocation.lng) : rawLocation.lng) : null;
      return {
        name: rawLocation.name || rawLocation.displayName || '',
        details: {
          ...rawLocation,
          lat,
          lng
        }
      };
    }

    if (typeof rawLocation === 'string') {
      try {
        const parsed = JSON.parse(rawLocation);
        const lat = parsed?.lat !== undefined ? (typeof parsed.lat === 'string' ? parseFloat(parsed.lat) : parsed.lat) : null;
        const lng = parsed?.lng !== undefined ? (typeof parsed.lng === 'string' ? parseFloat(parsed.lng) : parsed.lng) : null;
        if (parsed && typeof parsed === 'object') {
          return {
            name: parsed.name || parsed.displayName || rawLocation,
            details: {
              ...parsed,
              lat,
              lng
            }
          };
        }
      } catch (error) {
        return { name: rawLocation, details: null };
      }
      return { name: rawLocation, details: null };
    }

    return { name: '', details: null };
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentUser({ ...currentUser, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchGoogleImageForLocation = async (query) => {
    if (!query) return null;

    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const searchEngineId = import.meta.env.VITE_GOOGLE_CSE_ID;

    if (!apiKey || !searchEngineId) {
      setLocationImageError('Google görselini otomatik almak için gerekli API anahtarları tanımlı değil. Lütfen görsel yükleyin.');
      return null;
    }

    try {
      setIsFetchingLocationImage(true);
      setLocationImageError('');
      const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&searchType=image&num=1&q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Google Custom Search isteği başarısız oldu');
      const data = await response.json();
      const firstItem = data.items?.[0];
      if (firstItem?.link) {
        return {
          imageUrl: firstItem.link,
          imageContext: firstItem.image?.contextLink || firstItem.link,
          imageWidth: firstItem.image?.width || null,
          imageHeight: firstItem.image?.height || null,
          imageSource: 'google'
        };
      }
      setLocationImageError('Google görseli bulunamadı. Lütfen görsel yükleyin.');
    } catch (error) {
      console.error('Google görseli alınamadı:', error);
      setLocationImageError('Google görseli alınamadı. Lütfen görsel yükleyin.');
    } finally {
      setIsFetchingLocationImage(false);
    }

    return null;
  };

  const handleLocationSelected = async (location) => {
    setIsLocationPickerOpen(false);
    if (!location) return;

    setLocationImageError('');

    let enhancedLocation = { ...location };
    const query = location.displayName || location.name;
    const autoImage = await fetchGoogleImageForLocation(query);
    if (autoImage) {
      enhancedLocation = { ...enhancedLocation, ...autoImage };
    }

    setNewActivity((prev) => ({
      ...prev,
      locationDetails: enhancedLocation
    }));
  };

  const handleLocationImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewActivity((prev) => ({
        ...prev,
        locationDetails: {
          ...(prev.locationDetails || {}),
          imageUrl: reader.result,
          imageSource: 'upload',
          imageName: file.name
        }
      }));
      setLocationImageError('');
    };
    reader.readAsDataURL(file);
  };

  const clearLocationImage = () => {
    setNewActivity((prev) => ({
      ...prev,
      locationDetails: prev.locationDetails
        ? { ...prev.locationDetails, imageUrl: null, imageSource: null, imageName: null }
        : null
    }));
  };

  const openLocationPreview = (location) => {
    if (!location) return;
    setLocationPreview(location);
  };

  const handleSendMessage = (activity) => {
    const existingChat = messages.find(m =>
      m.activityId === activity.id &&
      m.participants.some(p => p.id === activity.createdBy.id)
    );

    if (existingChat) {
      setSelectedChat(existingChat);
      setCurrentView('chat');
    } else {
      const newChat = {
        id: messages.length + 1,
        chatId: `chat_${messages.length + 1}`,
        activityId: activity.id,
        activityTitle: activity.title,
        participants: [
          currentUser,
          activity.createdBy
        ],
        messages: [],
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unread: false
      };
      setMessages([...messages, newChat]);
      setSelectedChat(newChat);
      setCurrentView('chat');
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const updatedMessages = messages.map(chat => {
      if (chat.chatId === selectedChat.chatId) {
        const newMsg = {
          senderId: currentUser.id,
          text: newMessage,
          timestamp: new Date().toISOString()
        };
        return {
          ...chat,
          messages: [...chat.messages, newMsg],
          lastMessage: newMessage,
          lastMessageTime: new Date().toISOString(),
          unread: false
        };
      }
      return chat;
    });

    setMessages(updatedMessages);
    const updatedChat = updatedMessages.find(m => m.chatId === selectedChat.chatId);
    setSelectedChat(updatedChat);
    setNewMessage('');
  };

  const handleCreateActivity = async () => {
    if (!newActivity.title || !newActivity.date || !newActivity.startTime || !newActivity.endTime || !newActivity.locationDetails?.name) {
      alert('Lütfen tüm gerekli alanları doldurun!');
      return;
    }

    if (newActivity.startTime >= newActivity.endTime) {
      alert('Başlangıç saati bitiş saatinden önce olmalı!');
      return;
    }

    const timeRange = `${newActivity.startTime} - ${newActivity.endTime}`;

    const locationPayload = newActivity.locationDetails
      ? {
          ...newActivity.locationDetails,
          lat: typeof newActivity.locationDetails.lat === 'number'
            ? newActivity.locationDetails.lat
            : parseFloat(newActivity.locationDetails.lat || 0),
          lng: typeof newActivity.locationDetails.lng === 'number'
            ? newActivity.locationDetails.lng
            : parseFloat(newActivity.locationDetails.lng || 0)
        }
      : null;

    const { data, error } = await supabase
      .from('activities')
      .insert({
        organizer_id: currentUser.id,
        sport_type: newActivity.sport,
        title: newActivity.title,
        description: newActivity.description,
        date: newActivity.date,
        time: timeRange,
        city: newActivity.city,
        location: locationPayload ? JSON.stringify(locationPayload) : newActivity.locationDetails?.name || '',
        max_participants: parseInt(newActivity.maxParticipants)
      })
      .select('*')
      .single();

    if (error) {
      console.error('Aktifite oluşturulamadı:', error);
      return;
    }

    const { error: participantError } = await supabase
      .from('activity_participants')
      .insert({ activity_id: data.id, user_id: currentUser.id });

    if (participantError) {
      console.error('Organizatör katılımcı olarak eklenemedi:', participantError);
    }

    const activity = {
      id: data.id,
      sport: data.sport_type,
      title: data.title,
      date: data.date,
      time: data.time,
      location: locationPayload?.name || newActivity.locationDetails?.name || '',
      locationDetails: locationPayload,
      city: data.city,
      maxParticipants: data.max_participants,
      currentParticipants: 1,
      createdBy: currentUser,
      participants: [currentUser],
      requests: [],
      description: data.description || ''
    };

    setActivities([...activities, activity]);

    const newNotification = {
      id: notifications.length + 1,
      type: 'activity_created',
      message: `"${activity.title}" aktifitesi başarıyla oluşturuldu!`,
      activityId: activity.id,
      read: false,
      timestamp: new Date().toISOString(),
      sportEmoji: sportEmojis[activity.sport]
    };
    setNotifications([newNotification, ...notifications]);

    setNewActivity({
      sport: 'Tenis',
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      city: 'Ankara',
      maxParticipants: 2,
      description: '',
      locationDetails: null
    });
    setCurrentView('home');
  };

  const handleJoinRequest = (activityId) => {
    const activity = activities.find(a => a.id === activityId);

    setActivities(activities.map(act => {
      if (act.id === activityId) {
        const isAlreadyParticipant = act.participants.some(p => p.id === currentUser.id);
        const hasAlreadyRequested = act.requests.some(r => r.id === currentUser.id);

        if (!isAlreadyParticipant && !hasAlreadyRequested && act.currentParticipants < act.maxParticipants) {
          const newNotification = {
            id: notifications.length + 1,
            type: 'request_sent',
            message: `"${activity.title}" aktifitesine katılım isteği gönderildi`,
            activityId: activityId,
            read: false,
            timestamp: new Date().toISOString(),
            sportEmoji: sportEmojis[activity.sport]
          };
          setNotifications([newNotification, ...notifications]);

          return {
            ...act,
            requests: [...act.requests, { ...currentUser, status: 'pending' }]
          };
        }
      }
      return act;
    }));
  };

  const handleAcceptRequest = async (activityId, userId) => {
    const activity = activities.find(a => a.id === activityId);
    const user = activity.requests.find(r => r.id === userId);

    const { error: participantError } = await supabase
      .from('activity_participants')
      .insert({ activity_id: activityId, user_id: userId });

    if (participantError) {
      console.error('Katılımcı eklenemedi:', participantError);
      return;
    }

    setActivities(activities.map(act => {
      if (act.id === activityId) {
        const request = act.requests.find(r => r.id === userId);
        if (request && act.currentParticipants < act.maxParticipants) {
          const newNotification = {
            id: notifications.length + 1,
            type: 'request_accepted',
            message: `${user.name} "${activity.title}" aktifitesine kabul edildi`,
            activityId: activityId,
            read: false,
            timestamp: new Date().toISOString(),
            sportEmoji: sportEmojis[activity.sport]
          };
          setNotifications([newNotification, ...notifications]);

          return {
            ...act,
            participants: [...act.participants, { id: request.id, name: request.name, avatar: request.avatar }],
            requests: act.requests.filter(r => r.id !== userId),
            currentParticipants: act.currentParticipants + 1
          };
        }
      }
      return act;
    }));
  };

  const handleRejectRequest = (activityId, userId) => {
    const activity = activities.find(a => a.id === activityId);
    const user = activity.requests.find(r => r.id === userId);

    setActivities(activities.map(act => {
      if (act.id === activityId) {
        const newNotification = {
          id: notifications.length + 1,
          type: 'request_rejected',
          message: `${user.name} "${activity.title}" aktifitesine reddedildi`,
          activityId: activityId,
          read: false,
          timestamp: new Date().toISOString(),
          sportEmoji: sportEmojis[activity.sport]
        };
        setNotifications([newNotification, ...notifications]);

        return {
          ...act,
          requests: act.requests.filter(r => r.id !== userId)
        };
      }
      return act;
    }));
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSport = filterSport === 'all' || activity.sport === filterSport;
    const matchesCity = filterCity === 'all' || activity.city === filterCity;
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          activity.sport.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (activity.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSport && matchesCity && matchesSearch;
  });

  const ActivityCard = ({ activity }) => {
    const isCreator = activity.createdBy.id === currentUser.id;
    const isParticipant = activity.participants.some(p => p.id === currentUser.id);
    const hasRequested = activity.requests.some(r => r.id === currentUser.id);
    const isFull = activity.currentParticipants >= activity.maxParticipants;
    const locationDetails = activity.locationDetails;
    const numericLat = locationDetails?.lat !== undefined && locationDetails?.lat !== null
      ? (typeof locationDetails.lat === 'string' ? parseFloat(locationDetails.lat) : locationDetails.lat)
      : null;
    const numericLng = locationDetails?.lng !== undefined && locationDetails?.lng !== null
      ? (typeof locationDetails.lng === 'string' ? parseFloat(locationDetails.lng) : locationDetails.lng)
      : null;
    const directionsLink = numericLat !== null && numericLng !== null
      ? `https://www.google.com/maps/dir/?api=1&destination=${numericLat},${numericLng}`
      : null;

    return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 hover:shadow-xl transition-shadow">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl sm:text-3xl">{sportEmojis[activity.sport]}</span>
              <span className="inline-block px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-semibold">
                {activity.sport}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{activity.title}</h3>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">{activity.description}</p>
          </div>
          {isCreator && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold">
              Organizatör
            </span>
          )}
        </div>

        <div className="space-y-1.5 sm:space-y-2 text-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            <span className="text-xs sm:text-sm">{new Date(activity.date).toLocaleDateString('tr-TR')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            <span className="text-xs sm:text-sm">{activity.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            <span className="text-xs sm:text-sm">{activity.location}</span>
            <span className="text-[10px] sm:text-xs text-gray-500">({activity.city})</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            <span className="text-xs sm:text-sm">{activity.currentParticipants}/{activity.maxParticipants} Katılımcı</span>
          </div>
        </div>

        {locationDetails && (
          <div className="mt-4 space-y-3">
            {locationDetails.imageUrl && (
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <img
                  src={locationDetails.imageUrl}
                  alt={locationDetails.name}
                  className="w-full h-40 object-cover"
                />
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <button
                onClick={() => openLocationPreview(locationDetails)}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
              >
                <MapPin className="w-4 h-4" />
                Haritada Gör
              </button>
              {directionsLink && (
                <a
                  href={directionsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <ExternalLink className="w-4 h-4" />
                  Yol Tarifi Al
                </a>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-600 mb-2">Katılımcılar:</p>
          <div className="flex gap-2 flex-wrap">
            {activity.participants.map(p => (
              <div key={p.id} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                <span className="text-lg">{p.avatar}</span>
                <span className="text-xs">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {isCreator && activity.requests.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-semibold text-gray-700 mb-2">Katılım İstekleri ({activity.requests.length}):</p>
            {activity.requests.map(request => (
              <div key={request.id} className="flex items-center justify-between bg-yellow-50 p-2 rounded-lg mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{request.avatar}</span>
                  <span className="text-sm font-medium">{request.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptRequest(activity.id, request.id)}
                    className="p-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    disabled={isFull}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRejectRequest(activity.id, request.id)}
                    className="p-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isParticipant && !isCreator && (
          <div className="flex gap-2 mt-4">
            {!hasRequested && !isFull && (
              <button
                onClick={() => handleJoinRequest(activity.id)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
              >
                Katılım İsteği Gönder
              </button>
            )}
            <button
              onClick={() => handleSendMessage(activity)}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              Mesaj At
            </button>
          </div>
        )}

        {hasRequested && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-yellow-600 font-medium">
              ⏳ Katılım isteğiniz bekleniyor
            </div>
            <button
              onClick={() => handleSendMessage(activity)}
              className="flex items-center gap-2 text-sm bg-gray-100 text-gray-700 py-1 px-3 rounded-lg hover:bg-gray-200"
            >
              <MessageCircle className="w-3 h-3" />
              Mesaj
            </button>
          </div>
        )}

        {isParticipant && !isCreator && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-green-600 font-medium">
              ✅ Katılımcısınız
            </div>
            <button
              onClick={() => handleSendMessage(activity)}
              className="flex items-center gap-2 text-sm bg-gray-100 text-gray-700 py-1 px-3 rounded-lg hover:bg-gray-200"
            >
              <MessageCircle className="w-3 h-3" />
              Mesaj
            </button>
          </div>
        )}

        {isFull && !isParticipant && !isCreator && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-red-600 font-medium">
              🚫 Aktifite dolu
            </div>
            <button
              onClick={() => handleSendMessage(activity)}
              className="flex items-center gap-2 text-sm bg-gray-100 text-gray-700 py-1 px-3 rounded-lg hover:bg-gray-200"
            >
              <MessageCircle className="w-3 h-3" />
              Soru Sor
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-4">
        <header className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              ⚽ AKTİFİTE
            </h1>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setCurrentView('inbox')}
                className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Inbox className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                    {unreadMessages}
                  </span>
                )}
              </button>
              <button
                onClick={() => setCurrentView('notifications')}
                className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full">
                {currentUser.profileImage ? (
                  <img src={currentUser.profileImage} alt="Profile" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover" />
                ) : (
                  <span className="text-sm sm:text-lg">{currentUser.avatar}</span>
                )}
                <span className="font-medium text-gray-800 text-xs sm:text-base hidden sm:inline">{currentUser.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                <span className="hidden sm:inline text-gray-700">Çıkış</span>
              </button>
            </div>
          </div>
        </header>

        <nav className="bg-white rounded-2xl shadow-lg p-2 mb-4 sm:mb-6 flex gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentView('home')}
            className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-xl transition-colors ${
              currentView === 'home' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
            }`}
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium text-xs sm:text-base">Aktifiteler</span>
          </button>
          <button
            onClick={() => setCurrentView('create')}
            className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-xl transition-colors ${
              currentView === 'create' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
            }`}
          >
            <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium text-xs sm:text-base">Oluştur</span>
          </button>
          <button
            onClick={() => setCurrentView('profile')}
            className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-xl transition-colors ${
              currentView === 'profile' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
            }`}
          >
            <UserCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium text-xs sm:text-base">Profilim</span>
          </button>
        </nav>

        {currentView === 'home' && (
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Aktifite ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tüm Şehirler</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <select
                    value={filterSport}
                    onChange={(e) => setFilterSport(e.target.value)}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tüm Sporlar</option>
                    {sports.map(sport => (
                      <option key={sport} value={sport}>{sportEmojis[sport]} {sport}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              {filteredActivities.length > 0 ? (
                filteredActivities.map(activity => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <p className="text-gray-500">Henüz aktifite bulunamadı</p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'inbox' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">💬 Mesajlar</h2>
            {messages.length > 0 ? (
              <div className="space-y-3">
                {messages.map(chat => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setSelectedChat(chat);
                      setCurrentView('chat');
                    }}
                    className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                      chat.unread ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{chat.activityTitle}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {chat.participants.find(p => p.id !== currentUser.id)?.name}
                        </p>
                        <p className={`text-sm mt-2 ${chat.unread ? 'font-semibold' : 'text-gray-500'}`}>
                          {chat.lastMessage}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{getTimeAgo(chat.lastMessageTime)}</p>
                        {chat.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-auto"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Henüz mesajınız yok</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'chat' && selectedChat && (
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="border-b p-4 flex items-center gap-3">
              <button
                onClick={() => setCurrentView('inbox')}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{selectedChat.activityTitle}</h3>
                <p className="text-sm text-gray-600">
                  {selectedChat.participants.find(p => p.id !== currentUser.id)?.name}
                </p>
              </div>
            </div>

            <div className="h-96 overflow-y-auto p-4 space-y-3">
              {selectedChat.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.senderId === currentUser.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${
                      msg.senderId === currentUser.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {getTimeAgo(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'notifications' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🔔 Bildirimler</h2>
              {unreadNotifications > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Tümünü okundu işaretle
                </button>
              )}
            </div>

            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => markNotificationAsRead(notification.id)}
                    className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                      !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{notification.sportEmoji}</span>
                      <div className="flex-1">
                        <p className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {getTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                    {notification.type === 'request_accepted' && (
                      <div className="mt-2 ml-11">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          ✅ Onaylandı
                        </span>
                      </div>
                    )}
                    {notification.type === 'request_rejected' && (
                      <div className="mt-2 ml-11">
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          ❌ Reddedildi
                        </span>
                      </div>
                    )}
                    {notification.type === 'request_received' && (
                      <div className="mt-2 ml-11">
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          ⏳ Beklemede
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Henüz bildirim yok</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'create' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Yeni Aktifite Oluştur</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aktifite Türü</label>
                <div className="relative">
                  <select
                    value={newActivity.sport}
                    onChange={(e) => setNewActivity({...newActivity, sport: e.target.value})}
                    className="w-full px-4 py-2 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    {sports.map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-2xl pointer-events-none">
                    {sportEmojis[newActivity.sport]}
                  </span>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Başlık</label>
                <input
                  type="text"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                  placeholder="örn: Sabah Tenis Maçı"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                <textarea
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                  placeholder="Aktifite hakkında detaylar..."
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Tarih</label>
                  <input
                    type="date"
                    value={newActivity.date}
                    onChange={(e) => setNewActivity({...newActivity, date: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Başlangıç Saati</label>
                  <input
                    type="time"
                    value={newActivity.startTime}
                    onChange={(e) => setNewActivity({...newActivity, startTime: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Bitiş Saati</label>
                  <input
                    type="time"
                    value={newActivity.endTime}
                    onChange={(e) => setNewActivity({...newActivity, endTime: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Şehir</label>
                  <select
                    value={newActivity.city}
                    onChange={(e) => setNewActivity({...newActivity, city: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Konum</label>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newActivity.locationDetails?.name || ''}
                        readOnly
                        placeholder="Haritadan konum seçin"
                        className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg bg-gray-50 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setIsLocationPickerOpen(true)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Haritada Seç
                      </button>
                      {newActivity.locationDetails && (
                        <button
                          type="button"
                          onClick={() => openLocationPreview(newActivity.locationDetails)}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                        >
                          Önizle
                        </button>
                      )}
                    </div>
                    {newActivity.locationDetails?.address && (
                      <p className="text-xs text-gray-500">{newActivity.locationDetails.address}</p>
                    )}
                    {newActivity.locationDetails?.lat !== undefined && newActivity.locationDetails?.lng !== undefined && (
                      <p className="text-xs text-gray-400">
                        Koordinatlar: {typeof newActivity.locationDetails.lat === 'number' ? newActivity.locationDetails.lat.toFixed(5) : parseFloat(newActivity.locationDetails.lat || 0).toFixed(5)},
                        {" "}
                        {typeof newActivity.locationDetails.lng === 'number' ? newActivity.locationDetails.lng.toFixed(5) : parseFloat(newActivity.locationDetails.lng || 0).toFixed(5)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Konum Görseli</label>
                {newActivity.locationDetails?.imageUrl && (
                  <div className="mb-2 overflow-hidden rounded-xl border border-gray-100">
                    <img
                      src={newActivity.locationDetails.imageUrl}
                      alt={newActivity.locationDetails.name}
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 text-sm">
                    <Camera className="w-4 h-4" />
                    Görsel Yükle
                    <input type="file" accept="image/*" className="hidden" onChange={handleLocationImageUpload} />
                  </label>
                  {newActivity.locationDetails?.imageUrl && (
                    <button
                      type="button"
                      onClick={clearLocationImage}
                      className="px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                      Görseli Kaldır
                    </button>
                  )}
                </div>
                {isFetchingLocationImage && (
                  <p className="text-xs text-gray-500 mt-2">Google görseli aranıyor...</p>
                )}
                {locationImageError && (
                  <p className="text-xs text-red-500 mt-2">{locationImageError}</p>
                )}
                {newActivity.locationDetails?.imageSource === 'google' && newActivity.locationDetails?.imageContext && (
                  <a
                    href={newActivity.locationDetails.imageContext}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Google görsel kaynağını görüntüle
                  </a>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maksimum Katılımcı Sayısı</label>
                <input
                  type="number"
                  min="2"
                  max="50"
                  value={newActivity.maxParticipants}
                  onChange={(e) => setNewActivity({...newActivity, maxParticipants: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleCreateActivity}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Aktifite Oluştur
              </button>
            </div>
          </div>
        )}

        {currentView === 'profile' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="relative inline-block">
                {currentUser.profileImage ? (
                  <img 
                    src={currentUser.profileImage} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                  />
                ) : (
                  <div className="text-6xl mb-4">{currentUser.avatar}</div>
                )}
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden" 
                  />
                </label>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-4">{currentUser.name}</h2>
              <p className="text-gray-600 mt-2">{currentUser.email}</p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Bilgilerim</h3>
                <p className="text-sm text-gray-700"><strong>Şehir:</strong> {currentUser.city}</p>
                <p className="text-sm text-gray-700"><strong>Doğum Tarihi:</strong> {currentUser.birthDate}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">İstatistiklerim</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {activities.filter(a => a.createdBy.id === currentUser.id).length}
                    </p>
                    <p className="text-sm text-gray-600">Oluşturduğum</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {activities.filter(a => a.participants.some(p => p.id === currentUser.id)).length}
                    </p>
                    <p className="text-sm text-gray-600">Katıldığım</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Yaklaşan Aktifitelerim</h3>
                {activities
                  .filter(a => a.participants.some(p => p.id === currentUser.id))
                  .slice(0, 3)
                  .map(activity => (
                    <div key={activity.id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{sportEmojis[activity.sport]}</span>
                        <div>
                          <p className="font-medium text-gray-800">{activity.title}</p>
                          <p className="text-sm text-gray-600">{activity.date} - {activity.time}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {activity.sport}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Favori Sporlarım</h3>
                <div className="flex flex-wrap gap-2">
                  {currentUser.favoriteSports.map((sport) => (
                    <div key={sport} className="flex items-center gap-1 bg-white px-3 py-2 rounded-full border">
                      <span className="text-lg">{sportEmojis[sport]}</span>
                      <span className="text-sm font-medium">{sport}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        <LocationPickerModal
          isOpen={isLocationPickerOpen}
          onClose={() => setIsLocationPickerOpen(false)}
          onSelect={handleLocationSelected}
          initialLocation={newActivity.locationDetails}
        />

        <LocationPreviewModal
          location={locationPreview}
          onClose={() => setLocationPreview(null)}
        />

      </div>
    </div>
  );
};

export default SportsApp;

