'use client';

import { useGameStore } from '@/store/gameStore';
import { BASES, INGREDIENTS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function Shop() {
  const { funds, unlockedBases, unlockedIngredients, unlockBase, unlockIngredient, dailyTrend } = useGameStore();

  const handleUnlockBase = (id: string, cost: number) => {
    if (funds < cost) {
      toast.error('資金が足りません');
      return;
    }
    unlockBase(id, cost);
    toast.success(`${BASES[id].name}を解放しました！`);
  };

  const handleUnlockIngredient = (id: string, cost: number) => {
    if (funds < cost) {
      toast.error('資金が足りません');
      return;
    }
    unlockIngredient(id, cost);
    toast.success(`${INGREDIENTS[id].name}を解放しました！`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-yellow-900">問屋街 (ショップ)</h2>
          <p className="text-yellow-700">資金を使って新しいベースや具材を仕入れましょう。メニューの幅が広がります。</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-yellow-100 flex items-center gap-3">
          <span className="text-yellow-500 font-bold">所持金</span>
          <span className="text-2xl font-black text-zinc-900">¥{funds.toLocaleString()}</span>
        </div>
      </div>

      <section>
        <h3 className="text-xl font-bold mb-4">ベース料理の仕入れ</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Object.entries(BASES).map(([id, info]) => {
            const isUnlocked = unlockedBases.includes(id);
            if (info.unlockCost === 0) return null; // Default unlocked
            const isTrending = dailyTrend?.type === 'base' && dailyTrend?.id === id;
            const canAfford = funds >= info.unlockCost;
            const isRecommended = isTrending && !isUnlocked && canAfford;

            return (
              <Card key={id} className={`relative overflow-hidden transition-all ${isUnlocked ? 'opacity-50 grayscale bg-zinc-50' : 'bg-white hover:border-primary hover:shadow-md'} ${isRecommended ? 'border-2 border-blue-500 shadow-blue-200 shadow-lg' : ''}`}>
                {isRecommended && (
                  <div className="absolute top-0 left-0 w-full bg-blue-600 text-white text-xs font-bold text-center py-1 animate-pulse z-10">
                    ✨ トレンドのおすすめ！
                  </div>
                )}
                {isTrending && !isRecommended && (
                  <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 z-10">
                    トレンド
                  </div>
                )}
                <CardHeader className={`p-4 pb-2 text-center ${isRecommended ? 'pt-8' : ''}`}>
                  {info.imageUrl ? (
                    <div className="h-16 w-16 mx-auto mb-2"><img src={info.imageUrl} className="w-full h-full object-cover rounded" /></div>
                  ) : (
                    <div className="text-5xl mb-2">{info.emoji}</div>
                  )}
                  <CardTitle className="text-lg">{info.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-center">
                  <p className="font-bold text-yellow-600">¥{info.unlockCost.toLocaleString()}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    className="w-full font-bold" 
                    variant={isUnlocked ? "secondary" : "default"}
                    disabled={isUnlocked || funds < info.unlockCost}
                    onClick={() => handleUnlockBase(id, info.unlockCost)}
                  >
                    {isUnlocked ? '解放済み' : '解放する'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4">特殊具材の仕入れ</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Object.entries(INGREDIENTS).map(([id, info]) => {
            if (info.requiredBase && !unlockedBases.includes(info.requiredBase)) return null;
            const isUnlocked = unlockedIngredients.includes(id);
            if (info.unlockCost === 0) return null;
            const isTrending = dailyTrend?.type === 'ingredient' && dailyTrend?.id === id;
            const canAfford = funds >= info.unlockCost;
            const isRecommended = isTrending && !isUnlocked && canAfford;

            return (
              <Card key={id} className={`relative overflow-hidden transition-all ${isUnlocked ? 'opacity-50 grayscale bg-zinc-50' : 'bg-white hover:border-primary hover:shadow-md'} ${isRecommended ? 'border-2 border-blue-500 shadow-blue-200 shadow-lg' : ''}`}>
                {isRecommended && (
                  <div className="absolute top-0 left-0 w-full bg-blue-600 text-white text-xs font-bold text-center py-1 animate-pulse z-10">
                    ✨ トレンドのおすすめ！
                  </div>
                )}
                {isTrending && !isRecommended && (
                  <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 z-10">
                    トレンド
                  </div>
                )}
                <CardHeader className={`p-4 pb-2 text-center ${isRecommended ? 'pt-8' : ''}`}>
                  {info.imageUrl ? (
                    <div className="h-16 w-16 mx-auto mb-2"><img src={info.imageUrl} className="w-full h-full object-cover rounded" /></div>
                  ) : (
                    <div className="text-5xl mb-2">{info.emoji}</div>
                  )}
                  <CardTitle className="text-lg">{info.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-center">
                  <p className="font-bold text-yellow-600">¥{info.unlockCost.toLocaleString()}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    className="w-full font-bold" 
                    variant={isUnlocked ? "secondary" : "default"}
                    disabled={isUnlocked || funds < info.unlockCost}
                    onClick={() => handleUnlockIngredient(id, info.unlockCost)}
                  >
                    {isUnlocked ? '解放済み' : '解放する'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
