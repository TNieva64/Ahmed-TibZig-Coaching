/**
 * Social Proof Dynamique
 * 
 * Affiche en temps réel les activités des autres clients
 * pour créer un effet de FOMO et de validation sociale
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle, Star, TrendingUp } from 'lucide-react';

interface SocialProofEvent {
  id: string;
  type: 'signup' | 'review' | 'progress' | 'reservation';
  message: string;
  time: string;
  location?: string;
}

const mockEvents: SocialProofEvent[] = [
  {
    id: '1',
    type: 'signup',
    message: 'Marie L. commence son parcours aujourd\'hui',
    time: 'Il y a 2 heures',
    location: 'Paris',
  },
  {
    id: '2',
    type: 'progress',
    message: 'Thomas D. progresse régulièrement : -5kg ce mois-ci !',
    time: 'Il y a 4 heures',
  },
  {
    id: '3',
    type: 'review',
    message: 'Sophie M. partage son expérience : "Un coaching bienveillant"',
    time: 'Cette semaine',
    location: 'Lyon',
  },
  {
    id: '4',
    type: 'reservation',
    message: 'Pierre a réservé son suivi mensuel',
    time: 'Cette semaine',
  },
  {
    id: '5',
    type: 'progress',
    message: 'Laura B. atteint ses 20 séances : félicitations ! 💪',
    time: 'Cette semaine',
  },
  {
    id: '6',
    type: 'review',
    message: 'Julien réalise son objectif : marathon en 3h42',
    time: 'Cette semaine',
  },
];

export function SocialProofPopup() {
  const [currentEvent, setCurrentEvent] = useState<SocialProofEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Afficher un événement aléatoire toutes les 3-5 minutes (moins intrusif)
    const showEvent = () => {
      const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
      setCurrentEvent(randomEvent);
      setIsVisible(true);

      // Masquer après 8 secondes
      setTimeout(() => {
        setIsVisible(false);
      }, 8000);
    };

    // Premier événement après 30 secondes (pas immédiat)
    const initialTimeout = setTimeout(showEvent, 30000);

    // Ensuite toutes les 3-5 minutes (moins fréquent)
    const interval = setInterval(() => {
      const delay = Math.random() * 120000 + 180000; // 3-5 min
      setTimeout(showEvent, delay);
    }, 240000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible || !currentEvent) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
      <Card className="bg-zinc-900 border-gold/30 shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {currentEvent.type === 'review' && (
              <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-gold fill-gold" />
              </div>
            )}
            {currentEvent.type === 'progress' && (
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            )}
            {(currentEvent.type === 'signup' || currentEvent.type === 'reservation') && (
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium mb-1">
              {currentEvent.message}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{currentEvent.time}</span>
              {currentEvent.location && (
                <>
                  <span>•</span>
                  <span>{currentEvent.location}</span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white flex-shrink-0"
          >
            ×
          </button>
        </div>
      </Card>
    </div>
  );
}

// Version statique pour les pages de conversion
export function SocialProofCard() {
  return (
    <Card className="bg-zinc-900 border-gold/30 p-6 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Ce qui se passe en ce moment
      </h3>

      <div className="space-y-3">
        {mockEvents.slice(0, 3).map((event) => (
          <div key={event.id} className="flex items-start gap-3 text-sm">
            {event.type === 'review' && (
              <Star className="w-4 h-4 text-gold fill-gold flex-shrink-0 mt-0.5" />
            )}
            {event.type === 'progress' && (
              <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            )}
            {(event.type === 'signup' || event.type === 'reservation') && (
              <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            )}

            <div>
              <p className="text-gray-300">{event.message}</p>
              <p className="text-gray-500 text-xs mt-1">{event.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800">
        <p className="text-gray-400 text-sm">
          <span className="text-gold font-semibold">250+ clients</span> nous font confiance
        </p>
      </div>
    </Card>
  );
}
