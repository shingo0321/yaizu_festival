# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際にClaude Code(claude.ai/code)へガイダンスを提供するものです。

## これは何か

焼津祭のスケジュール/タイムテーブルと地図情報を表示する静的なフロントエンドのみのWebサイト(ビルド不要、依存関係なし)。プレビューは`index.html`をブラウザで直接開く。

## アーキテクチャ

- `data.js` — 全コンテンツ(`roles`、`schedule`、`mapPins`など)。通常の更新で**編集すべき唯一のファイル**であり、`TODO:`マーカーを探すこと。
  - `roles`/`schedule`はDropboxで管理されているExcel原本ファイルをミラーしている — そのファイルはローカルには保存されておらず、更新時はDropboxのファイルを直接参照すること(共有リンクはサイト所有者が非公開で保持しており、ここには記載していない)。
  - `mapPins.points`は`{ label, lat, lng, mapUrl }`の配列。地図タブにリストとして描画される。`mapUrl`(任意)は「Googleマップで見る」リンクを追加する。現時点でインタラクティブな地図は存在しない。
  - `mapPins.routeDiagram`は、地図タブの公式参照画像の上に、ローカル保存された簡略ルート図(`mikoshi-route.svg`、青=往路/緑=帰路)を描画し、加えて「簡略図のPDFを開く」リンク(`mikoshi-route.pdf`へ)を表示する。このSVGは`mikoshi-route.dio`(draw.ioのソースファイル)から`gen_route_svg.py`によって生成される。PDFはそのSVGから`gen_route_pdf.sh`によって生成される。
  - `mapPins.officialRouteImage`は、焼津神社公式サイトから参照画像(神輿ルートマップ)を直接ホットリンクしている — ローカルコピーは保存しておらず、URLは年ごとに変わるため、更新時は公式サイトと突き合わせて確認すること。
  - `mapPins.excelRouteLine`は、以前のLeafletベースのインタラクティブ地図用に残っていたデータで、現在は未使用。
  - `mikoshi-route-reference.jpg`は、来歴/比較用に保持している公式ルートマップのダウンロードコピー — 未追跡(gitで管理外)で、サイトからは参照されていない。
  - `mapPins.restAreas`(`title`、`pdf: "rest-areas.pdf"`、`groups: [{ area, points: [{ label, lat, lng, mapUrl, image? }] }]`)は、休憩所の位置情報の正となるデータであり、地図タブにエリアごとのリストとして描画され、加えて「休憩所一覧のPDFを開く」リンクを表示する。`rest-areas.md`(人間可読な形式、同じエリア/地点)と`rest_areas.json`(同じ地点をプレーンなlat/lngで持つもの)はこのデータの並行コピーであり、自動同期はされていない — `restAreas`を変更したら、この2つも手動で合わせて更新すること。
- `app.js` — `data.js`のコンテンツを純粋にDOMへ描画する。インタラクティブな地図ロジックはもう残っていない。タブスワイプジェスチャー(`setupSwipe`、document単位の`touchstart`/`touchend`)と、ルート画像のライトボックス(`setupLightbox`、`#lightbox-viewport`上のpointerイベントによるピンチズーム/パン)も担当する。この2つのタッチハンドラは競合しうる: `setupSwipe`は`#lightbox`内をターゲットとするタッチを無視するので、ズームした地図画像のパン/ピンチ操作がタブスワイプとして誤認識されない — どちらかのハンドラに手を入れる際もこのガードは維持すること。
  - ライトボックスの操作仕様は、複数回のユーザーテスト/フィードバックを経て確定したものであり、逸脱はスタイルの選択ではなく退行(リグレッション)として扱うこと:
    - **閉じる操作**: ✕ボタンとEscapeキーのみで閉じる。暗い背景のクリック/タップでは閉じない(意図的に削除 — ズームした画像をパンする操作が背景クリックとして誤検知され、意図せず閉じてしまうことがあったため)。
    - **閉じるボタンの位置**: 左下(`.lightbox-close`の`bottom`+`left`、`style.css`)であり、上部の角ではない — モバイルSafariでは上部の角がブラウザ自身の動的ツールバーによって、`env(safe-area-inset-*)`を十分に取っても隠れてしまうため。
    - **ドラッグでのパン**: `#lightbox-img`に`draggable="false"`を設定し、CSSで`-webkit-user-drag: none`、さらにJSの`dragstart`で`preventDefault()`(念のための多重対策)が必要 — この3つすべてがないと、ブラウザ標準の「画像をドラッグする」ジェスチャーが、カスタムのpointerベースのパン処理が依存するマウスダウン&ムーブを奪ってしまい、クリックドラッグでのスクロールが何も起きなくなる。
    - **ホイール/トラックパッド**: `ctrlKey`付きのwheelイベント(ブラウザがトラックパッドのピンチをこのように報告する)のみズームし、通常のwheelイベント(マウスホイール、または`deltaX`/`deltaY`両方を持つ2本指トラックパッドスクロール)はパンする — `deltaX`/`deltaY`をそのまま`scrollLeft`/`scrollTop`に適用しているため斜め方向のスクロールも機能する。すべてのwheelイベントをズームとして扱っていたのが以前のバグで、通常のトラックパッドスクロールを乗っ取ってしまい、斜め方向のパンが不可能になっていた。
    - **スクロールバー**: 非表示(`.lightbox-viewport`に`scrollbar-width: none`など)。パンは`scrollLeft`/`scrollTop`によるJS制御のみで行われ、スクロールバーのつまみをドラッグする方式ではないため — 表示したままだと何の役にも立たず、閉じるボタンと重なってしまっていた。
- `index.html` / `style.css` — 構造とスタイリング。通常のコンテンツ更新では変更不要と想定される。
- `gate.js` — `data.js`/`app.js`が読み込まれる前に表示するクライアントサイドのパスワードゲート(あくまでカジュアルな訪問者を抑止するのみ。本当のアクセス制御にはリポジトリ自体を非公開にする必要がある。公開リポジトリのままでは、このゲートに関わらず`data.js`は直接フェッチ可能なため)。
- `print.html` / `gen_schedule_pdf.sh` — headless Chromeを使って`data.js`の`schedule`から印刷用の`schedule.pdf`を生成する。`print.html`は実際にレンダリングされた行の高さを計測して自動的にページ分割し、A4横向きのページに収まらない日はページをまたいで分割し、見出しに`(n/total)`のサフィックスを付ける。
- `rest-areas-print.html` / `gen_rest_areas_pdf.sh` — `print.html`/`gen_schedule_pdf.sh`と同じパターンだが、対象は`data.js`の`mapPins.restAreas`で、`rest-areas.pdf`(地図タブの休憩所カードからリンク)を生成する。内容(5エリア、7地点)が確実に1ページに収まるため、A4縦向き1ページ固定のレイアウトで、ページ分割ロジックは持たない。
- `mikoshi-route.dio` / `gen_route_svg.py` — `gen_route_svg.py`はdraw.ioのXML(`mxCell`の頂点/辺: ボックスの位置、塗り/線の色、テキスト、辺のsource/waypoints/target)をPython標準ライブラリのみでパースし(draw.ioアプリ・Node・ネットワークアクセス不要)、そのまま`mikoshi-route.svg`として描画する。
- `mikoshi-route.md` — 神輿ルートを`# 往路`と`# 帰路`の2見出しの下に人間可読な形でまとめたリスト。各立ち寄り先には1つ以上のGoogleマップ共有リンク(`maps.app.goo.gl/...`)が付く。各名前付き立ち寄り先の最初のリンクが、`data.js`の`mapPins.points`(往路)/`mapPins.pointsReturn`(帰路)内のそのエントリ(`{ label, lat, lng, mapUrl }`、順序も一致)の正となる情報源 — 名前のない裸のリンク(上に立ち寄り先の名前がないもの)は参照のみでそこには反映されない。`mikoshi-route.dio`と同様、これは所有者がセッションの合間(あるいはセッション中)に直接編集するライブファイルである。
  - `mapPins.routeMapOutbound`/`routeMapReturn`(`mikoshi-route-outbound.jpg`/`mikoshi-route-return.jpg`)はローカル保存された画像で、各区間ごとに1枚、`mikoshi-route.md`のその区間の座標を**すべて**(`points`/`pointsReturn`が除外する名前なし/裸のリンクも含む)、OpenStreetMapのベースマップ上に直線で結び番号付きマーカーを重ねて描画したもの(Googleマップの経路リンクのような道路スナップは行わない)。番号は`points`/`pointsReturn`がレンダリングする`<ol>`内の各名前付き立ち寄り先の位置と対応する。他のルート画像と同様、インライン表示・ズーム可能で、各区間のポイントリストの上に表示され、それぞれ専用の「往路のPDFを開く」/「帰路のPDFを開く」リンク(`mapPins.routeMapOutboundPdf`/`routeMapReturnPdf`)から同名の`.pdf`へリンクする。
    - 再生成は`./gen_route_maps.py`(`route_resolved.json`/`points_out.json`/`points_ret.json`を読み込み、両方のJPGを直接書き出す)。Pillowはシステムのpythonパッケージではないため、使い捨てのvenvが必要(`python3 -m venv ...; .../bin/pip install pillow`) — スクリプトはシステムのpythonではなく、そのvenvのpythonで実行すること。
    - `route_resolved.json`(区間ごとの完全なポリライン、名前付き+裸のポイント)と`points_out.json`/`points_ret.json`(名前付き立ち寄り先のみ、表示順)は、それぞれ`mikoshi-route.md`(全リンクをlat/lngに解決したもの)と`data.js`の`points`/`pointsReturn`をミラーするチェックイン済みキャッシュである — いずれかの元ファイルが変更されたら、`gen_route_maps.py`を実行する前に再生成すること(下記の`mikoshi-route.md`同期ルールに従って新規/変更された`maps.app.goo.gl`リンクを再解決し、`data.js`から`points`/`pointsReturn`を再エクスポートする)。怠ると画像がサイトの他の部分と静かにズレていく。
    - `points_out.json`/`points_ret.json`は、`data.js`の`points`/`pointsReturn`と全く同じエントリを全く同じ順序で持つ必要がある — 不一致があってもエラーにはならず、地図マーカーの番号が下のポイントリストと1つずつズレるだけである(実際に発生: `points_ret.json`に`pointsReturn`にあるはずのエントリが1つ欠けていた)。どちらかのJSONキャッシュを手動編集した後は、再生成前に`data.js`とラベルを突き合わせて差分を確認すること。
    - ベースマップ: 生のOSMタイル(`https://tile.openstreetmap.org/{z}/{x}/{y}.png`)を、その区間のlat/lngバウンディングボックス(+マーカーのオフセット用の小さな余白、詳細は下記)をカバーする範囲で取得し、Pillowで1枚の画像に結合する — APIキー不要。そのバウンディングボックスにぴったりクロップし(固定/余裕のあるエリアではなく)、ルートが画面いっぱいに収まるようにする。
    - マーカー: 立ち寄り先の順に番号付きの円を、描画済みのラインの上に重ねて描く。2つの立ち寄り先が同一または近接した座標を共有する場合(実際に発生 — 2つのラベルが同じ`maps.app.goo.gl`リンクを再利用していたケースなど)、それらの円は重なってしまうため、一方を固定ピクセル分ずらして両方とも判読できるようにする。共有される真の座標へ戻る引き出し線/ドットは描かないこと — 共有座標が正当なもの(1つの実在する地点に2つの名前付きの物がある場合であり、データの誤りではない場合)であれば、その接続線は無関係に見える2つのマーカー間の説明のつかない線としか読めなくなる。
    - ラベル: テキストは立ち寄り先の名前のみ(番号はマーカーの円にのみ表示)。衝突回避の配置によってラベルが自身のマーカーから離れた位置に置かれることがあるため、各マーカーからそのラベルボックスの中心まで、細い灰色の引き出し線を描き、対応関係を明確に保つ — 引き出し線はラベルボックス/マーカーの円より先に描画し、それら不透明な図形が線の両端をきれいに覆うようにすること。
    - ラベルには本物の衝突回避が必要であり、固定オフセットでは不十分 — マーカー周囲の候補位置(複数の方位/半径)を試し、各候補について画像端・他のマーカー(自分のものに限らず)・既に配置済みのラベル・ルートラインに近すぎる場合は却下し、ラインから最も余裕を持って離れている候補を採用すること。
    - 名前が「〜通り」で終わる立ち寄り先(その地点そのものではなく、その地点を過ぎた直後に通る通りの名前を表す)については、候補探索の方向を全方位均等にではなく、その地点を出発する際のルートの実際の進行方向(名前付き立ち寄り先だけでなく完全なポリラインから計算)に偏らせること — マーカーから進行方向にある道にラベルが付いているように見せるべきであり、その優先方向が何かと衝突する場合のみ近傍の角度にフォールバックする。
    - ルートラインの描画解像度/しきい値はズームレベルに依存する(タイルのピクセルは固定の実世界サイズを持たない) — ベースマップ構築に使うOSMズームレベルを変更した場合、下記の近接並行セグメント検出の距離しきい値も比例してスケールし直す必要がある(そうしないと発火しなくなるか、誤ったものに対して発火する)。
    - 近接して並行し、非隣接ながらほぼ重なるセグメント(記録された経路が短いループを描き、自身の近くに戻ってくる場合)には視覚的な分離が必要だが、それはセグメント中点に新しい点を1つ膨らませる方法(不自然な鋭いキンク/スパイクに見える)ではなく、*既存の*一連の頂点をひとまとまりとして横にずらす方法(短い斜めの遷移で入り、きれいな並行区間を作り、短い斜めの遷移で戻る)で行うこと。
    - 近接並行セグメント検出のしきい値は厳しめに保つこと(`build_display_path`内の`sep=22, close_thresh=34, angle_thresh_deg=25`、`ZOOM=18`用に調整済み) — 実際に接触/一致して描画されてしまうセグメントのみを分離する。ルートラインが*ベースマップ*(道路、建物)に近づいたり交差したりするのは問題ない — 問題になるのはルート同士の重なりのみ。より広いしきい値も試したが、単に近接しているだけで真には重なっていないセグメントの頂点まで動かしてしまうため元に戻した。
    - 方向矢印は、実際に描画される点列(並行セグメント分離処理の*後*、前ではない)と全く同じものから計算する必要がある — 異なる/古いバージョンのパスから計算すると、矢印がラインから外れた位置に浮いて、誤った方向を指してしまう過去のバグの原因になった。
    - どちらかのJPGを再生成した後は、そのPDFも再生成すること: `mikoshi-route-outbound.pdf` / `mikoshi-route-return.pdf`は`route-map-print.html`(画像パスを`?src=`クエリパラメータとして受け取り、`@page`をそのネイティブピクセルサイズに合わせる汎用印刷ページ)を使い、`route-print.html`/`gen_route_pdf.sh`と同じheadless Chromeによるprint-to-pdfの手順で生成する — 例: このディレクトリを配信するローカルサーバーに対して`--headless=new --disable-gpu --print-to-pdf=mikoshi-route-outbound.pdf --no-pdf-header-footer "http://localhost:PORT/route-map-print.html?src=mikoshi-route-outbound.jpg"`。
- `route-print.html` / `gen_route_pdf.sh` — headless Chromeを使って`mikoshi-route.svg`から`mikoshi-route.pdf`を生成する。`route-print.html`は`@page`をSVG自体のピクセルサイズ(読み込んだ`<img>`の`naturalWidth`/`naturalHeight`経由)に合わせるため、PDFはA4に切り詰め/拡大縮小されず、その図のネイティブなアスペクト比のまま1ページに収まる。
- `formation_shinji.dio` / `formation_shinji.md` / `apply_formation.py` — 隊列図(御神子神事の並び)。`formation_shinji.dio`は共有のdraw.ioレイアウト(20個の番号付き位置ボックス。`mikoshi-route.dio`と同様、draw.ioアプリで直接編集する)。`formation_shinji.md`は隊形ごと(`N`=1,2,3)に`# formation_N:タイトル`の1セクションを持ち、各行が位置番号と名前を対応付ける(`1:名前, 2:名前, ...`。名前には改行を表す`<BR>`を含められる。例:`コンさん<BR>（社員）`)。`apply_formation.py`は常に`formation_shinji.dio`から(前回の`formation_shinji_N.dio`からではなく、つまり冪等)`formation_shinji_1.dio`/`formation_shinji_2.dio`/`formation_shinji_3.dio`を再生成し、対応する`formation_shinji.md`セクションのマッピングに従って各位置の番号を名前に置き換える。
  - `formation_jinjya_syoden.dio`(昇殿) / `formation_jinjya_koden.dio`(降殿) — 別系統の独立した図で、`formation_shinji.dio`のような番号テンプレート+`.md`マッピングではなく、実名を各ボックスに直接書き込んだ手描きの図。`mikoshi-route.dio`と同じmxCellスキーマのため、`gen_route_svg.py`の`parse()`/`render_svg()`がそのまま扱える — `apply_formation.py`の工程は不要。
  - `gen_formation_svg.py` — `formation_shinji_1/2/3.dio`と`formation_jinjya_syoden.dio`/`formation_jinjya_koden.dio`をパースしてそれぞれのSVGを生成する。`gen_route_svg.py`の`parse()`/`render_svg()`(同じmxCellスキーマ — 頂点/辺/テキストセル)を再利用している。
  - `gen_formation_pdf.sh` — SVGから対応するPDFを、使い捨てのローカル`python3 -m http.server`上で`route-map-print.html?src=...`経由で生成する。`gen_route_pdf.sh`/`route-map-print.html`と同じheadless Chromeによるネイティブサイズ手順。`formation_shinji_1/2/3`のタイトルは`formation_shinji.md`由来だが、`formation_jinjya_syoden`/`formation_jinjya_koden`には対応する`.md`がないため、タイトル("昇殿"/"降殿")はスクリプト内にハードコードされている。
  - 要綱タブ(`data.js`の`guidelines.formations`、`app.js`の`renderGuidelines()`)にて、隊形ごとにズーム可能な画像+PDFリンクとして描画される。`formation_shinji_1/2/3`は各`formation_shinji.md`セクションの`:タイトル`からタイトルが付き、`formation_jinjya_syoden`/`formation_jinjya_koden`は`data.js`内で直接タイトルが指定されている。

## ルール

- **`data.js`の`schedule`を編集した後は、PDFを再生成すること**: このディレクトリで`./gen_schedule_pdf.sh`を実行し、`schedule.pdf`を同期させる。これは過去にズレたことがある(`data.js`を編集してPDFを再生成しなかったケース)ため、省略しないこと — `schedule`の編集を明示的に依頼された場合だけでなく、他の作業の副作用として`schedule`が変わった場合も同様。迷ったら、作業を終える前に`git diff data.js`で`schedule`の変更有無を確認すること。
- **`data.js`の`mapPins.restAreas`を編集した後は、PDFを再生成し、並行コピーも再同期すること**: `./gen_rest_areas_pdf.sh`を実行して`rest-areas.pdf`を同期させ、`rest-areas.md`/`rest_areas.json`も手動で合わせて更新すること(上記の`mapPins.restAreas`の注記の通り、これらは`data.js`から自動生成されない)。
- **`mikoshi-route.dio`を編集した後は、SVGを再生成すること**: このディレクトリで`./gen_route_svg.py`を実行し、`mikoshi-route.svg`を図のソースと同期させる。
- **`mikoshi-route.svg`を再生成した後は、PDFも再生成すること**: このディレクトリで`./gen_route_pdf.sh`を実行し、`mikoshi-route.pdf`を同期させる。
- **`formation_shinji.dio`または`formation_shinji.md`を編集した後は、隊列図一式を再生成すること**: `./apply_formation.py`(`formation_shinji.dio`+`formation_shinji.md`から`formation_shinji_1/2/3.dio`を再構築)→`./gen_formation_svg.py`(SVG)→`./gen_formation_pdf.sh`(PDF)の順に実行する — 下記の`mikoshi-route.dio`のパイプラインと同じパターン。`formation_shinji.dio`と`formation_shinji.md`はどちらも所有者がセッションの合間/セッション中に直接編集しうるライブファイルである(`.dio`はdraw.ioアプリで、`.md`は直接のテキスト編集で。`# formation_N:タイトル`セクションの追加/リネームを含む) — 明示的に依頼されたときや作業の締めくくりだけでなく、変更に気づいた時点(例: ファイルが変更されたというsystem-reminder、または実行した`git diff formation_shinji.dio formation_shinji.md`)ですぐに再同期すること。
- **`formation_jinjya_syoden.dio`または`formation_jinjya_koden.dio`を編集した後は、SVG/PDFを再生成すること**: `./gen_formation_svg.py`に続けて`./gen_formation_pdf.sh`を実行する — これらは`.md`マッピングを持たない独立した手描きの図のため、`apply_formation.py`の工程は不要。他の`.dio`ソースと同じライブファイルの注意点があり、変更されていないと決めつけず`git diff`を確認すること。
- **`mikoshi-route.dio`は、所有者がClaudeセッションの合間に(時には同じセッション内のメッセージの合間にも)draw.ioデスクトップアプリで直接編集するライブファイルであり**、ここでの依頼を通じてのみ変更されるものではない。ルート図の作業を行う前 — 特に「dioの変更を反映して」と依頼されたとき — は、変更されていないと決めつけず、まず`git diff mikoshi-route.dio`を実行すること。変更があれば、誰も明示的に指摘していなくても常にSVGを再生成すること。
- **`mikoshi-route.md`を編集した後は、`data.js`の`mapPins.points`/`pointsReturn`を同期させること**: `# 往路`/`# 帰路`の下にある名前付きの各立ち寄り先について、そのラベルと最初の`mapUrl`は、対応する配列(往路は`points`、帰路は`pointsReturn`)内の`{ label, lat, lng, mapUrl }`エントリと、同じ順序で一致させる(.mdから削除された立ち寄り先は完全に削除し、新規のものは`maps.app.goo.gl`のリダイレクトを辿って解決した`lat`/`lng`を追加する — `curl -sIL <url>`を実行し、最終的な`location:`ヘッダーから`lat,lng`を読み取る)。`mikoshi-route.md`も所有者がセッションの合間/セッション中に直接編集しうるファイルである — `mikoshi-route.dio`と同様、ルート関連の作業を終える前に`git diff mikoshi-route.md`を実行し、誰も明示的に指摘していなくても再同期すること。ルート自体が変更された場合(単なる立ち寄り先のラベル変更ではなく)、その区間の(名前付き・裸を問わず)全リンクから`mikoshi-route-outbound.jpg`/`mikoshi-route-return.jpg`も再生成すること(上記の通り別途の手動ステップである)。

## 補足事項

- テストスイート・リンター・ビルド/パッケージマニフェストなし — 意図的に依存関係のないHTML/CSS/JSとしている。
- `焼津祭_2026.xlsx`と`.claude/`はgitignore対象。
- 現在の`data.js`のスケジュールには、所有者の希望により個人名・自宅名が意図的に含まれている — 公開範囲を変更する必要がある場合は、そのファイルを直接編集すること。
- パスワードゲートなしでローカルプレビューするには、`index.html`と同じ階層に`index_preview.html`(`#gate-overlay`を除き、`gate.js`経由ではなく`data.js`/`app.js`を直接読み込むコピー)を作成する。このディレクトリを`python3 -m http.server`で配信し、そのファイルを開く。使い捨ての開発用ファイルであり、コミットはしない。
