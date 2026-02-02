/**
 * Effet de confettis pour célébrer les réussites
 *
 * Ajoute une touche de joie et de célébration
 * Aligné avec la philosophie bienveillante : célébrer chaque victoire
 */

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiCelebrationProps {
  trigger?: boolean;
  duration?: number;
  intensity?: 'low' | 'medium' | 'high';
}

export function useConfettiCelebration() {
  const [isCelebrating, setIsCelebrating] = useState(false);

  const celebrate = ({
    duration = 3000,
    intensity = 'medium',
  }: {
    duration?: number;
    intensity?: 'low' | 'medium' | 'high';
  } = {}) => {
    setIsCelebrating(true);

    const particleCount = {
      low: 50,
      medium: 100,
      high: 200,
    }[intensity];

    const spread = {
      low: 50,
      medium: 70,
      high: 100,
    }[intensity];

    const colors = ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#4169E1'];

    // Confettis depuis le centre
    confetti({
      particleCount,
      spread,
      origin: { y: 0.6 },
      colors,
      disableForReducedMotion: true,
      zIndex: 9999,
    });

    // Confettis depuis les côtés (pour intensité medium/high)
    if (intensity !== 'low') {
      setTimeout(() => {
        confetti({
          particleCount: particleCount / 2,
          angle: 60,
          spread,
          origin: { x: 0 },
          colors,
          disableForReducedMotion: true,
        });
        confetti({
          particleCount: particleCount / 2,
          angle: 120,
          spread,
          origin: { x: 1 },
          colors,
          disableForReducedMotion: true,
        });
      }, 250);
    }

    setTimeout(() => {
      setIsCelebrating(false);
    }, duration);
  };

  return {
    isCelebrating,
    celebrate,
  };
}

/**
 * Composant qui déclenche des confettis automatiquement
 * Utilisation : <ConfettiCelebration trigger={showConfetti} />
 */
export function ConfettiCelebration({ trigger, duration = 3000, intensity = 'medium' }: ConfettiCelebrationProps) {
  useEffect(() => {
    if (trigger) {
      const particleCount = {
        low: 50,
        medium: 100,
        high: 200,
      }[intensity];

      const spread = {
        low: 50,
        medium: 70,
        high: 100,
      }[intensity];

      const colors = ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#4169E1'];

      confetti({
        particleCount,
        spread,
        origin: { y: 0.6 },
        colors,
        disableForReducedMotion: true,
        zIndex: 9999,
      });

      if (intensity !== 'low') {
        setTimeout(() => {
          confetti({
            particleCount: particleCount / 2,
            angle: 60,
            spread,
            origin: { x: 0 },
            colors,
            disableForReducedMotion: true,
          });
          confetti({
            particleCount: particleCount / 2,
            angle: 120,
            spread,
            origin: { x: 1 },
            colors,
            disableForReducedMotion: true,
          });
        }, 250);
      }
    }
  }, [trigger, duration, intensity]);

  return null; // Ce composant ne rend rien
}

/**
 * Hook pour célébrer différents types de réussites
 */
export function useCelebrationTriggers() {
  const { celebrate } = useConfettiCelebration();

  const celebrateWorkoutComplete = () => {
    celebrate({ duration: 2000, intensity: 'medium' });
  };

  const celebrateAchievement = () => {
    celebrate({ duration: 4000, intensity: 'high' });
  };

  const celebrateLevelUp = () => {
    celebrate({ duration: 3000, intensity: 'medium' });
  };

  const celebrateStreak = (days: number) => {
    const intensity = days >= 30 ? 'high' : days >= 7 ? 'medium' : 'low';
    celebrate({ duration: 2500, intensity });
  };

  const celebrateFirstWorkout = () => {
    celebrate({ duration: 5000, intensity: 'high' });
  };

  return {
    celebrateWorkoutComplete,
    celebrateAchievement,
    celebrateLevelUp,
    celebrateStreak,
    celebrateFirstWorkout,
  };
}
