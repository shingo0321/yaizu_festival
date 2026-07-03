// 焼津祭ポータルサイトのコンテンツデータ
// ここを実際の情報に差し替えるだけでページ全体が更新されます。
const FESTIVAL_DATA = {
  title: "焼津祭",
  subtitle: "TODO: キャッチコピーを入れる",
  dateRange: "TODO: 開催日程（例: 2026年8月1日(土)・2日(日)）",

  schedule: [
    {
      day: "1日目",
      date: "TODO: 日付（例: 8月1日(土)）",
      items: [
        { time: "10:00", title: "TODO: プログラム名", place: "TODO: 場所" },
        { time: "13:00", title: "TODO: プログラム名", place: "TODO: 場所" },
        { time: "18:00", title: "TODO: プログラム名", place: "TODO: 場所" }
      ]
    },
    {
      day: "2日目",
      date: "TODO: 日付（例: 8月2日(日)）",
      items: [
        { time: "10:00", title: "TODO: プログラム名", place: "TODO: 場所" },
        { time: "15:00", title: "TODO: プログラム名", place: "TODO: 場所" },
        { time: "19:00", title: "TODO: プログラム名", place: "TODO: 場所" }
      ]
    }
  ],

  // 焼津祭_2026.xlsx の「地図」シートに記載の経路（Googleマップリンクの座標を使用）。
  mikoshiRoute: {
    title: "焼津祭 経路マップ（2026年）",
    // label: 表示名 / query: 地図検索に使う緯度経度（Googleマップリンクから取得）
    points: [
      { label: "焼津神社", query: "34.8650983,138.3137528" },
      { label: "ギャングスター", query: "34.8643354,138.3143884" },
      { label: "丸久食品", query: "34.85763,138.3230476" }
    ],
    notes: []
  }
};
