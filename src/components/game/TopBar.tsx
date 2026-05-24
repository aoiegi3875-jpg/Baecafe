'use client';
import { useGameStore } from '@/store/gameStore';
import { Coins, Users, Calendar, Flame, HelpCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export function TopBar() {
  const { funds, followers, day, flameGauge, showTutorial, resetGame, isGeneratingMenu } = useGameStore();

  const handleReset = () => {
    if (window.confirm('これまでのデータ（資金、フォロワー、ギャラリー、ショップ解放状況など）がすべて消え、最初からやり直します。本当によろしいですか？')) {
      resetGame();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 shadow-sm border-b sticky top-0 z-50 gap-4">
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span className="font-bold">{day}日目</span>
        </div>
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-500" />
          <span className="font-bold">¥{funds.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-green-500" />
          <span className="font-bold">{followers.toLocaleString()}</span>
        </div>
      </div>

      {isGeneratingMenu && (
        <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-blue-500 text-white rounded-full text-sm font-bold shadow-md animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="hidden sm:inline">AIシェフが新メニュー考案中...</span>
          <span className="sm:hidden">考案中...</span>
        </div>
      )}
      
      <div className="flex items-center gap-3 w-full sm:w-1/3">
        <Flame className={`w-5 h-5 ${flameGauge > 80 ? 'text-red-500 animate-bounce' : 'text-orange-500'}`} />
        <div className="flex-1">
          <Progress value={flameGauge} className="h-3" />
        </div>
        <span className="text-sm font-bold w-12 text-right">{flameGauge}%</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={showTutorial} className="hidden sm:flex gap-1 font-bold">
          <HelpCircle className="w-4 h-4" /> 遊び方
        </Button>
        <Button variant="outline" size="icon" onClick={showTutorial} className="sm:hidden fixed bottom-4 right-20 z-50 rounded-full shadow-lg h-12 w-12 bg-white">
          <HelpCircle className="w-6 h-6 text-zinc-600" />
        </Button>

        <Button variant="destructive" size="sm" onClick={handleReset} className="hidden sm:flex gap-1 font-bold">
          <RefreshCw className="w-4 h-4" /> やり直す
        </Button>
        <Button variant="destructive" size="icon" onClick={handleReset} className="sm:hidden fixed bottom-4 right-4 z-50 rounded-full shadow-lg h-12 w-12 bg-white">
          <RefreshCw className="w-6 h-6 text-white" />
        </Button>
      </div>
    </div>
  );
}
