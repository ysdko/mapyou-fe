import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import Sidebar from "./Sidebar.jsx";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 35.6812, // 東京駅
  lng: 139.7671,
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const MyComponent = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  const [username, setUsername] = useState(null);

  const [events, setEvents] = useState([]);

  const iconMap = {
    0: { img: "/other.svg", size: 40 },
    1: { img: "/hanabi.svg", size: 100 },
    2: { img: "/maturi.png", size: 40 },
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_BASE}/events/today`);
        if (!res.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const session = await fetchAuthSession();
      if (!session.tokens) {
        return;
      }
      try {
        const user = await getCurrentUser();
        setUsername(user);
      } catch (err) {
        console.error("未ログインまたは取得エラー:", err);
      }
    };

    fetchUser();
  }, []);
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* ヘッダー */}
      <header className="absolute top-0 left-0 right-0 bg-white shadow z-10">
        {/* PC用ヘッダー */}
        <div className="hidden md:flex justify-between items-center px-6 py-3">
          <div className="flex items-center space-x-2">
            <img
              src="/mapyou-logo.png"
              alt="MAPYOU Logo"
              className="h-15 w-15"
            />
            <h1 className="text-xl font-bold text-gray-800">MAPYOU</h1>
          </div>
          {username ? (
            <p>こんにちは, {username.username} さん</p>
          ) : (
            <p>ログインしていません</p>
          )}
          <div className="space-x-4">
            <button
              onClick={() => navigate("/signin")}
              className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              ログイン
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              新規作成
            </button>
          </div>
        </div>

        {/* スマホ用ヘッダー */}
        <div className="md:hidden px-2 py-0.5">
          {/* 上段：ロゴとタイトル */}
          <div className="flex items-center space-x-1 mb-0.5">
            <img src="/mapyou-logo.png" alt="MAPYOU Logo" className="h-5 w-5" />
            <h1
              className="font-bold text-gray-800"
              style={{ fontSize: "20px" }}
            >
              MAPYOU
            </h1>
          </div>

          {/* ユーザー情報 */}
          <div className="mb-1">
            {username ? (
              <p className="text-xs text-gray-600">
                こんにちは, {username.username}さん
              </p>
            ) : (
              <p className="text-xs text-gray-600">未ログイン</p>
            )}
          </div>

          {/* 下段：ボタン */}
          <div className="flex space-x-1 mb-1">
            <button
              onClick={() => navigate("/signin")}
              className="flex-1 text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-2 focus:outline-none focus:ring-red-300 font-medium rounded py-0.5 px-1.5 text-center"
              style={{ fontSize: "10px" }}
            >
              ログイン
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="flex-1 text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-2 focus:outline-none focus:ring-red-300 font-medium rounded py-0.5 px-1.5 text-center"
              style={{ fontSize: "10px" }}
            >
              新規作成
            </button>
          </div>
        </div>
      </header>

      {/* サイドバー（PC: 左側、スマホ: 下からスライド） */}
      {selectedEvent && (
        <>
          {/* PC用サイドバー */}
          <div className="hidden md:block absolute top-0 left-0 h-full z-20">
            <Sidebar
              selectedEvent={selectedEvent}
              currentUser={username}
              onClose={() => setSelectedEvent(null)}
            />
          </div>

          {/* スマホ用ボトムシート */}
          <div className="md:hidden fixed inset-x-0 bottom-0 z-10">
            {/* ボトムシート */}
            <div className="relative w-full bg-white rounded-t-lg max-h-[90vh] animate-slide-up shadow-2xl">
              <Sidebar
                selectedEvent={selectedEvent}
                currentUser={username}
                onClose={() => setSelectedEvent(null)}
                isMobile={true}
              />
            </div>
          </div>
        </>
      )}

      <div className="flex pt-[45px] md:pt-[60px] h-full">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={11}
          options={{
            gestureHandling: "greedy",
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: false,
          }}
        >
          {events.map((event) => (
            <Marker
              key={event.id}
              position={{ lat: event.lat, lng: event.lng }}
              onClick={() => setSelectedEvent(event)}
              icon={{
                url: iconMap[event.icon_category]["img"],
                scaledSize: new window.google.maps.Size(
                  iconMap[event.icon_category]["size"],
                  iconMap[event.icon_category]["size"]
                ),
              }}
            />
          ))}
        </GoogleMap>
      </div>
    </div>
  );
};

export default MyComponent;
