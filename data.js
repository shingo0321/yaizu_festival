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

  venue: {
    name: "TODO: 会場名",
    address: "静岡県焼津市", // TODO: 実際の住所に変更（Googleマップの検索欄に入る文字列でOK）
    access: [
      "TODO: 電車でのアクセス（例: JR焼津駅から徒歩◯分）",
      "TODO: 車でのアクセス・駐車場情報",
      "TODO: バスでのアクセス"
    ]
  }
};
