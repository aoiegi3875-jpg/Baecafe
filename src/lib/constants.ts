export interface ItemInfo {
  name: string;
  emoji: string;
  unlockCost: number;
  devCost: number;
  imageUrl?: string; // 今後画像を入れるためのプロパティ
  requiredBase?: string; // このトッピングをショップに並べるために必要なベース料理ID
}

export const BASES: Record<string, ItemInfo> = {
  pancake: { name: 'パンケーキ', emoji: '🥞', unlockCost: 0, devCost: 1000 },
  toast: { name: 'トースト', emoji: '🍞', unlockCost: 5000, devCost: 1000 },
  parfait: { name: 'パフェ', emoji: '🍨', unlockCost: 10000, devCost: 2000 },
  pizza: { name: 'ピザ', emoji: '🍕', unlockCost: 15000, devCost: 2500 },
  omurice: { name: 'オムライス', emoji: '🍳', unlockCost: 20000, devCost: 2500 },
  ramen: { name: 'ラーメン', emoji: '🍜', unlockCost: 30000, devCost: 3000 },
  curry: { name: 'カレー', emoji: '🍛', unlockCost: 40000, devCost: 3500 },
  burger: { name: 'ハンバーガー', emoji: '🍔', unlockCost: 50000, devCost: 4000 },
  crepe: { name: 'クレープ', emoji: '🌯', unlockCost: 80000, devCost: 5000 },
  sushi: { name: '寿司', emoji: '🍣', unlockCost: 100000, devCost: 6000 },
  kakigori: { name: 'かき氷', emoji: '🍧', unlockCost: 120000, devCost: 6000 },
  tapioca: { name: 'タピオカ', emoji: '🧋', unlockCost: 150000, devCost: 5000 },
  steak: { name: 'ステーキ', emoji: '🥩', unlockCost: 200000, devCost: 10000 },
};

export const INGREDIENTS: Record<string, ItemInfo> = {
  // --- 一般的な具材（デザート系） ---
  strawberry: { name: 'イチゴ', emoji: '🍓', unlockCost: 0, devCost: 500 },
  cream: { name: '生クリーム', emoji: '🥛', unlockCost: 0, devCost: 300 },
  chocolate: { name: 'チョコレート', emoji: '🍫', unlockCost: 0, devCost: 400 },
  banana: { name: 'バナナ', emoji: '🍌', unlockCost: 1000, devCost: 300 },
  cherry: { name: 'さくらんぼ', emoji: '🍒', unlockCost: 1500, devCost: 400 },
  caramel: { name: 'キャラメルソース', emoji: '🍯', unlockCost: 2000, devCost: 300 },
  matcha: { name: '抹茶パウダー', emoji: '🍵', unlockCost: 3000, devCost: 500 },
  
  // --- 一般的な具材（バーガー・軽食系） ---
  lettuce: { name: 'レタス', emoji: '🥬', unlockCost: 1000, devCost: 100, requiredBase: 'burger' },
  tomato: { name: 'トマト', emoji: '🍅', unlockCost: 1500, devCost: 200, requiredBase: 'burger' },
  onion: { name: 'オニオン', emoji: '🧅', unlockCost: 1500, devCost: 100, requiredBase: 'burger' },
  pickles: { name: 'ピクルス', emoji: '🥒', unlockCost: 2000, devCost: 100, requiredBase: 'burger' },
  egg: { name: '目玉焼き', emoji: '🍳', unlockCost: 4000, devCost: 400, requiredBase: 'burger' },
  bacon: { name: 'ベーコン', emoji: '🥓', unlockCost: 6000, devCost: 600, requiredBase: 'burger' },
  cheese: { name: 'とろけるチーズ', emoji: '🧀', unlockCost: 8000, devCost: 500, requiredBase: 'burger' },
  extra_patty: { name: '追加パティ', emoji: '🥩', unlockCost: 10000, devCost: 1000, requiredBase: 'burger' },

  // --- 一般的な具材（ラーメン系） ---
  green_onion: { name: 'ネギ', emoji: '🧅', unlockCost: 1000, devCost: 100, requiredBase: 'ramen' },
  bean_sprouts: { name: 'もやし', emoji: '🥗', unlockCost: 1000, devCost: 100, requiredBase: 'ramen' },
  menma: { name: 'メンマ', emoji: '🎋', unlockCost: 2000, devCost: 200, requiredBase: 'ramen' },
  naruto: { name: 'なると', emoji: '🍥', unlockCost: 2000, devCost: 200, requiredBase: 'ramen' },
  nori: { name: '海苔', emoji: '⬛', unlockCost: 3000, devCost: 100, requiredBase: 'ramen' },
  ajitama: { name: '味玉', emoji: '🥚', unlockCost: 4000, devCost: 300, requiredBase: 'ramen' },
  chashu: { name: 'チャーシュー', emoji: '🍖', unlockCost: 8000, devCost: 800, requiredBase: 'ramen' },
  // --- 一般的な具材（ピザ・軽食系） ---
  pepperoni: { name: 'ペパロニ', emoji: '🍖', unlockCost: 2000, devCost: 200, requiredBase: 'pizza' },
  jalapeno: { name: 'ハラペーニョ', emoji: '🌶️', unlockCost: 2500, devCost: 200, requiredBase: 'pizza' },
  avocado: { name: 'アボカド', emoji: '🥑', unlockCost: 3000, devCost: 300 },
  mentaiko: { name: '明太子', emoji: '🌶️', unlockCost: 4000, devCost: 400 },

  // --- 一般的な具材（カレー系） ---
  tonkatsu: { name: 'とんかつ', emoji: '🥩', unlockCost: 6000, devCost: 600, requiredBase: 'curry' },
  fukujinzuke: { name: '福神漬け', emoji: '🍛', unlockCost: 1000, devCost: 100, requiredBase: 'curry' },
  natto: { name: '納豆', emoji: '🫘', unlockCost: 2000, devCost: 200, requiredBase: 'curry' },

  // --- 一般的な具材（寿司系） ---
  maguro: { name: 'マグロ', emoji: '🐟', unlockCost: 8000, devCost: 800, requiredBase: 'sushi' },
  salmon: { name: 'サーモン', emoji: '🍣', unlockCost: 8000, devCost: 800, requiredBase: 'sushi' },
  ikura: { name: 'いくら', emoji: '🔴', unlockCost: 15000, devCost: 1500, requiredBase: 'sushi' },
  wasabi: { name: 'わさび', emoji: '🌿', unlockCost: 2000, devCost: 100, requiredBase: 'sushi' },
  
  // --- 奇抜な具材（炎上リスク・バズ狙い） ---
  tabasco: { name: 'タバスコ', emoji: '🌶️', unlockCost: 12000, devCost: 800 },
  protein: { name: 'プロテイン粉末', emoji: '💪', unlockCost: 15000, devCost: 1000 },
  blue_syrup: { name: '青いシロップ', emoji: '💧', unlockCost: 18000, devCost: 1000 },
  insect: { name: '食用コオロギ', emoji: '🦗', unlockCost: 25000, devCost: 1500 },
  dry_ice: { name: 'ドライアイス', emoji: '💨', unlockCost: 30000, devCost: 2000 },
  giant_garlic: { name: '超巨大ニンニク', emoji: '🧄', unlockCost: 40000, devCost: 2500 },
  edible_glitter: { name: '食用ラメ', emoji: '✨', unlockCost: 50000, devCost: 3000 },
  gold_leaf: { name: '金箔', emoji: '✨', unlockCost: 80000, devCost: 10000 },
  durian: { name: 'ドリアン', emoji: '🍈', unlockCost: 100000, devCost: 5000 },
  fire: { name: '燃え盛る炎', emoji: '🔥', unlockCost: 150000, devCost: 8000 },
  neon_jelly: { name: 'ネオンゼリー', emoji: '🧪', unlockCost: 200000, devCost: 12000 },
};
