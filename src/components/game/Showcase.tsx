'use client';

import { useState } from 'react';
import { useGameStore, Menu } from '@/store/gameStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { BASES, INGREDIENTS } from '@/lib/constants';
import { getMenuFreshness, getFreshnessLabel } from '@/lib/utils';

export function Showcase() {
  const { 
    activeMenus, 
    gallery, 
    followers, 
    addToShowcase, 
    updateMenuPrice,
    removeFromShowcase, 
    advanceDay, 
    addFunds, 
    addFollowers, 
    increaseFlameGauge,
    funds,
    flameGauge,
    day,
    dailyTrend,
    weatherMultiplier
  } = useGameStore();

  const trendName = dailyTrend ? (dailyTrend.type === 'base' ? BASES[dailyTrend.id]?.name : INGREDIENTS[dailyTrend.id]?.name) : 'なし';

  const [activeEvent, setActiveEvent] = useState<{title: string, desc: string} | null>(null);
  const [priceMenuToSet, setPriceMenuToSet] = useState<Menu | null>(null);
  const [customPrice, setCustomPrice] = useState<number>(0);
  
  const [dailyReport, setDailyReport] = useState<{revenue: number, followers: number, fixedCost: number, comments: {text: string, isPositive: boolean}[]} | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const availableMenus = gallery.filter(m => !activeMenus.some(am => am.menu.id === m.id));

  const handleOperate = () => {
    if (activeMenus.length === 0) {
      toast.error('ショーケースにメニューがありません！');
      return;
    }

    let totalRevenue = 0;
    let totalFollowersGained = 0;
    let maxRisk = 0;
    let maxRiskMenu: Menu | null = null;
    const generatedComments: {text: string, isPositive: boolean}[] = [];

    const baseTraffic = Math.max(3, Math.floor(followers * 0.005) + 2);

    activeMenus.forEach(am => {
      const isTrending = dailyTrend && (am.menu.baseId === dailyTrend.id || am.menu.ingredientIds?.includes(dailyTrend.id));
      const trendMultiplier = isTrending ? 2.5 : 1.0;
      
      const currentPrice = am.customPrice ?? am.menu.price;
      const priceRatio = currentPrice / Math.max(1, am.menu.price);
      const priceMultiplier = Math.max(0.1, 2.0 - priceRatio);
      
      const { freshness } = getMenuFreshness(am.menu, day, am.daysActive);
      const appeal = am.menu.visualScore + am.menu.tasteScore;
      
      const rand = 0.8 + Math.random() * 0.4;
      const unitsSold = Math.floor(baseTraffic * (appeal / 100) * freshness * rand * trendMultiplier * weatherMultiplier * priceMultiplier);
      
      totalRevenue += unitsSold * currentPrice;
      
      const followerMultiplier = Math.max(0.5, 1.5 - (priceRatio - 0.5));
      let fGained = Math.floor(unitsSold * (am.menu.tasteScore / 100) * 4 * (isTrending ? 2.0 : 1.0) * followerMultiplier);
      fGained = Math.round(fGained / 10) * 10;
      if (fGained === 0 && unitsSold > 0) fGained = 10;
      
      totalFollowersGained += fGained;

      let currentRisk = am.menu.flameRisk;
      if (priceRatio >= 1.5) {
        currentRisk += 30; // ぼったくりペナルティ
      } else if (priceRatio > 1.2) {
        currentRisk += 10;
      }

      if (currentRisk > maxRisk) {
        maxRisk = currentRisk;
        maxRiskMenu = am.menu;
      }

      if (unitsSold > 0 && Math.random() > 0.4) {
        if (priceRatio < 0.8) {
          generatedComments.push({ text: `「${am.menu.name}」安すぎて神！毎日通うわ`, isPositive: true });
        } else if (priceRatio > 1.3) {
          generatedComments.push({ text: `「${am.menu.name}」高すぎワロタ。映え代だとしてもぼったくりでしょ…`, isPositive: false });
        } else if (am.menu.visualScore > 80) {
          generatedComments.push({ text: `「${am.menu.name}」写真撮りまくった！超絶可愛い！`, isPositive: true });
        } else if (am.menu.flameRisk > 60) {
          generatedComments.push({ text: `「${am.menu.name}」これ絶対お腹壊すやつだろ…食べ物で遊ぶな💢`, isPositive: false });
        } else if (am.menu.tasteScore > 70) {
          generatedComments.push({ text: `「${am.menu.name}」見た目だけかと思ったら普通にめっちゃ美味しい！`, isPositive: true });
        } else if (am.menu.tasteScore < 30) {
          generatedComments.push({ text: `「${am.menu.name}」味は…ノーコメントで。写真だけ撮って残しちゃった`, isPositive: false });
        } else {
          generatedComments.push({ text: `「${am.menu.name}」食べてきた！いい感じ👍`, isPositive: true });
        }
      }
    });

    // Event Check
    let triggeredEvent: {title: string, desc: string} | null = null;
    
    if (maxRisk > 40) {
      const chance = (maxRisk - 30) / 100;
      if (Math.random() < chance) {
        triggeredEvent = {
          title: '🔥 メニュー大炎上！',
          desc: `「${maxRiskMenu?.name || '不明なメニュー'}」がSNSで物議を醸しています！至急、対応方針を決定してください。`
        };
      }
    }

    // 悪質客・バイトテロのランダム発生 (炎上イベントが起きていない場合で、約8%の確率で発生)
    if (!triggeredEvent && Math.random() < 0.08) {
      if (Math.random() > 0.5) {
        triggeredEvent = {
          title: '🚨 迷惑客トラブル！',
          desc: 'お客さんが店内の備品（醤油差しなど）を舐め回す動画をSNSにアップロードしました！動画は瞬く間に拡散されています。どう対応しますか？'
        };
      } else {
        triggeredEvent = {
          title: '📱 バイトテロ発覚！',
          desc: '店のアルバイトスタッフが厨房の冷蔵庫に入る動画（通称バイトテロ）が流出しました！批判が殺到しています！'
        };
      }
    }

    // 1日あたりの家賃・光熱費（7日経過するごとに2000円ずつ増額して難易度を上げる）
    const baseFixedCost = 8000;
    const additionalCost = Math.floor((day - 1) / 7) * 2000;
    const fixedCost = baseFixedCost + additionalCost;

    addFunds(totalRevenue - fixedCost);
    addFollowers(totalFollowersGained);
    increaseFlameGauge(Math.floor(maxRisk * 0.1));
    
    const shuffledComments = generatedComments.sort(() => 0.5 - Math.random()).slice(0, 3);
    setDailyReport({ revenue: totalRevenue, followers: totalFollowersGained, fixedCost, comments: shuffledComments });

    if (triggeredEvent) {
      setActiveEvent(triggeredEvent);
    } else {
      setIsReportOpen(true);
      advanceDay();
    }
  };

  const handleEventChoice = (choice: 'apologize' | 'bribe' | 'provoke') => {
    setActiveEvent(null);
    
    if (choice === 'apologize') {
      const lost = Math.floor(followers * 0.1);
      addFollowers(-lost);
      toast.info(`謝罪文を掲載しました。フォロワーが${lost}人減りました。`);
    } else if (choice === 'bribe') {
      addFunds(-100000);
      increaseFlameGauge(-20);
      toast.warning('10万円でインフルエンサーにもみ消しを依頼しました。炎上が少し鎮まりました。');
    } else if (choice === 'provoke') {
      if (Math.random() > 0.5) {
        const gained = Math.floor(followers * 0.5) + 100;
        addFollowers(gained);
        increaseFlameGauge(10);
        toast.success(`逆ギレが大ウケ！逆に話題になりフォロワーが${gained}人増えました！`);
      } else {
        const lost = Math.floor(followers * 0.3);
        addFollowers(-lost);
        increaseFlameGauge(40);
        toast.error(`大炎上！批判が殺到し、フォロワーが${lost}人減少、炎上ゲージが急増しました！`);
      }
    }
    
    setIsReportOpen(true);
    advanceDay();
  };

  const closeReport = () => {
    setIsReportOpen(false);
    setDailyReport(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-4">
          <div>
            <h2 className="text-2xl font-bold">ショーケース ({activeMenus.length}/3)</h2>
            <p className="text-zinc-500">店頭に並べるメニューを選びましょう。古いメニューは売上が落ちます。</p>
            {dailyTrend && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200">
                <span>📈 今日のトレンド:</span>
                <span className="text-lg">{trendName}</span>
              </div>
            )}
          </div>
          <Button size="lg" className="bg-green-600 hover:bg-green-700 font-bold w-full sm:w-auto shadow-lg transition-transform hover:scale-105" onClick={handleOperate}>
            1日営業する
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 min-h-[250px] p-6 bg-zinc-100 rounded-xl border-2 border-zinc-200 border-dashed">
          {activeMenus.map(am => {
            const { freshness } = getMenuFreshness(am.menu, day, am.daysActive);
            const label = getFreshnessLabel(freshness);
            const currentPrice = am.customPrice ?? am.menu.price;
            return (
            <Card key={am.menu.id} className="relative shadow-md overflow-hidden bg-white">
              <Button 
                variant="destructive" 
                size="sm" 
                className="absolute top-2 right-2 z-10 rounded-full w-8 h-8 p-0 opacity-80 hover:opacity-100 shadow-md"
                onClick={() => removeFromShowcase(am.menu.id)}
              >×</Button>
              {am.menu.imageUrl ? (
                <div className="h-40 w-full bg-zinc-100">
                  <img src={am.menu.imageUrl} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-40 w-full bg-zinc-200 flex items-center justify-center text-3xl">🍽️</div>
              )}
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg line-clamp-1">{am.menu.name}</CardTitle>
                  {dailyTrend && (am.menu.baseId === dailyTrend.id || am.menu.ingredientIds?.includes(dailyTrend.id)) && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse whitespace-nowrap shrink-0">トレンド！</span>
                  )}
                </div>
                <CardDescription className="font-medium mt-1">
                  鮮度: <span className={label.className}>{label.text}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-baseline gap-2 truncate">
                    <p className="font-black text-xl text-primary">¥{currentPrice.toLocaleString()}</p>
                    {currentPrice !== am.menu.price && (
                      <span className="text-xs text-zinc-500 line-through decoration-red-500/50">相場: ¥{am.menu.price.toLocaleString()}</span>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs px-2 py-0 border-zinc-300 text-zinc-600 font-bold shrink-0"
                    onClick={() => {
                      setPriceMenuToSet(am.menu);
                      setCustomPrice(currentPrice);
                    }}
                  >
                    価格調整
                  </Button>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs">
                   <span className="text-pink-600 font-bold">映: {am.menu.visualScore}</span>
                   <span className="text-red-600 font-bold">炎: {am.menu.flameRisk}</span>
                </div>
              </CardContent>
            </Card>
            );
          })}
          {activeMenus.length === 0 && (
            <div className="col-span-1 sm:col-span-2 md:col-span-3 flex flex-col items-center justify-center text-zinc-400 font-medium space-y-2">
               <span className="text-4xl mb-2">🍰</span>
              <p>メニューをショーケースに並べてください</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">開発済みメニュー (ギャラリー)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {availableMenus.map(menu => {
            const { freshness } = getMenuFreshness(menu, day, 0);
            const label = getFreshnessLabel(freshness);
            return (
            <Card key={menu.id} className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              {menu.imageUrl ? (
                <div className="h-28 w-full bg-zinc-100">
                  <img src={menu.imageUrl} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-28 w-full bg-zinc-200 flex items-center justify-center text-2xl">🍽️</div>
              )}
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-sm line-clamp-2 leading-tight">{menu.name}</CardTitle>
                <div className="text-xs font-medium mt-1">
                  鮮度: <span className={label.className}>{label.text}</span>
                </div>
              </CardHeader>
              <CardContent className="p-3 pb-2 text-xs font-bold text-primary">
                ¥{menu.price.toLocaleString()}
              </CardContent>
              <CardFooter className="p-3 pt-0">
                <Button 
                  size="sm" 
                  className="w-full font-bold" 
                  variant="outline"
                  onClick={() => addToShowcase(menu)}
                  disabled={activeMenus.length >= 3}
                >
                  並べる
                </Button>
              </CardFooter>
            </Card>
            );
          })}
          {availableMenus.length === 0 && gallery.length === 0 && (
            <div className="col-span-full p-8 text-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl bg-white">
              まだメニューがありません。開発しましょう！
            </div>
          )}
          {availableMenus.length === 0 && gallery.length > 0 && (
            <div className="col-span-full p-8 text-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl bg-white">
              すべてのメニューがショーケースに並んでいます。
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!priceMenuToSet} onOpenChange={(open) => !open && setPriceMenuToSet(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>販売価格の設定</DialogTitle>
            <DialogDescription>
              「{priceMenuToSet?.name}」の販売価格を調整します。<br/>
              相場（AI推奨）: ¥{priceMenuToSet?.price.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
             <div className="text-center">
               <span className="text-4xl font-black text-primary">¥{customPrice.toLocaleString()}</span>
             </div>
             <input 
               type="range" 
               min={Math.floor((priceMenuToSet?.price || 0) * 0.5)} 
               max={Math.floor((priceMenuToSet?.price || 0) * 2.0)} 
               step={10}
               value={customPrice} 
               onChange={(e) => setCustomPrice(Number(e.target.value))}
               className="w-full accent-primary"
             />
             <div className="flex justify-between text-sm text-zinc-500 font-medium">
               <span>安い (売れやすい)</span>
               <span>高い (利益大/炎上注意)</span>
             </div>
             
             {priceMenuToSet && customPrice >= priceMenuToSet.price * 1.5 && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm font-bold animate-pulse">
                  ⚠️ ぼったくり注意: 炎上リスクが高まります！
                </div>
             )}
             {priceMenuToSet && customPrice <= priceMenuToSet.price * 0.7 && (
                <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm font-bold">
                  ✨ お買い得: 飛ぶように売れてフォロワー増！
                </div>
             )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPriceMenuToSet(null)}>キャンセル</Button>
            <Button onClick={() => {
              if (priceMenuToSet) {
                updateMenuPrice(priceMenuToSet.id, customPrice);
                setPriceMenuToSet(null);
                toast.success(`${priceMenuToSet.name}の価格を¥${customPrice.toLocaleString()}に変更しました`);
              }
            }}>変更する</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!activeEvent} onOpenChange={(open) => !open && setActiveEvent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2 text-2xl">
              <span className="text-3xl animate-bounce">🔥</span> {activeEvent?.title}
            </DialogTitle>
            <DialogDescription className="text-base font-medium text-zinc-800 pt-2">
              {activeEvent?.desc}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button variant="outline" onClick={() => handleEventChoice('apologize')} className="h-auto py-3 justify-start font-bold">
              🙇 誠心誠意謝罪する <br className="sm:hidden"/><span className="text-xs text-zinc-500 font-normal sm:ml-2">(フォロワー10%減少)</span>
            </Button>
            <Button variant="outline" onClick={() => handleEventChoice('bribe')} className="h-auto py-3 justify-start font-bold" disabled={funds < 100000}>
              💰 裏金でもみ消す <br className="sm:hidden"/><span className="text-xs text-zinc-500 font-normal sm:ml-2">(資金10万円消費 / 炎上ゲージ低下)</span>
            </Button>
            <Button variant="destructive" onClick={() => handleEventChoice('provoke')} className="h-auto py-3 justify-start font-bold">
              🤬 逆ギレして煽る <br className="sm:hidden"/><span className="text-xs text-white/80 font-normal sm:ml-2">(大成功 or 大炎上のギャンブル)</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-black">営業報告</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 relative">
              <p className="text-sm text-yellow-800 font-bold mb-1">本日の売上</p>
              <p className="text-4xl font-black text-yellow-600">+¥{dailyReport?.revenue.toLocaleString()}</p>
              
              <div className="absolute -bottom-3 right-4 bg-red-100 px-3 py-1 rounded-full border border-red-200">
                <p className="text-xs text-red-700 font-bold">固定費 (家賃等): -¥{dailyReport?.fixedCost.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <p className="text-sm text-green-800 font-bold mb-1">新規フォロワー</p>
              <p className="text-3xl font-black text-green-600">+{dailyReport?.followers.toLocaleString()}人</p>
            </div>
            
            {dailyReport?.comments && dailyReport.comments.length > 0 && (
              <div className="text-left mt-4 space-y-2">
                <p className="text-sm font-bold text-zinc-500 mb-2">SNSの反応</p>
                {dailyReport.comments.map((c, i) => (
                  <div key={i} className="bg-white p-3 rounded-lg border border-zinc-200 shadow-sm text-sm">
                    <span className="mr-2">{c.isPositive ? '😍' : '🤬'}</span>
                    <span className="text-zinc-700">{c.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="sm:justify-center">
            <Button size="lg" onClick={closeReport} className="w-full font-bold text-lg">次の日へ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
