import React from "react";

const CategoryIconHelp = ({ isOpen, setIsOpen }) => {

  const iconCategories = [
    { id: 0, name: "その他", img: "/other.png", description: "その他のイベント" },
    { id: 1, name: "花火", img: "/hanabi.svg", description: "花火大会" },
    { id: 2, name: "祭り", img: "/maturi.png", description: "お祭り・伝統行事" },
    { id: 3, name: "グルメ", img: "/gurume.png", description: "食べ物・グルメイベント" },
    { id: 4, name: "アート", img: "/art.png", description: "美術・アート展示" },
    { id: 5, name: "ゲーム", img: "/game.png", description: "ゲーム関連イベント" },
    { id: 6, name: "アクティビティ", img: "/activity.png", description: "スポーツ・体験活動" },
    { id: 7, name: "音楽", img: "/music.png", description: "コンサート・音楽イベント" },
  ];

  return (
    <>
      {/* モーダル */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
            {/* ヘッダー */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">アイコンの説明</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path 
                    fillRule="evenodd" 
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
            </div>

            {/* コンテンツ */}
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <p className="text-sm text-gray-600 mb-4">
                マップ上のアイコンは、以下のカテゴリを表しています：
              </p>
              <div className="space-y-3">
                {iconCategories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                    <div className="flex-shrink-0">
                      <img
                        src={category.img}
                        alt={category.name}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* フッター */}
            <div className="p-4 border-t">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-white py-2 px-4 rounded-lg transition-colors"
                style={{ backgroundColor: '#3B82F6' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2563EB'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3B82F6'}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryIconHelp;