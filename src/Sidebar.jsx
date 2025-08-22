import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

export default function Sidebar({ selectedEvent, currentUser, onClose, isMobile = false }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { rating: 5, comment: "" } });

  const eventId = selectedEvent?.id;

  // 一覧取得
  const fetchReviews = useMemo(
    () => async () => {
      if (!eventId) return;
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(
          `${API_BASE}/reviews/${encodeURIComponent(eventId)}`,
          { method: "GET", credentials: "include" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErr("レビューの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    },
    [API_BASE, eventId]
  );

  // サイドバーが開かれた（= selectedEvent が変わった）タイミングで取得
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // 投稿
  async function onSubmit(data) {
    if (!currentUser) {
      setErr("ログインが必要です。");
      return;
    }
    if (!eventId) {
      setErr("イベントが選択されていません。");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          user_id: currentUser?.userId,
          event_id: eventId,
          rating: parseInt(data.rating, 10),
          comment: data.comment,
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
      }
      reset({ rating: 5, comment: "" });
      await fetchReviews();
    } catch (e) {
      console.error(e);
      setErr("投稿に失敗しました。");
    }
  }

  return (
    <div className={`${isMobile ? 'w-full h-auto max-h-full relative' : 'w-96 bg-white border-l h-screen shadow-xl relative'}`}>
      {/* スマホ用ハンドルバー */}
      {isMobile && (
        <div className="flex justify-center mb-2 p-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>
      )}
      <button
        type="button"
        onClick={onClose}
        data-drawer-hide="drawer-navigation"
        aria-controls="drawer-navigation"
        className={`text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 absolute ${isMobile ? 'top-2 right-2' : 'top-2.5 end-2.5'} inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white z-10`}
      >
        <svg
          aria-hidden="true"
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          ></path>
        </svg>
        <span className="sr-only">Close menu</span>
      </button>
      
      {/* スクロール可能なコンテンツエリア */}
      <div className={`${isMobile ? 'p-4 pt-8 max-h-[80vh] overflow-y-auto' : 'p-4 pt-12 h-full overflow-y-auto'}`}>
        {/* === イベント詳細 === */}
        <div className="mb-4 text-sm text-gray-700 space-y-1">
        {selectedEvent?.site_url && (
          <div>
            <span className="font-medium">公式サイト: </span>
            <a
              href={selectedEvent.site_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline break-words"
            >
              {selectedEvent.site_url}
            </a>
          </div>
        )}
        {selectedEvent?.category && (
          <div>
            <span className="font-medium">カテゴリー: </span>
            {selectedEvent.category}
          </div>
        )}
        {selectedEvent?.start_date && selectedEvent?.end_date && (
          <div>
            <span className="font-medium">開催期間: </span>
            {new Date(selectedEvent.start_date).toLocaleDateString()} ～{" "}
            {new Date(selectedEvent.end_date).toLocaleDateString()}
          </div>
        )}
        {selectedEvent?.location && (
          <div>
            <span className="font-medium">開催場所: </span>
            {selectedEvent.location}
          </div>
        )}
      </div>

      {/* 取得状態/エラー */}
      {err && <p className="text-red-600 mb-3">{err}</p>}
      {loading && <p className="text-gray-500">読み込み中...</p>}

      {/* === 投稿フォーム / 未ログイン案内 === */}
      {currentUser ? (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">口コミを投稿</h3>

          <label className="block mb-1 text-sm font-medium text-gray-700">評価 (1〜5)</label>
          <select
            {...register("rating")}
            className="w-full border border-gray-300 rounded px-2 py-1 mb-3 bg-white text-gray-800"
          >
            {[1, 2, 3, 4, 5].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          <label className="block mb-1 text-sm font-medium text-gray-700">コメント</label>
          <textarea
            {...register("comment")}
            className="w-full border border-gray-300 rounded px-2 py-1 mb-3 bg-white text-gray-800 placeholder-gray-500"
            rows={3}
            placeholder="感想を入力..."
          />

          <button
            type="submit"
            className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            投稿する
          </button>
        </form>
      ) : (
        <p className="text-red-500 mb-3">口コミ投稿にはログインが必要です。</p>
      )}

      {/* === 口コミ一覧 === */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">口コミ一覧</h3>
        <div>
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r.id} className="mb-3 border-b border-gray-200 pb-2">
                <div className="text-yellow-500 text-sm">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </div>
                <p className="text-gray-700 text-sm mt-1">{r.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">口コミはまだありません。</p>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
