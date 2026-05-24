'use client';

import { useState } from 'react';
import { useGameStore, Menu } from '@/store/gameStore';
import { BASES, INGREDIENTS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lightbulb, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

export function MenuDevelopment() {
  const { 
    unlockedBases, unlockedIngredients, addMenuToGallery, funds, addFunds, day,
    isGeneratingMenu, setIsGeneratingMenu, latestGeneratedMenu, setLatestGeneratedMenu,
    dailyTrend
  } = useGameStore();
  
  const trendName = dailyTrend ? (dailyTrend.type === 'base' ? BASES[dailyTrend.id]?.name : INGREDIENTS[dailyTrend.id]?.name) : 'なし';
  
  const [selectedBase, setSelectedBase] = useState<string>(unlockedBases[0] || '');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [concept, setConcept] = useState<string>('');

  const toggleIngredient = (id: string) => {
    if (selectedIngredients.includes(id)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== id));
    } else {
      setSelectedIngredients([...selectedIngredients, id]);
    }
  };

  const totalDevCost = (BASES[selectedBase]?.devCost || 0) + selectedIngredients.reduce((sum, id) => sum + (INGREDIENTS[id]?.devCost || 0), 0);

  const handleDevelop = async () => {
    if (!selectedBase) return;
    if (funds < totalDevCost) {
      toast.error('開発資金が足りません');
      return;
    }
    
    setIsGeneratingMenu(true);
    setLatestGeneratedMenu(null);

    // 資金を先に引く
    addFunds(-totalDevCost);

    try {
      const baseName = BASES[selectedBase]?.name || selectedBase;
      const ingredientNames = selectedIngredients.map(id => INGREDIENTS[id]?.name || id);

      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base: baseName, ingredients: ingredientNames, concept })
      });

      if (!response.ok) throw new Error('評価APIの呼び出しに失敗しました');
      
      const data = await response.json();

      // 画像生成
      const imageResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: data.image_prompt })
      });

      let imageUrl = undefined;
      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        imageUrl = imageData.imageUrl;
      }

      const newMenu: Menu = {
        id: crypto.randomUUID(),
        name: data.menu_name,
        baseId: selectedBase,
        ingredientIds: selectedIngredients,
        concept,
        tasteScore: data.score_taste,
        visualScore: data.score_bae,
        flameRisk: data.score_risk,
        trendMatchBonus: 1.0,
        price: data.price,
        reviewComment: data.taste_review,
        imagePrompt: data.image_prompt,
        imageUrl: imageUrl,
        createdAtDay: day
      };

      setLatestGeneratedMenu(newMenu);
      addMenuToGallery(newMenu);
      toast.success('新メニューが開発されました！');
      
    } catch (error: any) {
      // 失敗した場合は資金を返却
      addFunds(totalDevCost);
      console.error(error);
      toast.error(error.message || 'エラーが発生しました');
    } finally {
      setIsGeneratingMenu(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-primary" />
            新メニュー開発
          </h2>
          <p className="text-zinc-500">ベース料理と具材を選んで、AIシェフに新しいメニューを考案してもらいましょう。</p>
          {dailyTrend && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200">
              <span>📈 今日のトレンド:</span>
              <span className="text-lg">{trendName}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 shadow-sm">
        <Lightbulb className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-blue-800 mb-1">経営コンサルタントからのアドバイス</p>
          <p className="text-sm text-blue-700 leading-relaxed">
            「普通の美味しくてお洒落なメニュー」は安全ですが、"映え度" が低いため売上が伸び悩みます。<br/>
            このままでは毎日の家賃（固定費）が払えずに倒産してしまいます！<br/>
            生き残るためには、あえて<strong>特殊な具材</strong>や<strong>クレイジーなコンセプト</strong>を組み合わせて、SNSで大バズりする<strong>「超・映えメニュー（とんちきメニュー）」</strong>を開発して一攫千金を狙うしかありません！
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-2 border-zinc-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">メニュー開発室</CardTitle>
            <CardDescription>ベースと具材を選んで、SNSでバズる奇抜なメニューを開発しましょう。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <Label className="text-base font-semibold">ベース料理</Label>
              <div className="flex flex-wrap gap-2">
                {unlockedBases.map(baseId => {
                  const baseInfo = BASES[baseId];
                  if (!baseInfo) return null;
                  const isSelected = selectedBase === baseId;
                  return (
                    <Button 
                      key={baseId} 
                      variant={isSelected ? 'default' : 'outline'}
                      className={`h-auto py-2 px-4 ${isSelected ? 'bg-primary shadow-md' : 'hover:bg-zinc-100'}`}
                      onClick={() => setSelectedBase(baseId)}
                    >
                      {baseInfo.imageUrl ? (
                         <img src={baseInfo.imageUrl} className="w-6 h-6 mr-2 rounded-sm" />
                      ) : (
                         <span className="mr-2 text-lg">{baseInfo.emoji}</span> 
                      )}
                      <div className="flex flex-col items-start">
                        <span>{baseInfo.name}</span>
                        <span className="text-[10px] opacity-70">¥{baseInfo.devCost.toLocaleString()}</span>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">具材カード（複数選択可）</Label>
              <div className="flex flex-wrap gap-2">
                {unlockedIngredients.map(ingId => {
                  const ingInfo = INGREDIENTS[ingId];
                  if (!ingInfo) return null;
                  const isSelected = selectedIngredients.includes(ingId);
                  return (
                    <Button 
                      key={ingId} 
                      variant={isSelected ? 'default' : 'outline'}
                      className={`h-auto py-2 px-4 ${isSelected ? 'bg-zinc-800 text-white shadow-md' : 'hover:bg-zinc-100'}`}
                      onClick={() => toggleIngredient(ingId)}
                    >
                      {ingInfo.imageUrl ? (
                         <img src={ingInfo.imageUrl} className="w-6 h-6 mr-2 rounded-sm" />
                      ) : (
                         <span className="mr-2 text-lg">{ingInfo.emoji}</span> 
                      )}
                      <div className="flex flex-col items-start">
                        <span>{ingInfo.name}</span>
                        <span className="text-[10px] opacity-70">¥{ingInfo.devCost.toLocaleString()}</span>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">コンセプト（隠し味や設定）</Label>
              <Input 
                className="text-md p-6 bg-zinc-50 focus-visible:ring-primary"
                placeholder="例：サイバーパンクな近未来のジャンクスイーツ" 
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              size="lg"
              className="w-full text-lg h-14 font-bold shadow-lg transition-transform hover:scale-[1.02] flex flex-col items-center justify-center" 
              onClick={handleDevelop} 
              disabled={isGeneratingMenu || !selectedBase || funds < totalDevCost}
            >
              {isGeneratingMenu ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  AIシェフが考案中...
                </div>
              ) : (
                <div className="flex flex-col items-center leading-none">
                  <span>新メニューを開発する！</span>
                  <span className="text-sm font-normal mt-1 opacity-90">開発費用: ¥{totalDevCost.toLocaleString()}</span>
                </div>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Result Display */}
        <div className="flex flex-col">
          {latestGeneratedMenu ? (
            <Card className="overflow-hidden border-2 border-primary shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-500">
              {latestGeneratedMenu.imageUrl && (
                <div className="aspect-square relative w-full bg-zinc-100 group flex items-center justify-center">
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-zinc-400">
                      <Loader2 className="h-8 w-8 animate-spin mb-2" />
                      <span className="text-sm font-medium">画像を描画中...</span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={latestGeneratedMenu.imageUrl} 
                    alt={latestGeneratedMenu.name} 
                    className="object-cover w-full h-full transition-all duration-700 group-hover:scale-105 z-10" 
                    onLoad={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.filter = 'blur(0px)'; }}
                    style={{ opacity: 0, filter: 'blur(10px)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
                </div>
              )}
              <CardHeader className="bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-black mb-2">{latestGeneratedMenu.name}</CardTitle>
                    <CardDescription className="text-lg font-bold text-primary">想定販売価格: ¥{latestGeneratedMenu.price.toLocaleString()}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 bg-white">
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="px-3 py-1 text-sm bg-pink-100 text-pink-700 hover:bg-pink-200">
                    ✨ 映え度: {latestGeneratedMenu.visualScore}/100
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200">
                    🔥 炎上リスク: {latestGeneratedMenu.flameRisk}/100
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200">
                    🍴 美味しさ: {latestGeneratedMenu.tasteScore}/100
                  </Badge>
                </div>
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 shadow-inner">
                  <p className="text-zinc-700 italic font-medium leading-relaxed">
                    「{latestGeneratedMenu.reviewComment}」
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50 text-muted-foreground p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-2">
                <span className="text-3xl">👨‍🍳</span>
              </div>
              <p className="font-medium text-lg text-zinc-500">まだメニューがありません</p>
              <p className="text-sm text-zinc-400 max-w-xs">左のパネルでベースと具材を組み合わせて、最高に「映える」メニューを作り出しましょう！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
