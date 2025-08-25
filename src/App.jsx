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
import CategoryIconHelp from "./CategoryIconHelp.jsx";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 35.6812, // 東京駅
  lng: 139.7671,
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const MyComponent = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  const [username, setUsername] = useState(null);
  const [events, setEvents] = useState([]);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEventDetails, setIsLoadingEventDetails] = useState(false);
  const [boundsChangeTimeout, setBoundsChangeTimeout] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [eventPeriod, setEventPeriod] = useState("today"); // "today", "weekend", "all"

  const iconMap = {
    0: { img: "/other.png", size: 30 },
    1: { img: "/hanabi.svg", size: 100 },
    2: { img: "/maturi.png", size: 30 },
    3: { img: "/gurume.png", size: 30 },
    4: { img: "/art.png", size: 30 },
    5: { img: "/game.png", size: 30 },
    6: { img: "/activity.png", size: 30 },
    7: { img: "/music.png", size: 30 },
    8: { img: "/other.png", size: 30 },
  };

  const fetchEventsInBounds = async (bounds, period = eventPeriod) => {
    if (!bounds) return;

    setIsLoading(true);
    try {
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      const params = new URLSearchParams({
        north: ne.lat(),
        south: sw.lat(),
        east: ne.lng(),
        west: sw.lng(),
        fields: "id,lat,lng,icon_category", // マップ表示用の軽量データのみ取得
        period: period, // 期間フィルター
      });

      const res = await fetch(`${API_BASE}/events/bounds?${params}`);
      if (!res.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEventDetails = async (eventId) => {
    setIsLoadingEventDetails(true);
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch event details");
      }
      const eventDetails = await res.json();
      return eventDetails;
    } catch (err) {
      console.error("Error fetching event details:", err);
      return null;
    } finally {
      setIsLoadingEventDetails(false);
    }
  };

  useEffect(() => {
    if (map) {
      const bounds = map.getBounds();
      fetchEventsInBounds(bounds);
    }
  }, [map]);

  // 期間フィルターが変更された時にイベントを再取得
  useEffect(() => {
    if (map) {
      const bounds = map.getBounds();
      fetchEventsInBounds(bounds, eventPeriod);
    }
  }, [eventPeriod]);

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

  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(userPos);
            setMapCenter(userPos);
          },
          (error) => {
            console.error("位置情報の取得に失敗しました:", error);
            // 現在地取得失敗時のみデフォルト位置を設定
            setMapCenter(defaultCenter);
          },
          {
            enableHighAccuracy: false, // 高精度を無効にして高速化
            timeout: 3000, // タイムアウトを3秒に短縮
            maximumAge: 300000, // キャッシュ時間を5分に短縮
          }
        );
      } else {
        console.error("このブラウザは位置情報をサポートしていません");
        // 位置情報サポートなし時にデフォルト位置を設定
        setMapCenter(defaultCenter);
      }
    };

    getCurrentLocation();
  }, []);
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* ヘッダー */}
      <header className="absolute top-0 left-0 right-0 bg-white shadow z-10">
        {/* PC用ヘッダー */}
        <div className="hidden md:block">
          <div className="flex justify-between items-center px-6 py-2">
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsHelpOpen(true)}
                className="text-white rounded-full p-2 shadow-lg transition-colors"
                style={{ backgroundColor: "#3B82F6" }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#2563EB")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#3B82F6")
                }
                title="アイコンの説明を見る"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
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

          {/* PC用期間タブ */}
          <div className="flex justify-center border-t border-gray-200 py-2">
            <div className="flex space-x-1">
              <button
                onClick={() => setEventPeriod("today")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  eventPeriod === "today"
                    ? "text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                style={{
                  backgroundColor:
                    eventPeriod === "today" ? "#3B82F6" : undefined,
                }}
              >
                今日
              </button>
              <button
                onClick={() => setEventPeriod("weekend")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  eventPeriod === "weekend"
                    ? "text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                style={{
                  backgroundColor:
                    eventPeriod === "weekend" ? "#3B82F6" : undefined,
                }}
              >
                今週末
              </button>
              <button
                onClick={() => setEventPeriod("all")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  eventPeriod === "all"
                    ? "text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                style={{
                  backgroundColor:
                    eventPeriod === "all" ? "#3B82F6" : undefined,
                }}
              >
                今月
              </button>
            </div>
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
              onClick={() => setIsHelpOpen(true)}
              className="text-white rounded-full p-1 shadow-lg transition-colors"
              style={{ backgroundColor: "#3B82F6", fontSize: "10px" }}
              title="アイコンの説明を見る"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
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

          {/* スマホ用期間タブ */}
          <div className="flex justify-center border-t border-gray-200 py-1">
            <div className="flex space-x-1">
              <button
                onClick={() => setEventPeriod("today")}
                className={`flex-1 font-medium rounded py-0.5 px-1.5 text-center transition-colors whitespace-nowrap ${
                  eventPeriod === "today"
                    ? "text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                style={{
                  backgroundColor:
                    eventPeriod === "today" ? "#3B82F6" : undefined,
                  fontSize: "10px",
                }}
              >
                今日
              </button>
              <button
                onClick={() => setEventPeriod("weekend")}
                className={`flex-1 font-medium rounded py-0.5 px-1.5 text-center transition-colors whitespace-nowrap ${
                  eventPeriod === "weekend"
                    ? "text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                style={{
                  backgroundColor:
                    eventPeriod === "weekend" ? "#3B82F6" : undefined,
                  fontSize: "10px",
                }}
              >
                今週末
              </button>
              <button
                onClick={() => setEventPeriod("all")}
                className={`flex-1 font-medium rounded py-0.5 px-1.5 text-center transition-colors whitespace-nowrap ${
                  eventPeriod === "all"
                    ? "text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                style={{
                  backgroundColor:
                    eventPeriod === "all" ? "#3B82F6" : undefined,
                  fontSize: "10px",
                }}
              >
                今月
              </button>
            </div>
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

      {(isLoading || isLoadingEventDetails) && (
        <div className="absolute top-[80px] md:top-[100px] left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg z-20">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
            <span className="text-sm text-gray-600">
              {isLoadingEventDetails
                ? "イベント詳細を読み込み中..."
                : "読み込み中..."}
            </span>
          </div>
        </div>
      )}

      <div className="flex pt-[80px] md:pt-[120px] h-full">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={13}
          onLoad={(mapInstance) => setMap(mapInstance)}
          onBoundsChanged={() => {
            if (map && !isLoading) {
              if (boundsChangeTimeout) {
                clearTimeout(boundsChangeTimeout);
              }

              const newTimeout = setTimeout(() => {
                const bounds = map.getBounds();
                fetchEventsInBounds(bounds, eventPeriod);
              }, 500);

              setBoundsChangeTimeout(newTimeout);
            }
          }}
          options={{
            gestureHandling: "greedy",
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: false,
          }}
        >
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                url: "data:image/svg+xml;charset=UTF-8,%3csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='10' cy='10' r='8' fill='%234285f4'/%3e%3ccircle cx='10' cy='10' r='3' fill='white'/%3e%3c/svg%3e",
                scaledSize: new window.google.maps.Size(20, 20),
              }}
              title="現在地"
            />
          )}
          {events.map((event) => (
            <Marker
              key={event.id}
              position={{ lat: event.lat, lng: event.lng }}
              onClick={async () => {
                const eventDetails = await fetchEventDetails(event.id);
                if (eventDetails) {
                  setSelectedEvent(eventDetails);
                }
              }}
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

      {/* カテゴリヘルプ */}
      <CategoryIconHelp isOpen={isHelpOpen} setIsOpen={setIsHelpOpen} />
    </div>
  );
};

export default MyComponent;
