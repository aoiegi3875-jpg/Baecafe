'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Store, UtensilsCrossed, AlertTriangle, TrendingUp, ShoppingBag } from 'lucide-react';

const TUTORIAL_STEPS = [
  {
    title: 'カフェ経営へようこそ！',
    icon: <Store className="w-12 h-12 text-blue-500 mb-4 mx-auto" />,
    description: 'あなたは今日から「映えカフェ」のオーナーです。奇抜なメニューを開発してSNSでバズらせ、お店を大きくしていきましょう！'
  },
  {
    title: '1. メニューを開発する',
    icon: <UtensilsCrossed className="w-12 h-12 text-orange-500 mb-4 mx-auto" />,
    description: 'ベース料理と具材を組み合わせて、新しいメニューを作ります。奇抜な組み合わせやコンセプトを入力すると、AIが「映え度」「味」「炎上リスク」を判定し、メニューを生成します！'
  },
  {
    title: '2. ショーケースと営業',
    icon: <TrendingUp className="w-12 h-12 text-green-500 mb-4 mx-auto" />,
    description: '開発したメニューを「ショーケース」に並べて1日営業しましょう。売上とフォロワーを獲得できます。ただし、古いメニューは鮮度が落ちて売れにくくなるので注意！'
  },
  {
    title: '3. 問屋街（ショップ）',
    icon: <ShoppingBag className="w-12 h-12 text-yellow-500 mb-4 mx-auto" />,
    description: '稼いだ資金を使って、新しいベースや特殊な具材を仕入れることができます。「金箔」や「燃え盛る炎」など、ヤバい具材を手に入れましょう。'
  },
  {
    title: '4. 倒産と炎上に注意！',
    icon: <AlertTriangle className="w-12 h-12 text-red-500 mb-4 mx-auto" />,
    description: '【重要】毎日「家賃（固定費 5,000円）」がかかります。資金がマイナスの状態が3日続くと「倒産」です。また、奇抜すぎるメニューで炎上ゲージが100%になると「営業停止」になるのでマネジメントが重要です！'
  }
];

export function Tutorial() {
  const { hasSeenTutorial, completeTutorial } = useGameStore();
  const [currentStep, setCurrentStep] = useState(0);

  if (hasSeenTutorial) return null;

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <Dialog open={!hasSeenTutorial} onOpenChange={(open) => {
      // Allow closing only if it's the last step, or they click outside but we force them to finish or skip
      if (!open) completeTutorial();
    }}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-center pt-4">
            遊び方ガイド ({currentStep + 1}/{TUTORIAL_STEPS.length})
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-8 px-4 animate-in fade-in slide-in-from-right-4 duration-300" key={currentStep}>
          {step.icon}
          <h3 className="text-xl font-bold mb-4">{step.title}</h3>
          <p className="text-zinc-600 leading-relaxed text-sm sm:text-base">
            {step.description}
          </p>
        </div>

        <DialogFooter className="flex flex-row sm:justify-between items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handlePrev} 
            disabled={currentStep === 0}
            className="flex-1 sm:flex-none"
          >
            戻る
          </Button>
          <div className="flex gap-1">
            {TUTORIAL_STEPS.map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i === currentStep ? 'bg-primary' : 'bg-zinc-200'}`} />
            ))}
          </div>
          <Button 
            onClick={handleNext}
            className="flex-1 sm:flex-none font-bold"
          >
            {currentStep === TUTORIAL_STEPS.length - 1 ? 'プレイ開始！' : '次へ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
