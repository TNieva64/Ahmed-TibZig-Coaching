/**
 * Système de Transparence Honnête
 * 
 * Aligne avec les valeurs d'Ahmed : bienveillance, inclusion, authenticité
 * Pas de fausse urgence, juste de la transparence sur ses capacités réelles
 * 
 * CONFORME DGCCRF : Pas de pratiques commerciales déloyales
 */

import { Card } from '@/components/ui/card';
import { Heart, Users, Clock, Sparkles } from 'lucide-react';

interface TransparencyConfig {
  type: 'capacity' | 'availability' | 'quality';
  message: string;
  subtext?: string;
}

export function TransparencyBanner({ config }: { config: TransparencyConfig }) {
  const getIcon = () => {
    switch (config.type) {
      case 'capacity':
        return <Users className="w-5 h-5 text-gold" />;
      case 'availability':
        return <Clock className="w-5 h-5 text-gold" />;
      case 'quality':
        return <Heart className="w-5 h-5 text-gold" />;
    }
  };

  return (
    <Card className="bg-gold/5 border-gold/30 p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-white font-medium mb-1">
            {config.message}
          </p>
          {config.subtext && (
            <p className="text-sm text-gray-400">
              {config.subtext}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <Sparkles className="w-4 h-4 text-gold/50" />
        </div>
      </div>
    </Card>
  );
}

// Configurations alignées avec les valeurs d'Ahmed
// Honnête, transparent, bienveillant - PAS de fausse urgence
export const transparencyConfigs = {
  homepage: {
    type: 'capacity' as const,
    message: 'Je consacre du temps personnel à chaque client',
    subtext: 'Pour garantir un accompagnement de qualité, j\'accepte 10 nouveaux clients par mois',
  },
  programPage: {
    type: 'quality' as const,
    message: 'Chaque programme est créé sur mesure pour vous',
    subtext: 'Je prends le temps de comprendre vos objectifs pour vous accompagner au mieux',
  },
  coaching: {
    type: 'availability' as const,
    message: 'Prochaines disponibilités : Semaine du 7 février',
    subtext: 'Je vous réponds personnellement sous 24h',
  },
  dashboard: {
    type: 'quality' as const,
    message: 'Votre progression me tient à cœur',
    subtext: 'Je suis disponible pour ajuster votre programme à tout moment',
  },
};

// Alias pour compatibilité avec le code existant
export const scarcityConfigs = transparencyConfigs;
export { TransparencyBanner as ScarcityBanner };
