import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

export default function Sidebar({ selectedEvent, currentUser }) {
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

  const eventId = selectedEvent?.id; // ← サイドバー対象イベントID

  // 一覧取得
  const fetchReviews = useMemo(
    () => async () => {
      if (!eventId) return;
      setLoading(true);
      setErr("");
      console.log(`Fetching reviews for event ${eventId}`);
      try {
        const res = await fetch(
          `${API_BASE}/reviews/${encodeURIComponent(eventId)}`,
          {
            method: "GET",
            credentials: "include",
          }
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
          user_id: currentUser?.userId, // バックエンドの型に合わせて string/int を確認
          event_id: eventId,
          rating: parseInt(data.rating, 10),
          comment: data.comment,
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
      }
      // 投稿成功 → フォーム初期化 & 一覧再取得
      reset({ rating: 5, comment: "" });
      await fetchReviews();
    } catch (e) {
      console.error(e);
      setErr("投稿に失敗しました。");
    }
  }

  if (!currentUser) {
    return <p className="text-gray-600">投稿にはログインが必要です。</p>;
  }

  return (
    <div className="w-96 bg-white border-l p-4 h-screen overflow-y-auto shadow-xl">
      <h2 className="text-xl font-bold mb-2">{selectedEvent?.title}</h2>

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

      {/* === 投稿フォーム === */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-lg font-semibold mb-2">口コミを投稿</h3>

        <label className="block mb-1 text-sm font-medium">評価 (1〜5)</label>
        <select
          {...register("rating")}
          className="w-full border rounded px-2 py-1 mb-3"
        >
          {[1, 2, 3, 4, 5].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <label className="block mb-1 text-sm font-medium">コメント</label>
        <textarea
          {...register("comment")}
          className="w-full border rounded px-2 py-1 mb-3"
          rows={3}
          placeholder="感想を入力..."
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          投稿する
        </button>
      </form>

      {/* === 口コミ一覧 === */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">口コミ一覧</h3>
        {reviews.length > 0 ? (
          reviews.map((r) => (
            <div key={r.id} className="mb-3 border-b pb-2">
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
  );
}
