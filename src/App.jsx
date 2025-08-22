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
      <header className="absolute top-0 left-0 right-0 bg-white shadow z-10 flex justify-between items-center px-6 py-3">
        <div className="flex items-center space-x-2">
          <img src="/mapyou-logo.png" alt="MAPYOU Logo" className="h-15 w-15" />
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
            className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            ログイン
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            新規作成
          </button>
        </div>
      </header>

      {/* サイドバー（選択時にスライド表示） */}
      {selectedEvent && (
        <div className="absolute top-0 left-0 h-full z-20">
          <Sidebar selectedEvent={selectedEvent} currentUser={username} />
        </div>
      )}

      <div className="flex pt-[60px] h-full">
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={11}>
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
