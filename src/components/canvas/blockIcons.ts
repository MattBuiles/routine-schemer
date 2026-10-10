import { Bike, Dumbbell, Flame, HeartPulse, Leaf, Moon, Mountain, Sparkles, Swords, Target, Timer, Zap, type LucideIcon } from 'lucide-react';

import type { BlockIconKey } from '@/lib/board/cycle';

export const ICON_COMPONENTS: Record<BlockIconKey, LucideIcon> = {
  dumbbell: Dumbbell,
  flame: Flame,
  zap: Zap,
  'heart-pulse': HeartPulse,
  target: Target,
  leaf: Leaf,
  moon: Moon,
  sparkles: Sparkles,
  mountain: Mountain,
  swords: Swords,
  timer: Timer,
  bike: Bike,
};

export const getIcon = (key: string): LucideIcon => ICON_COMPONENTS[key as BlockIconKey] ?? Sparkles;
