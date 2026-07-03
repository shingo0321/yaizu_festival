# 焼津祭ポータルサイト

焼津祭の「開催日程・タイムテーブル」「地図」を掲載するポータルサイト。
通常のWebサイトとしても、LINEミニアプリ（LIFF）としても同じURLで開ける構成。フロントエンドのみ・Netlify無料枠で完結する。

## ファイル構成

- [index.html](index.html) — ページ構造
- [style.css](style.css) — 見た目
- [data.js](data.js) — 掲載内容（**実際の情報に差し替えるのはこのファイルだけでOK**）
- [app.js](app.js) — 描画処理・LINEでのシェアボタン制御

## 1. 内容の差し替え

[data.js](data.js) 内の `TODO:` と書かれた箇所を、実際のタイトル・日程情報に書き換える。
`mapPins.points` は `{ label, lat, lng }` の配列。地図のピンを立てる（[Leaflet](https://leafletjs.com/) + OpenStreetMapを使用、APIキー不要）。緯度経度はGoogleマップでピンを開き、URLの `@緯度,経度` 部分から取得できる。
`mapPins.excelRouteLine` は上記3地点を徒歩で結んだ実際の道なりルート（[OSRM](https://project-osrm.org/) の公開デモサーバーで取得した座標列を直接埋め込み済み）。地点を変更した場合は座標列も再取得が必要。OSRMの公開デモサーバーは本番の大規模利用を想定していないため、小規模利用の前提で使用している。
`mapPins.mikoshiRouteLines` は焼津神社公式サイトの順路略図の矢印（濃い黒＝往路／薄い黒＝帰路）を参考にした概略ルート。`outbound`（往路）と `return`（帰路）それぞれ `{ label, lat, lng }` の配列で、地図上に色分けした線として描画される。元画像がスケール通りではない模式図のため、実際の道なりではなく主要地点を直線で結んだ概略である点に注意。
`mapPins.officialRouteImage` は地図の下に表示する参考画像（焼津神社公式サイトの神輿渡御順路図を直接参照）。年によって画像URLが変わるため、更新時は焼津神社公式サイトで最新の画像URLを確認する。
HTMLやCSSは触らずに済む構成になっている。

## 2. LINE Developersでの準備（LIFFとして開く場合）

1. [LINE Developers Console](https://developers.line.biz/console/) にログイン
2. プロバイダーを作成（未作成の場合）
3. 「LINEログイン」チャネルを新規作成
4. チャネルの「LIFF」タブから「追加」をクリックし、LIFFアプリを登録
   - サイズ: Full（お好みで Tall / Compact も可）
   - エンドポイントURL: 後述のNetlifyデプロイ後のURLを入力（一旦仮の値でも登録可、後で編集できる）
   - Scope: `profile` は不要（ログイン不要な公開ページのため）。シェアボタンを使う場合は特別な設定は不要
5. 発行された **LIFF ID**（`1234567890-AbcdEfgh` のような形式）を控える

[app.js](app.js) 内の以下の行を、控えたLIFF IDに書き換える。

```js
const LIFF_ID = "YOUR_LIFF_ID";
```

※ LINE外の通常ブラウザで開いた場合、LIFF初期化は失敗するがページ表示には影響しない（シェアボタンが非表示になるだけ）。

## 3. Netlifyアカウントの作成

1. [Netlify](https://www.netlify.com/) にアクセスし「Sign up」をクリック
2. GitHubアカウント（推奨）またはメールアドレスでサインアップ
   - GitHub連携しておくと、後述のリポジトリ連携がそのまま行える
3. 無料プラン（Free）のまま利用すればOK。クレジットカード登録は不要

## 4. Netlifyへのデプロイ

- GitHubリポジトリに push してNetlifyと連携するか、Netlify CLI / ドラッグ&ドロップでこのフォルダをデプロイする
- ビルドコマンドは不要（静的ファイルのみ）。`netlify.toml` で公開ディレクトリを `.` に指定済み

デプロイ後に発行されるURL（例: `https://xxxx.netlify.app`）を、LINE DevelopersのLIFFエンドポイントURLに設定し直す。

## 5. 動作確認

- 通常サイトとして: NetlifyのURLをブラウザで開く
- LIFFとして: LIFF URL（`https://liff.line.me/{LIFF ID}`）をLINEアプリでタップして開く。LINE内で開いた場合のみ「LINEで友だちにシェア」ボタンが表示される

## 補足

- 完全に無料で使える範囲: Netlify無料枠（帯域100GB/月など）+ LINEログインチャネルは無料
- 地図はLeaflet + OpenStreetMap（どちらも無料・APIキー不要）を使用しているため追加費用は発生しない
- 神輿渡御順路の画像は焼津神社公式サイトの画像を直接参照（ホットリンク）しており、当サイトにはコピーを保存していない
- サーバー処理やデータ保存が必要になったら、Netlify Functions（無料枠あり）の追加を検討する
- **注意**: 現在の [data.js](data.js) の開催日程には、本人の希望により個人名・自宅名を含む内容がそのまま掲載されている。公開範囲を変更したい場合はこのファイルを直接編集する
