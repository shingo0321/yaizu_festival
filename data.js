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

  mikoshiRoute: {
    title: "TODO: 経路名（例: 神輿渡御ルート）",
    // 出発地から到着地まで、経由順に地名・住所を入れる（2件以上）
    points: [
      "TODO: 出発地（例: 焼津神社）",
      "TODO: 経由地1",
      "TODO: 経由地2",
      "TODO: 到着地"
    ],
    notes: [
      "TODO: 出発時刻",
      "TODO: 到着予定時刻",
      "TODO: 交通規制などの注意事項"
    ]
  }
};
