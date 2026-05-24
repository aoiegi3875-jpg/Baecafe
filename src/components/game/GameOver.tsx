'use client';

import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function GameOver() {
  const { funds, followers, day, flameGauge, resetGame } = useGameStore();

  const isBankruptcy = funds < 0;

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-lg border-4 border-red-600 shadow-2xl animate-in zoom-in-95 duration-700 bg-white">
        <CardHeader className="bg-red-50 text-red-900 text-center py-10 border-b border-red-100">
          <h1 className="text-6xl mb-4 animate-bounce">💥</h1>
          <CardTitle className="text-5xl font-black mb-2">GAME OVER</CardTitle>
          <CardDescription className="text-xl font-bold text-red-700">
            {isBankruptcy ? '3日間資金ショートが続き、倒産しました...' : '大炎上により、営業停止処分を受けました...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8 space-y-6 text-center text-lg bg-white">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
              <p className="text-zinc-500 text-sm font-bold">生存日数</p>
              <p className="text-3xl font-black text-zinc-900">{day}日</p>
            </div>
            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
              <p className="text-zinc-500 text-sm font-bold">最終フォロワー数</p>
              <p className="text-3xl font-black text-green-600">{followers.toLocaleString()}人</p>
            </div>
            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
              <p className="text-zinc-500 text-sm font-bold">最終資金</p>
              <p className={`text-3xl font-black ${funds < 0 ? 'text-red-600' : 'text-yellow-600'}`}>¥{funds.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-zinc-50 p-6 flex justify-center border-t border-zinc-100">
          <Button size="lg" className="text-xl w-full h-16 font-bold" onClick={resetGame}>
            最初からやり直す
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
