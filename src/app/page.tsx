'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { TopBar } from '@/components/game/TopBar';
import { MenuDevelopment } from '@/components/game/MenuDevelopment';
import { Showcase } from '@/components/game/Showcase';
import { Shop } from '@/components/game/Shop';
import { Gallery } from '@/components/game/Gallery';
import { GameOver } from '@/components/game/GameOver';
import { Tutorial } from '@/components/game/Tutorial';
import { MorningEventDialog } from '@/components/game/MorningEventDialog';
import { Button } from '@/components/ui/button';
import { Store, UtensilsCrossed, ShoppingBag, Images } from 'lucide-react';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentTab, setCurrentTab] = useState<'develop' | 'showcase' | 'shop' | 'gallery'>('develop');
  
  const { isGameOver, setIsGeneratingMenu } = useGameStore();

  useEffect(() => {
    setIsMounted(true);
    setIsGeneratingMenu(false); // Reset on mount in case it was stuck
  }, [setIsGeneratingMenu]);

  if (!isMounted) {
    return <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-bold text-zinc-500">ローディング中...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20">
      <Tutorial />
      <MorningEventDialog />
      <TopBar />
      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 mt-4">
        {isGameOver ? (
          <GameOver />
        ) : (
          <>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-zinc-900 mb-2">映えカフェ経営</h1>
                <p className="text-zinc-500 text-lg font-medium">新メニューを開発して、SNSでバズらせよう！</p>
              </div>
              
              <div className="flex flex-wrap bg-white p-1.5 rounded-xl shadow-sm border border-zinc-200 gap-1 w-full lg:w-auto">
                <Button 
                  variant={currentTab === 'develop' ? 'default' : 'ghost'} 
                  onClick={() => setCurrentTab('develop')}
                  className={`rounded-lg font-bold flex-1 lg:flex-none ${currentTab === 'develop' ? 'shadow-sm bg-primary text-primary-foreground' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'}`}
                >
                  <UtensilsCrossed className="w-4 h-4 mr-2" />
                  メニュー開発
                </Button>
                <Button 
                  variant={currentTab === 'showcase' ? 'default' : 'ghost'} 
                  onClick={() => setCurrentTab('showcase')}
                  className={`rounded-lg font-bold flex-1 lg:flex-none ${currentTab === 'showcase' ? 'shadow-sm bg-primary text-primary-foreground' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'}`}
                >
                  <Store className="w-4 h-4 mr-2" />
                  営業
                </Button>
                <Button 
                  variant={currentTab === 'shop' ? 'default' : 'ghost'} 
                  onClick={() => setCurrentTab('shop')}
                  className={`rounded-lg font-bold flex-1 lg:flex-none ${currentTab === 'shop' ? 'shadow-sm bg-primary text-primary-foreground' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'}`}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  仕入れ(Shop)
                </Button>
                <Button 
                  variant={currentTab === 'gallery' ? 'default' : 'ghost'} 
                  onClick={() => setCurrentTab('gallery')}
                  className={`rounded-lg font-bold flex-1 lg:flex-none ${currentTab === 'gallery' ? 'shadow-sm bg-primary text-primary-foreground' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'}`}
                >
                  <Images className="w-4 h-4 mr-2" />
                  ギャラリー
                </Button>
              </div>
            </div>
            
            {currentTab === 'develop' && <MenuDevelopment />}
            {currentTab === 'showcase' && <Showcase />}
            {currentTab === 'shop' && <Shop />}
            {currentTab === 'gallery' && <Gallery />}
          </>
        )}
      </main>
    </div>
  );
}
