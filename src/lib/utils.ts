import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Menu } from "@/store/gameStore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMenuFreshness(menu: Menu, currentDay: number, daysActive?: number) {
  const currentAge = menu.createdAtDay !== undefined ? (currentDay - menu.createdAtDay) : (daysActive || 0);
  
  let decayRate = 0.3; // 普通
  if (menu.flameRisk >= 30 || menu.visualScore >= 80) {
    decayRate = 0.15; // 奇抜・ミーム化
  } else if (menu.visualScore >= 50 && menu.flameRisk < 30) {
    decayRate = 0.6; // 量産型映え
  }

  const freshness = Math.max(0.1, 1.0 - (currentAge * decayRate));
  return { freshness, decayRate, currentAge };
}

export function getFreshnessLabel(freshness: number) {
  if (freshness >= 0.8) return { text: "✨最高", className: "text-green-600" };
  if (freshness >= 0.5) return { text: "普通 (売上減)", className: "text-yellow-600" };
  if (freshness >= 0.3) return { text: "古い (売上半減)", className: "text-orange-500" };
  return { text: "⚠️廃棄寸前 (絶望的)", className: "text-red-600 font-bold" };
}
