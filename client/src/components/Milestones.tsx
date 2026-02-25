/**
 * Système de Milestones et Célébrations
 * 
 * Célèbre les réussites des clients pour augmenter la rétention
 * et l'engagement (gamification avancée)
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Award, Medal, Star, Sparkles } from 'lucide-react';

interface Milestone {
  id: string;
  type: 'first_week' | 'first_month' | 'streak_7' | 'streak_30' | 'goal_50' | 'goal_100';
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

export function MilestonesTracker() {
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: '1',
      type: 'first_week',
      title: 'Première Semaine',
      description: 'Complétez votre première semaine d\'entraînement',
      icon: Sparkles,
      unlocked: false,
    },
    {
      id: '2',
      type: 'first_month',
      title: 'Un Mois Ensemble',
      description: 'Un mois de suivi régulier',
      icon: Award,
      unlocked: false,
    },
    {
      id: '3',
      type: 'streak_7',
      title: 'Semaine Parfaite',
      description: '7 jours d\'entraînement consécutifs',
      icon: Trophy,
      unlocked: false,
    },
    {
      id: '4',
      type: 'streak_30',
      title: 'Warrior',
      description: '30 jours d\'entraînement consécutifs',
      icon: Medal,
      unlocked: false,
    },
    {
      id: '5',
      type: 'goal_50',
      title: 'À Mi-Parcours',
      description: '50% de votre objectif atteint',
      icon: Star,
      unlocked: false,
      progress: 35,
      target: 50,
    },
    {
      id: '6',
      type: 'goal_100',
      title: 'Objectif Atteint',
      description: '100% de votre objectif accompli',
      icon: Trophy,
      unlocked: false,
      progress: 35,
      target: 100,
    },
  ]);

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMilestone, setCelebrationMilestone] = useState<Milestone | null>(null);

  const unlockMilestone = (id: string) => {
    setMilestones(prev =>
      prev.map(m =>
        m.id === id ? { ...m, unlocked: true } : m
      )
    );

    const milestone = milestones.find(m => m.id === id);
    if (milestone) {
      setCelebrationMilestone(milestone);
      setShowCelebration(true);

      setTimeout(() => {
        setShowCelebration(false);
      }, 5000);
    }
  };

  return (
    <>
      <Card className="bg-white border-gold/30 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-black mb-4">
          🏆 Vos Réussites
        </h3>

        <div className="space-y-3">
          {milestones.map((milestone) => {
            const Icon = milestone.icon;

            return (
              <div
                key={milestone.id}
                className={`p-4 rounded-lg border transition-all ${
                  milestone.unlocked
                    ? 'bg-gold/10 border-gold/30'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 ${
                      milestone.unlocked ? 'text-gold' : 'text-gray-400'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <h4
                      className={`font-medium mb-1 ${
                        milestone.unlocked ? 'text-gold' : 'text-gray-600'
                      }`}
                    >
                      {milestone.title}
                      {milestone.unlocked && ' ✅'}
                    </h4>
                    <p className="text-sm text-gray-500 mb-2">
                      {milestone.description}
                    </p>

                    {milestone.progress !== undefined && milestone.target && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gold h-2 rounded-full transition-all"
                          style={{ width: `${(milestone.progress / milestone.target) * 100}%` }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {milestone.progress}% atteint
                        </p>
                      </div>
                    )}

                    {!milestone.unlocked && (
                      <button
                        onClick={() => unlockMilestone(milestone.id)}
                        className="text-xs text-gold hover:text-gold/80 mt-2"
                      >
                        (Simuler déblocage)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="text-gold font-semibold">
              {milestones.filter(m => m.unlocked).length}
            </span>{' '}
            / {milestones.length} réussites débloquées
          </p>
        </div>
      </Card>

      {/* Modal de célébration */}
      {showCelebration && celebrationMilestone && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80">
          <Card className="bg-white border-gold p-8 max-w-md mx-4 text-center animate-bounce-in">
            <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <celebrationMilestone.icon className="w-12 h-12 text-gold" />
            </div>

            <h2 className="text-2xl font-bold text-gold mb-2">
              Félicitations ! 🎉
            </h2>

            <h3 className="text-xl font-semibold text-black mb-2">
              {celebrationMilestone.title} débloqué
            </h3>

            <p className="text-gray-600 mb-6">
              {celebrationMilestone.description}
            </p>

            <button
              onClick={() => setShowCelebration(false)}
              className="bg-gold text-black px-6 py-3 rounded-lg font-semibold hover:bg-gold/90 transition-colors"
            >
              Continuer
            </button>
          </Card>
        </div>
      )}
    </>
  );
}

// Petit widget pour le dashboard
export function MilestonesWidget() {
  return (
    <Card className="bg-gradient-to-br from-gold/20 to-orange-500/20 border-gold/40 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-8 h-8 text-gold" />
        <div>
          <h3 className="font-semibold text-black">Prochaine Réussite</h3>
          <p className="text-sm text-gray-600">Semaine Parfaite</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Progression</span>
          <span className="text-gold font-medium">5/7 jours</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-gold h-2 rounded-full" style={{ width: '71%' }} />
        </div>
      </div>

      <p className="text-xs text-gray-500">
        2 jours consécutifs de plus pour débloquer ce trophée !
      </p>
    </Card>
  );
}
