'use client';

import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getMenuFreshness, getFreshnessLabel } from '@/lib/utils';

export function Gallery() {
  const { gallery, day } = useGameStore();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-black mb-2">過去の栄光 (ギャラリー)</h2>
        <p className="text-zinc-500">これまでに開発した全メニューの記録です。あの炎上メニューも、奇跡のバズメニューも。</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {gallery.map(menu => {
          const { freshness } = getMenuFreshness(menu, day, 0);
          const label = getFreshnessLabel(freshness);
          return (
          <Card key={menu.id} className="overflow-hidden bg-white shadow-sm border border-zinc-200">
            {menu.imageUrl ? (
              <div className="aspect-square relative w-full bg-zinc-100 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={menu.imageUrl} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
              </div>
            ) : (
              <div className="aspect-square w-full bg-zinc-200 flex items-center justify-center text-4xl">🍽️</div>
            )}
            <CardHeader className="bg-white">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-xl font-bold">{menu.name}</CardTitle>
                <span className={`text-xs font-bold px-2 py-1 bg-zinc-50 rounded-full ${label.className} border border-zinc-200 shrink-0`}>
                  {label.text}
                </span>
              </div>
              <CardDescription className="font-bold text-primary">想定販売価格: ¥{menu.price.toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 bg-white">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-pink-100 text-pink-700">✨ 映: {menu.visualScore}</Badge>
                <Badge variant="secondary" className="bg-red-100 text-red-700">🔥 炎: {menu.flameRisk}</Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-700">🍴 味: {menu.tasteScore}</Badge>
              </div>
              <div className="p-3 bg-zinc-50 rounded-lg text-sm text-zinc-600 italic">
                「{menu.reviewComment}」
              </div>
              <div className="pt-2 text-xs text-zinc-400 font-medium">
                コンセプト: {menu.concept || 'なし'}
              </div>
            </CardContent>
          </Card>
          );
        })}
        {gallery.length === 0 && (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 font-medium text-lg bg-zinc-50/50">
            まだメニューを開発していません。
          </div>
        )}
      </div>
    </div>
  );
}
