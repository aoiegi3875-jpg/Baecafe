export type MorningEventType = 'good' | 'bad' | 'neutral';

export interface MorningEventDef {
  id: string;
  title: string;
  description: string;
  type: MorningEventType;
  emoji: string;
}

export const MORNING_EVENTS: MorningEventDef[] = [
  {
    id: 'influencer',
    title: '有名インフルエンサー来店！',
    description: 'たまたま立ち寄った超有名インフルエンサーがお店をSNSで大絶賛！今日1日は来客数（売上）が2倍になります！',
    type: 'good',
    emoji: '📸'
  },
  {
    id: 'sponsor',
    title: '謎のパトロン出現',
    description: '「君の店、なかなか面白いじゃないか」謎の富豪からカフェの経営支援金として10,000円を寄付されました！',
    type: 'good',
    emoji: '💰'
  },
  {
    id: 'bad_weather',
    title: '大荒れの天気',
    description: '今日は朝から記録的な大雨と強風。客足が遠のき、今日1日は来客数（売上）が半減してしまいます…。',
    type: 'bad',
    emoji: '🌧️'
  },
  {
    id: 'fridge_broken',
    title: '冷蔵庫トラブル発生！',
    description: '朝出勤すると冷蔵庫の電源が落ちていた！ショーケースに並べていたすべてのメニューの「鮮度」が一気に1日分古くなってしまった！',
    type: 'bad',
    emoji: '❄️'
  },
  {
    id: 'tv_feature',
    title: '地元テレビの密着取材',
    description: '朝のローカル番組で「ヤバいカフェがある」と紹介されました！今日1日は来客数が1.5倍になります！',
    type: 'good',
    emoji: '📺'
  },
  {
    id: 'ingredient_loss',
    title: 'ネズミのイタズラ',
    description: '倉庫を開けると、大事な食材がいくつかネズミにかじられていた！泣く泣く食材を買い直し、5,000円の損失を出しました。',
    type: 'bad',
    emoji: '🐭'
  }
];
