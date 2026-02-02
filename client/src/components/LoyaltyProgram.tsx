/**
 * Programme de Fidélité Automatique
 * 
 * Récompense les clients fidèles pour augmenter la rétention
 * et encourager les recommandations
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Crown, Sparkles, Heart } from 'lucide-react';

interface LoyaltyTier {
  name: string;
  monthsRequired: number;
  color: string;
  benefits: string[];
  icon: any;
}

const loyaltyTiers: LoyaltyTier[] = [
  {
    name: 'Bronze',
    monthsRequired: 0,
    color: 'text-orange-400',
    icon: Heart,
    benefits: [
      'Accès à tous les programmes de base',
      'Support email',
      'Suivi de progression standard',
    ],
  },
  {
    name: 'Silver',
    monthsRequired: 3,
    color: 'text-gray-300',
    icon: Sparkles,
    benefits: [
      'Tout le niveau Bronze',
      '1 appel coaching offert par mois',
      'Priorité support',
      'Exercices exclusifs',
      'Newsletter VIP',
    ],
  },
  {
    name: 'Gold',
    monthsRequired: 6,
    color: 'text-gold',
    icon: Crown,
    benefits: [
      'Tout le niveau Silver',
      '2 appels coaching offerts par mois',
      'Plans personnalisés PDF',
      'Accès anticipé aux nouveautés',
      'Groupe privé WhatsApp',
      '-10% sur tout le site',
    ],
  },
  {
    name: 'Platinum',
    monthsRequired: 12,
    color: 'text-purple-400',
    icon: Gift,
    benefits: [
      'Tout le niveau Gold',
      'Appels illimités',
      'Coaching vidéo personnalisé',
      'Programme sur mesure',
      'Événements exclusifs',
      '-20% sur tout le site',
      'Statut Ambassadeur',
    ],
  },
];

export function LoyaltyProgram({ currentMonths = 1 }: { currentMonths?: number }) {
  const [selectedTier, setSelectedTier] = useState<number>(0);

  const currentTier = loyaltyTiers
    .slice()
    .reverse()
    .find(tier => currentMonths >= tier.monthsRequired) || loyaltyTiers[0];

  const nextTier = loyaltyTiers.find(tier => tier.monthsRequired > currentMonths);

  const monthsUntilNext = nextTier ? nextTier.monthsRequired - currentMonths : 0;
  const progressToNext = nextTier
    ? ((currentMonths - currentTier.monthsRequired) / (nextTier.monthsRequired - currentTier.monthsRequired)) * 100
    : 100;

  return (
    <Card className="bg-zinc-900 border-gold/30 p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-3">
          <currentTier.icon className={`w-8 h-8 ${currentTier.color}`} />
          <h2 className="text-2xl font-bold text-white">
            Statut {currentTier.name}
          </h2>
        </div>
        <p className="text-gray-400">
          {currentMonths} mois d'engagement • Merci pour votre fidélité ! 💚
        </p>
      </div>

      {/* Progression vers niveau supérieur */}
      {nextTier && (
        <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">Prochain niveau : {nextTier.name}</span>
            <span className="text-gold font-semibold">{monthsUntilNext} mois</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-gold to-orange-500 h-3 rounded-full transition-all"
              style={{ width: `${Math.min(progressToNext, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {progressToNext.toFixed(0)}% vers le niveau {nextTier.name}
          </p>
        </div>
      )}

      {/* Bénéfices actuels */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">
          Vos avantages actuels
        </h3>
        <ul className="space-y-2">
          {currentTier.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
              <span className="text-gold mt-1">✓</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tous les niveaux */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          Tous les niveaux de fidélité
        </h3>
        <div className="space-y-2">
          {loyaltyTiers.map((tier, index) => {
            const Icon = tier.icon;
            const isActive = currentTier.name === tier.name;
            const isLocked = currentMonths < tier.monthsRequired;

            return (
              <button
                key={index}
                onClick={() => setSelectedTier(index)}
                disabled={isLocked && !isActive}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  isActive
                    ? 'bg-gold/20 border-gold/50'
                    : isLocked
                    ? 'bg-zinc-800 border-zinc-700 opacity-50'
                    : 'bg-zinc-800 border-zinc-700 hover:border-gold/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${tier.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${isActive ? 'text-gold' : 'text-white'}`}>
                        {tier.name}
                      </span>
                      {!isActive && !isLocked && (
                        <span className="text-xs text-gray-400">Débloqué</span>
                      )}
                      {isLocked && (
                        <span className="text-xs text-gray-500">
                          {tier.monthsRequired} mois+
                        </span>
                      )}
                    </div>
                    {!isActive && !isLocked && (
                      <p className="text-xs text-gray-500 mt-1">
                        Passez au niveau supérieur !
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA pour réengagement */}
      {currentMonths >= 2 && nextTier && monthsUntilNext <= 2 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-gold/20 to-orange-500/20 border border-gold/40 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Gift className="w-6 h-6 text-gold" />
            <div>
              <p className="text-white font-semibold">
                Bientôt niveau {nextTier.name} ! 🎉
              </p>
              <p className="text-sm text-gray-400">
                Plus que {monthsUntilNext} mois pour débloquer vos nouveaux avantages
              </p>
            </div>
          </div>
          <Button className="w-full bg-gold text-black hover:bg-gold/90">
            Prolonger mon abonnement
          </Button>
        </div>
      )}
    </Card>
  );
}

// Petit widget pour le dashboard
export function LoyaltyWidget({ currentMonths = 1 }: { currentMonths?: number }) {
  const currentTier = loyaltyTiers
    .slice()
    .reverse()
    .find(tier => currentMonths >= tier.monthsRequired) || loyaltyTiers[0];

  const Icon = currentTier.icon;

  return (
    <Card className="bg-zinc-900 border-gold/30 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center ${currentTier.color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Votre statut</p>
          <p className={`font-semibold ${currentTier.color}`}>
            {currentTier.name}
          </p>
        </div>
      </div>
    </Card>
  );
}
