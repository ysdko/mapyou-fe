import { useState, useEffect } from "react";

export default function Sidebar({ selectedEvent, currentUser }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // ✅ 投稿処理
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment) return;

    const newReview = {
      id: Date.now(), // 簡易的な一意ID
      user_name: currentUser?.username || "匿名",
      rating,
      comment,
    };

    setReviews((prev) => [newReview, ...prev]);
    setRating(5);
    setComment("");
  };

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
              <p className="text-xs text-gray-400">by {r.user_name}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">口コミはまだありません。</p>
        )}
      </div>

      {/* === 投稿フォーム === */}
      {currentUser ? (
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-semibold mb-2">口コミを投稿</h3>

          <label className="block mb-1 text-sm font-medium">評価 (1〜5)</label>
          <select
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
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
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border rounded px-2 py-1 mb-3"
            rows={3}
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            投稿する
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500">
          口コミ投稿にはログインが必要です。
        </p>
      )}
    </div>
  );
}
