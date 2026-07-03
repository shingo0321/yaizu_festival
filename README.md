# LIFFサンプルアプリ

LINEミニアプリ（LIFF）でHTMLページを公開するための最小構成。フロントエンドのみ・Netlify無料枠で完結する。

## 1. LINE Developersでの準備

1. [LINE Developers Console](https://developers.line.biz/console/) にログイン
2. プロバイダーを作成（未作成の場合）
3. 「LINEログイン」チャネルを新規作成
4. チャネルの「LIFF」タブから「追加」をクリックし、LIFFアプリを登録
   - サイズ: Full（お好みで Tall / Compact も可）
   - エンドポイントURL: 後述のNetlifyデプロイ後のURLを入力（一旦仮の値でも登録可、後で編集できる）
   - Scope: `profile` にチェック
5. 発行された **LIFF ID**（`1234567890-AbcdEfgh` のような形式）を控える

## 2. コードの設定

[index.html](index.html) 内の以下の行を、控えたLIFF IDに書き換える。

```js
const LIFF_ID = "YOUR_LIFF_ID";
```

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

LIFF URL（`https://liff.line.me/{LIFF ID}`）をLINEアプリでタップして開くと、ログイン後にプロフィール名とアイコンが表示される。

## 補足

- 完全に無料で使える範囲: Netlify無料枠（帯域100GB/月など）+ LINEログインチャネルは無料
- サーバー処理やデータ保存が必要になったら、Netlify Functions（無料枠あり）の追加を検討する
