import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  LogOut,
  MessageCircle,
  User,
  Dumbbell,
  Check,
  ChevronRight,
} from "lucide-react";

// ---- Types ----
type Sport =
  | "Tenis"
  | "Basketbol"
  | "Futbol"
  | "Voleybol"
  | "Yüzme"
  | "Koşu"
  | "Bisiklet"
  | "Yoga"
  | "Masa Tenisi"
  | "Badminton"
  | "Golf"
  | "Boks"
  | "Dans"
  | "Kayak";

type ActivityLevel = "Başlangıç" | "Orta" | "İleri";

type Activity = {
  id: string;
  title: string;
  date: string; // ISO
  city: string;
  sport: Sport;
  level: ActivityLevel;
  players: number;
  maxPlayers: number;
};

type Message = {
  id: string;
  from: string;
  text: string;
  date: string; // ISO
};

// ---- Demo data ----
const SPORT_EMOJI: Record<Sport, string> = {
  Tenis: "🎾",
  Basketbol: "🏀",
  Futbol: "⚽",
  Voleybol: "🏐",
  Yüzme: "🏊",
  Koşu: "🏃",
  Bisiklet: "🚴",
  Yoga: "🧘",
  "Masa Tenisi": "🏓",
  Badminton: "🏸",
  Golf: "⛳",
  Boks: "🥊",
  Dans: "💃",
  Kayak: "⛷️",
};

const CITIES = ["İstanbul (Avrupa)", "İstanbul (Asya)", "Ankara", "İzmir"] as const;
const LEVELS: ActivityLevel[] = ["Başlangıç", "Orta", "İleri"];
const SPORTS = Object.keys(SPORT_EMOJI) as Sport[];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function AppHome() {
  const nav = useNavigate();

  // ---- Auth guard ----
  useEffect(() => {
    if (!localStorage.getItem("token")) nav("/");
  }, [nav]);

  function logout() {
    localStorage.removeItem("token");
    nav("/");
  }

  // ---- Tabs ----
  type Tab = "activities" | "messages" | "profile";
  const [tab, setTab] = useState<Tab>("activities");

  // ---- State: activities (in-memory) ----
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: uid(),
      title: "Pazar Tenisi Maçı",
      date: new Date().toISOString(),
      city: "İstanbul (Avrupa)",
      sport: "Tenis",
      level: "Orta",
      players: 3,
      maxPlayers: 4,
    },
    {
      id: uid(),
      title: "Akşam Koşusu",
      date: new Date(Date.now() + 86400000).toISOString(),
      city: "İzmir",
      sport: "Koşu",
      level: "Başlangıç",
      players: 5,
      maxPlayers: 10,
    },
  ]);

  // ---- State: messages (in-memory) ----
  const [messages] = useState<Message[]>([
    {
      id: uid(),
      from: "Ece",
      text: "Pazar tenis için raket getiriyor musun?",
      date: new Date().toISOString(),
    },
    {
      id: uid(),
      from: "Mert",
      text: "Koşu temposu 6:00/km uygun mu?",
      date: new Date(Date.now() - 3600_000).toISOString(),
    },
  ]);

  // ---- New activity form ----
  const [form, setForm] = useState<Omit<Activity, "id" | "players">>({
    title: "",
    date: "",
    city: "",
    sport: "Tenis",
    level: "Başlangıç",
    maxPlayers: 4,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const upcoming = useMemo(
    () =>
      [...activities].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    [activities]
  );

  function joinActivity(id: string) {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === id && a.players < a.maxPlayers
          ? { ...a, players: a.players + 1 }
          : a
      )
    );
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Başlık zorunlu";
    if (!form.date) e.date = "Tarih zorunlu";
    if (!form.city) e.city = "Şehir seçilmelidir";
    if (!form.maxPlayers || form.maxPlayers < 2) e.maxPlayers = "En az 2 kişi";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function createActivity(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    const newAct: Activity = {
      id: uid(),
      title: form.title.trim(),
      date: form.date,
      city: form.city,
      sport: form.sport,
      level: form.level,
      players: 1,
      maxPlayers: form.maxPlayers,
    };
    setActivities((p) => [newAct, ...p]);
    setForm({
      title: "",
      date: "",
      city: "",
      sport: "Tenis",
      level: "Başlangıç",
      maxPlayers: 4,
    });
    setTab("activities");
  }

  // ---- UI ----
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Dumbbell className="w-6 h-6" />
            Aktifite
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
          >
            <LogOut className="w-4 h-4" />
            Çıkış
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Tabs */}
        <div className="grid grid-cols-3 bg-white rounded-xl shadow p-1">
          <button
            onClick={() => setTab("activities")}
            className={`py-2 rounded-lg font-medium ${
              tab === "activities" ? "bg-blue-600 text-white" : "text-gray-700"
            }`}
          >
            Aktiviteler
          </button>
          <button
            onClick={() => setTab("messages")}
            className={`py-2 rounded-lg font-medium ${
              tab === "messages" ? "bg-blue-600 text-white" : "text-gray-700"
            }`}
          >
            Mesajlar
          </button>
          <button
            onClick={() => setTab("profile")}
            className={`py-2 rounded-lg font-medium ${
              tab === "profile" ? "bg-blue-600 text-white" : "text-gray-700"
            }`}
          >
            Profil
          </button>
        </div>

        {/* Activities */}
        {tab === "activities" && (
          <section className="space-y-4">
            {/* Create form */}
            <details className="bg-white rounded-xl shadow">
              <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium">
                  <Plus className="w-4 h-4" /> Yeni Aktivite Oluştur
                </div>
                <ChevronRight className="w-4 h-4 opacity-60 group-open:rotate-90 transition-transform" />
              </summary>
              <form onSubmit={createActivity} className="px-4 pb-4 grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-700">Başlık</label>
                  <input
                    className={`w-full mt-1 border rounded-lg p-2 ${errors.title ? "border-red-500" : ""}`}
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Örn: Pazar Tenisi Maçı"
                  />
                  {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="text-sm text-gray-700 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Tarih / Saat
                  </label>
                  <input
                    type="datetime-local"
                    className={`w-full mt-1 border rounded-lg p-2 ${errors.date ? "border-red-500" : ""}`}
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  />
                  {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
                </div>

                <div>
                  <label className="text-sm text-gray-700 flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> Şehir
                  </label>
                  <select
                    className={`w-full mt-1 border rounded-lg p-2 ${errors.city ? "border-red-500" : ""}`}
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  >
                    <option value="">Seçin</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="text-sm text-gray-700">Spor</label>
                  <select
                    className="w-full mt-1 border rounded-lg p-2"
                    value={form.sport}
                    onChange={(e) => setForm((p) => ({ ...p, sport: e.target.value as Sport }))}
                  >
                    {SPORTS.map((s) => (
                      <option key={s} value={s}>
                        {SPORT_EMOJI[s]} {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-700">Seviye</label>
                  <select
                    className="w-full mt-1 border rounded-lg p-2"
                    value={form.level}
                    onChange={(e) => setForm((p) => ({ ...p, level: e.target.value as ActivityLevel }))}
                  >
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-700 flex items-center gap-1">
                    <Users className="w-4 h-4" /> Kontenjan
                  </label>
                  <input
                    type="number"
                    min={2}
                    className={`w-full mt-1 border rounded-lg p-2 ${errors.maxPlayers ? "border-red-500" : ""}`}
                    value={form.maxPlayers}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, maxPlayers: Number(e.target.value || 0) }))
                    }
                  />
                  {errors.maxPlayers && <p className="text-xs text-red-600 mt-1">{errors.maxPlayers}</p>}
                </div>

                <div className="md:col-span-2 flex justify-end gap-2">
                  <button
                    type="reset"
                    onClick={() =>
                      setForm({
                        title: "",
                        date: "",
                        city: "",
                        sport: "Tenis",
                        level: "Başlangıç",
                        maxPlayers: 4,
                      })
                    }
                    className="px-3 py-2 border rounded-lg"
                  >
                    Temizle
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Oluştur
                  </button>
                </div>
              </form>
            </details>

            {/* List */}
            <div className="grid gap-3">
              {upcoming.map((a) => (
                <div key={a.id} className="bg-white rounded-xl shadow p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-lg font-semibold flex items-center gap-2">
                        <span>{SPORT_EMOJI[a.sport]}</span> {a.title}
                      </div>
                      <div className="mt-1 text-sm text-gray-600 flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(a.date).toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {a.city}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {a.level}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {a.players}/{a.maxPlayers}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => joinActivity(a.id)}
                      disabled={a.players >= a.maxPlayers}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        a.players >= a.maxPlayers
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {a.players >= a.maxPlayers ? "Dolu" : "Katıl"}
                    </button>
                  </div>
                </div>
              ))}
              {upcoming.length === 0 && (
                <div className="bg-white rounded-xl shadow p-6 text-center text-gray-600">
                  Henüz aktivite yok. Hadi bir tane oluştur! ✨
                </div>
              )}
            </div>
          </section>
        )}

        {/* Messages */}
        {tab === "messages" && (
          <section className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="bg-white rounded-xl shadow p-4 flex gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 grid place-items-center text-blue-700">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{m.from}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(m.date).toLocaleString()}
                    </div>
                  </div>
                  <p className="text-gray-700 mt-1">{m.text}</p>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="bg-white rounded-xl shadow p-6 text-center text-gray-600">
                Mesaj yok.
              </div>
            )}
          </section>
        )}

        {/* Profile */}
        {tab === "profile" && (
          <section className="bg-white rounded-xl shadow p-6 space-y-3">
            <div className="text-xl font-semibold">Profil</div>
            <div className="text-gray-600">Bu alanı yakında doldururuz. 🎯</div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="border rounded-lg p-3">
                <div className="text-sm text-gray-500">Toplam Aktivite</div>
                <div className="text-2xl font-bold">{activities.length}</div>
              </div>
              <div className="border rounded-lg p-3">
                <div className="text-sm text-gray-500">Gelen Mesaj</div>
                <div className="text-2xl font-bold">{messages.length}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <Check className="w-5 h-5" />
              Demo verilerle çalışıyor.
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
