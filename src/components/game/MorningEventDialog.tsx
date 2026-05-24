'use client';

import { useGameStore } from '@/store/gameStore';
import { MORNING_EVENTS } from '@/lib/events';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function MorningEventDialog() {
  const { pendingMorningEvent, resolveMorningEvent } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (pendingMorningEvent) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [pendingMorningEvent]);

  if (!pendingMorningEvent) return null;

  const eventDef = MORNING_EVENTS.find(e => e.id === pendingMorningEvent);
  if (!eventDef) {
    resolveMorningEvent(); // Handle edge case if event id is invalid
    return null;
  }

  const handleClose = () => {
    setIsOpen(false);
    // Resolve after animation
    setTimeout(() => {
      resolveMorningEvent();
    }, 300);
  };

  const titleColor = eventDef.type === 'good' ? 'text-green-600' : eventDef.type === 'bad' ? 'text-red-600' : 'text-blue-600';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto text-5xl mb-4 animate-bounce">
            {eventDef.emoji}
          </div>
          <DialogTitle className={`text-center text-2xl font-black ${titleColor}`}>
            {eventDef.title}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-4 text-zinc-800 font-medium">
            {eventDef.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center mt-6">
          <Button size="lg" onClick={handleClose} className="w-full font-bold text-lg">
            1日を始める
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
