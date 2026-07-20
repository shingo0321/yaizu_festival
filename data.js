// 焼津祭ポータルサイトのコンテンツデータ
// ここを実際の情報に差し替えるだけでページ全体が更新されます。
const FESTIVAL_DATA = {
  title: "焼津祭",
  subtitle: "御神子",
  dateRange: "2026年8月12日(水)・13日(木)",

  // Dropboxで管理する元データの「役割」シートをそのまま反映
  roles: [
    { role: "人馬", people: "ショウ、カツヨシ\nクリス、ユウタ\nヤスナリ、シンゴ\n○○、○○\n○○、○○" },
    { role: "馬", people: "コウスケ、ケイスケ" },
    { role: "交通", people: "シンゴ、コウさん" },
    { role: "うちわ", people: "ユウジロウさん、パパさん" },
    { role: "かさ", people: "タロウ、ケタ" },
    { role: "荷物", people: "ユウシ、テツオ" },
    { role: "子供", people: "カワムラ" }
  ],

  // Dropboxで管理する元データの「8月12日」「8月13日（往路）」「8月13日（復路）」シートをそのまま反映（本人希望により個人名・自宅名も含む）
  schedule: [
    {
      date: "8月12日(水)",
      items: [
        { time: "12:00", title: "丸久テント設営、ギャングスター下準備", place: "" },
        { time: "16:00", title: "裏方集合", place: "中野家" },
        { time: "16:30", title: "手伝い手集合", place: "中野家" },
        { time: "17:00", title: "挨拶、乾杯", place: "" },
        { time: "17:15", title: "中野家を出発、人馬（ショウ、カツヨシ）\n※ゴザ準備\n※裏方さんは神社休憩所準備へ", place: "" },
        { time: "17:45", title: "一区公会堂に到着", place: "一区公会堂" },
        { time: "19:00", title: "四区公会堂に到着、本人降りて挨拶？\n※両親、コウタロウ", place: "四区公会堂" },
        { time: "19:30", title: "神社に到着、昇殿、人馬（ダイジロウ父、兄）\n※両親、コウタロウ、ハセガワ", place: "神社" },
        { time: "21:00", title: "休憩所片付け、出発準備", place: "" },
        { time: "21:15", title: "降殿、一区六番目、人馬（コウタロウ、ハセガワ）", place: "" },
        { time: "21:30", title: "四区公会堂に到着、本人降りて挨拶？\n※両親、コウタロウ", place: "四区公会堂" },
        { time: "22:00", title: "一区公会堂に到着\n※両親、コウタロウ、ハセガワ", place: "一区公会堂" },
        { time: "22:30", title: "中野家に到着", place: "中野家" },
        { time: "22:50", title: "掛魚", place: "" }
      ]
    },
    {
      date: "8月13日(木)・往路",
      items: [
        { time: "04:50", title: "裏方集合、場所準備、赤飯準備", place: "中野家" },
        { time: "05:00", title: "手伝い手集合、本人準備完了", place: "" },
        { time: "05:15", title: "馬方は新港にお迎え\n※コウスケ、ケイスケ、ハセガワ\n※手綱、馬腹掛け、紅白座布団、バスタオル2枚、ハチマキ5枚、祝儀、水2L、スコップ、チリトリ、袋\n※新港を出るとき電話、電話来たら写真、片付け開始", place: "" },
        { time: "06:00", title: "挨拶、乾杯、中野家を出発\n※うちわ、傘、馬横（ショウ、クリス）\n※裏方さんは神社準備へ", place: "" },
        { time: "06:30", title: "一区公会堂に到着、6:45出発、馬横（ショウ、クリス）", place: "一区公会堂" },
        { time: "07:15", title: "四区公会堂挨拶、馬上", place: "四区公会堂" },
        { time: "07:30", title: "北鳥居で下馬、人馬（ショウ、クリス）で本殿へ\n※左側通行、拝殿挨拶（二礼二拍手一礼）\n※松の左側を通り本人は社務所へ、手伝い手は休憩所へ", place: "神社" },
        { time: "08:00", title: "本人、御神酒、ほっかむり、三宝もらう\n※青木さんに8時には居てもらう", place: "" },
        { time: "08:45", title: "本人準備完了、手伝い手はお迎え準備", place: "" },
        { time: "09:00", title: "社務所を出発、人馬（ショウ、クリス）\n※傘、うちわを持って宮司宅へ", place: "社務所" },
        { time: "09:10", title: "到着したら両親／コウタロウで宮司宅に挨拶、次に人馬でコウタロウが本人を降ろす\n※本人／両親／コウタロウの飲み物と食べ物を持ってくる", place: "宮司宅" },
        { time: "10:15", title: "本人準備完了", place: "" },
        { time: "10:30", title: "神社の休憩所片付け、お迎え準備、終わったら宮司宅へ\n※神輿が来るときの人馬（ショウ、クリス）\n※うちわ（　）、傘（　）", place: "" },
        { time: "11:00", title: "神社の馬方お迎えに　※時間確認\n※コウスケ、ケイスケ", place: "" },
        { time: "11:15", title: "裏方さん：保冷車で田子重へ（西川さん達２名）\n※ラーメン（　）そば（　）おにぎり（　）\nみっちーさん：祭礼車で中野家へ、ゴミなど降ろす\nママさん：自転車で近藤宅へ、北のカレー用ご飯炊く（　）升", place: "" },
        { time: "12:00", title: "浅草通り入ったくらいから走る馬横（ダイジロウ、兄）\n※むしろ５枚（内小２枚）\n※近藤宅にむしろ、大丸、手持ち提灯２本用意\n※神輿が近藤宅を通ったらむしろ準備（ハセガワ＋２名）\n※交通整理者は、塩川新聞前の交差点注意！\n※御供捧、流鏑馬が信号で詰まったり別れたりしないように、信号を渡るのは御供捧＆流鏑馬だけにするなど\n※馬方さん、御供捧、流鏑馬、太一さん、四区に走ることを伝える（　誰が　）\n※終わったらむしろ片付け、近藤宅へ、写真撮影", place: "青木さん前" },
        { time: "12:30", title: "田子重前を通過したらハセガワは青木さんに電話（そろそろ着く）", place: "田子重" },
        { time: "13:15", title: "南御旅所手前の交差点で下馬、人馬（ショウ、クリス）で南御旅所へ挨拶（一礼）\n※馬方は接待３名（オード２台）と丸川まで送り\n※本人はそのまま金澤宅へ\n※金澤宅に本人より先に両親、コウタロウ挨拶\n※丸久前から本人、両親、コウタロウの飲み物、食べ物を運ぶ", place: "南御旅所" }
      ]
    },
    {
      date: "8月13日(木)・往路→帰路",
      items: [
        { time: "14:00", title: "本人準備完了、金澤宅の片付け（　）\n片付け、保冷車、祭礼車は中野家へ\n※ゴミ捨て、飲み物、氷補充、手持ち提灯を載せる\n※そのまま北へ休憩所準備", place: "金澤宅" },
        { time: "14:30", title: "出発\n※人馬（ショウ、カツヨシ）、馬横（ショウ、クリス）\n※一区は本人馬上、両親、コウタロウは中まで\n※ママさん達、カレー温め、ご飯を祭礼車が来たら載せる\n※マルハチ村松くらいに青木さんに電話（ハセガワ）", place: "" },
        { time: "15:30", title: "右に曲がるところで馬から人馬（ショウ、クリス）へ、馬方は送り\n※北御旅所で一礼、西川宅へ、両親／コウタロウ先に西川宅へ挨拶", place: "北御旅所" },
        { time: "15:45", title: "北御旅所の休憩所到着、提灯をタロウの家に取りに行く（１０名くらい）", place: "" },
        { time: "17:00", title: "中野家でオード準備１２台（ママさん２名、久美子、みお）", place: "" },
        { time: "17:15", title: "北の馬方お迎え、バスタオル持ってく", place: "" },
        { time: "17:20", title: "片付け、出発準備", place: "" },
        { time: "17:30", title: "休憩所出発、裏方は祭礼車／保冷車で中野家へ\n※補充、オード積み込み秋山宅へ、休憩所準備", place: "" },
        { time: "17:45", title: "ガードレール前で一礼、Uターン\n三区は馬上、両親、コウタロウは中へ", place: "新港" },
        { time: "18:45", title: "馬から人馬（ショウ、クリス）で一礼\n※馬方は送り、本人は深澤宅へ、手伝い手は秋山宅へ\n※後輿が収まったら馬方は迎え、深澤宅まで\n※むしろの準備（　）", place: "焼津御旅所前" },
        { time: "20:30", title: "御神子神事、両親はすえさん家へ\n※終わったら裏方さんは片付け、ギャングスターの下の準備へ", place: "" },
        { time: "21:45", title: "人馬（ショウ、クリス）で神社へ\n※着いたら一礼、本人、両親、コウタロウ、ハセガワは社務所へ", place: "すえさん家" },
        { time: "23:45", title: "本人準備完了、手伝い手は社務所前へ", place: "" }
      ]
    }
  ],

  // mikoshi-route.md（神輿渡御ルートの往路・帰路）に記載の地点（各地点のGoogleマップ共有リンクを含む）。
  mapPins: {
    title: "順路",
    points: [
      { label: "焼津神社", lat: 34.865930, lng: 138.314590, mapUrl: "https://maps.app.goo.gl/5euf4zw6eezQ6fCWA" },
      { label: "四区会所", lat: 34.865455, lng: 138.316780, mapUrl: "https://maps.app.goo.gl/dtXtLFaRFSPd8kAB9" },
      { label: "御沓脱", lat: 34.866112, lng: 138.318123, mapUrl: "https://maps.app.goo.gl/Ee2XHQ6oJMJo2Mbz5" },
      { label: "焼津警察署中央交番", lat: 34.863671, lng: 138.318090, mapUrl: "https://maps.app.goo.gl/YeH87NMC6kUruYUe7" },
      { label: "水校通り", lat: 34.863613, lng: 138.318745, mapUrl: "https://maps.app.goo.gl/bFkyir5ExwASyRSL6" },
      { label: "塩川新聞舗", lat: 34.866835, lng: 138.319678, mapUrl: "https://maps.app.goo.gl/CFrQ6NpWVa2Bpusc8" },
      { label: "浅草通り", lat: 34.866453, lng: 138.321124, mapUrl: "https://maps.app.goo.gl/1yWWfYh7MdYtM6o36" },
      { label: "アトレ焼津", lat: 34.863440, lng: 138.320205, mapUrl: "https://maps.app.goo.gl/Gndx9iHNucTi3Pc4A" },
      { label: "しずおか焼津信金", lat: 34.863440, lng: 138.320205, mapUrl: "https://maps.app.goo.gl/Gndx9iHNucTi3Pc4A" },
      { label: "神武通り", lat: 34.863188, lng: 138.321739, mapUrl: "https://maps.app.goo.gl/WzmupfBLiPNBFhbu9" },
      { label: "二区会所", lat: 34.861364, lng: 138.321310, mapUrl: "https://maps.app.goo.gl/z6Gfa999n3GHz8CL8" },
      { label: "静銀", lat: 34.863112, lng: 138.322150, mapUrl: "https://maps.app.goo.gl/ZvG7MVG5JJrcBrH6A" },
      { label: "中央通り", lat: 34.863031, lng: 138.322652, mapUrl: "https://maps.app.goo.gl/kQTCWtBAxSf1MFTh9" },
      { label: "田子重", lat: 34.857875, lng: 138.321953, mapUrl: "https://maps.app.goo.gl/o895LxNkZJdiqQ3H9" },
      { label: "八雲通り", lat: 34.857709, lng: 138.323701, mapUrl: "https://maps.app.goo.gl/Wh6fS4cGPAN5mNQg7" },
      { label: "南御旅所", lat: 34.855508, lng: 138.323867, mapUrl: "https://maps.app.goo.gl/n8ddXExY18nFU3NY8" },
      { label: "浜通り", lat: 34.857778, lng: 138.323687, mapUrl: "https://maps.app.goo.gl/zCf6JCym2Ff99WNS8" },
      { label: "北御旅所", lat: 34.863576, lng: 138.324642, mapUrl: "https://maps.app.goo.gl/jQtywX7DthJRSvPi8" }
    ],
    pointsReturn: [
      { label: "北御旅所", lat: 34.863576, lng: 138.324642, mapUrl: "https://maps.app.goo.gl/jQtywX7DthJRSvPi8" },
      { label: "魚市場御旅所", lat: 34.864839, lng: 138.326198, mapUrl: "https://maps.app.goo.gl/xc5TQDrHjsgktMVC9" },
      { label: "三区会所", lat: 34.865772, lng: 138.323161, mapUrl: "https://maps.app.goo.gl/AeA29AyfD5pS25SX6" },
      { label: "焼津市役所", lat: 34.866916, lng: 138.322732, mapUrl: "https://maps.app.goo.gl/mwJk7MQUZnMvYL116" },
      { label: "昭和通り", lat: 34.867037, lng: 138.322368, mapUrl: "https://maps.app.goo.gl/srTUFfwJtyjvBpcT8" },
      { label: "焼津御旅所", lat: 34.865169, lng: 138.316678, mapUrl: "https://maps.app.goo.gl/ZLitTzhQcAkJ4fTv6" },
      { label: "焼津神社", lat: 34.865920, lng: 138.314616, mapUrl: "https://maps.app.goo.gl/Kcv3Fc85Fj2mbsUd7" }
    ],
    // 上記3地点を徒歩で結んだ実際の道なりルート（OSRMのルーティングAPIで取得、無料・APIキー不要）
    excelRouteLine: [
      [34.865622, 138.313524], [34.86582, 138.312807], [34.866358, 138.313037], [34.866166, 138.313753],
      [34.865857, 138.314879], [34.865702, 138.315371], [34.865684, 138.315427], [34.865622, 138.3154],
      [34.864547, 138.314931], [34.863979, 138.314683], [34.863866, 138.314634], [34.863871, 138.314467],
      [34.863887, 138.314023], [34.864379, 138.314241], [34.864709, 138.314388], [34.864561, 138.314873],
      [34.864547, 138.314931], [34.863979, 138.314683], [34.863866, 138.314634], [34.86386, 138.314782],
      [34.863838, 138.315418], [34.863809, 138.316243], [34.863707, 138.317468], [34.863619, 138.318764],
      [34.863549, 138.319443], [34.8635, 138.319788], [34.863438, 138.320217], [34.863253, 138.321305],
      [34.86318, 138.321718], [34.863115, 138.322142], [34.863033, 138.322655], [34.862936, 138.32324],
      [34.862899, 138.32345], [34.862802, 138.324081], [34.862447, 138.324021], [34.86196, 138.323948],
      [34.8616, 138.323924], [34.86152, 138.323918], [34.861203, 138.323887], [34.860926, 138.323859],
      [34.860741, 138.323834], [34.860584, 138.323792], [34.860465, 138.323759], [34.860237, 138.32368],
      [34.860154, 138.32366], [34.859991, 138.32362], [34.859477, 138.323549], [34.859135, 138.323546],
      [34.859007, 138.32355], [34.85882, 138.323583], [34.858548, 138.323625], [34.858145, 138.323659],
      [34.857807, 138.323685], [34.857724, 138.323691], [34.857724, 138.323613], [34.857724, 138.323265],
      [34.857732, 138.323053]
    ],
    // 往路・帰路それぞれの実座標を実際の地図（OpenStreetMap）に重ね、番号付きで
    // 焼き込んだ画像（ローカルに保存、地点リストの番号と対応）。
    routeMapOutbound: "mikoshi-route-outbound.jpg",
    routeMapOutboundPdf: "mikoshi-route-outbound.pdf",
    routeMapReturn: "mikoshi-route-return.jpg",
    routeMapReturnPdf: "mikoshi-route-return.pdf",
    // 神輿渡御ルートの簡略図（mikoshi-route.dioから生成したSVG、ローカルに保存）
    routeDiagram: {
      src: "mikoshi-route.svg",
      pdf: "mikoshi-route.pdf",
      alt: "神輿渡御ルート簡略図（往路・帰路）",
      caption: "神輿渡御ルート簡略図（青:往路　緑:帰路）"
    },
    // 休憩所・駐車場など、エリアごとの集合／待機場所（各リンクはGoogleマップ共有リンクを解決した座標）
    restAreas: {
      title: "休憩所",
      groups: [
        {
          area: "集合場所",
          points: [
            { label: "中野家", lat: 34.865797, lng: 138.321319, mapUrl: "https://maps.app.goo.gl/inZJiRoX8iTsF2c67" }
          ]
        },
        {
          area: "焼津神社休憩所",
          points: [
            { label: "ギャングスター", lat: 34.864337, lng: 138.314363, mapUrl: "https://maps.app.goo.gl/QwKxGKrKa4aBZh1Y8" }
          ]
        },
        {
          area: "南御旅所休憩所",
          points: [
            { label: "本人休憩所", lat: 34.8569762, lng: 138.3226702, mapUrl: "https://maps.app.goo.gl/1kmxx98ycEYdm8P96" },
            { label: "丸久駐車場", lat: 34.857538, lng: 138.323784, mapUrl: "https://maps.app.goo.gl/RDvXaHLEkyUp4aH5A", image: "maruku-parking.jpg" },
            { label: "馬方休憩所", lat: 34.854391, lng: 138.323192, mapUrl: "https://maps.app.goo.gl/zqu8X7JYVsVikAXD8", image: "umakata-rest.jpg" }
          ]
        },
        {
          area: "北御旅所休憩所",
          points: [
            { label: "駐車場", lat: 34.864206, lng: 138.324295, mapUrl: "https://maps.app.goo.gl/dj4fn5q31Dw89k8y7", image: "kita-parking.jpg" }
          ]
        },
        {
          area: "焼津御旅所休憩所",
          points: [
            { label: "秋山宅", lat: 34.865784, lng: 138.316792, mapUrl: "https://maps.app.goo.gl/9o91rHGGBsQnavCv7", image: "akiyama-house.jpg" }
          ]
        }
      ]
    },
    // 焼津神社公式サイトに掲載の神輿渡御順路図（地図の下に参考画像として表示）
    officialRouteImage: {
      src: "https://yaizujinja.or.jp/wp-content/uploads/2025/08/571efb92fa406a257b34aa688ce0e0c5.jpg",
      alt: "焼津神社大祭「荒祭」神輿渡御順路略図（令和7年）",
      sourceUrl: "https://yaizujinja.or.jp/news/20250801/1495/",
      caption: "出典: 焼津神社公式サイト（令和7年 神輿渡御順路略図）"
    }
  }
};
