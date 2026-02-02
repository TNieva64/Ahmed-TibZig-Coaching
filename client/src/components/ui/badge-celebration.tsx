import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

interface BadgeCelebrationProps {
  badge: {
    icon: string;
    name: string;
    description: string;
    points: number;
    rarity: "common" | "rare" | "epic" | "legendary";
  };
  onClose: () => void;
  duration?: number;
}

const rarityConfig = {
  common: {
    bgColor: "from-gray-500 to-gray-600",
    textColor: "text-gray-800",
    borderColor: "border-gray-400",
    particles: ["⚪", "⚪", "⚪"]
  },
  rare: {
    bgColor: "from-blue-500 to-blue-600",
    textColor: "text-blue-800",
    borderColor: "border-blue-400",
    particles: ["💎", "✨", "💎"]
  },
  epic: {
    bgColor: "from-purple-500 to-purple-600",
    textColor: "text-purple-800",
    borderColor: "border-purple-400",
    particles: ["🌟", "✨", "💫", "🌟"]
  },
  legendary: {
    bgColor: "from-yellow-400 to-yellow-500",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-300",
    particles: ["👑", "🏆", "✨", "🌟", "💫", "👑"]
  }
};

export function BadgeCelebration({ badge, onClose, duration = 5000 }: BadgeCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [scale, setScale] = useState(0);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; rotation: number; delay: number }>>([]);

  const config = rarityConfig[badge.rarity];

  useEffect(() => {
    // Animation d'entrée
    setIsVisible(true);
    setShowParticles(true);
    
    // Animation du badge
    setTimeout(() => setScale(1), 100);
    
    // Générer les confettis
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -20 - Math.random() * 50,
      rotation: Math.random() * 360,
      delay: Math.random() * 500
    }));
    setConfetti(newConfetti);

    // Fermeture automatique
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setScale(0);
    setTimeout(() => {
      setIsVisible(false);
      setShowParticles(false);
      setTimeout(onClose, 300);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Confettis */}
      {showParticles && confetti.map((c) => (
        <div
          key={c.id}
          className="absolute animate-fall pointer-events-none"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            animationDelay: `${c.delay}ms`,
            transform: `rotate(${c.rotation}deg)`
          }}
        >
          <span className="text-2xl">{config.particles[c.id % config.particles.length]}</span>
        </div>
      ))}

      {/* Modal de célébration */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transition-all duration-500 ${config.borderColor} border-4`}
        style={{
          transform: `scale(${scale})`,
          opacity: scale
        }}
      >
        {/* Fond dégradé */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.bgColor} opacity-10`} />

        {/* Particules de fond */}
        {showParticles && config.particles.map((particle, i) => (
          <div
            key={i}
            className="absolute text-4xl animate-float opacity-20"
            style={{
              left: `${10 + (i * 20)}%`,
              top: `${20 + (i * 15)}%`,
              animationDelay: `${i * 200}ms`,
              animationDuration: `${3 + i}s`
            }}
          >
            {particle}
          </div>
        ))}

        {/* Bouton fermer */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Contenu */}
        <div className="relative p-8 text-center">
          {/* Badge icon */}
          <div className="relative mb-6">
            <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${config.bgColor} flex items-center justify-center shadow-lg ${config.borderColor} border-4 animate-pulse-slow`}>
              <span className="text-6xl">{badge.icon}</span>
            </div>
            
            {/* Particules autour du badge */}
            {showParticles && (
              <>
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl animate-bounce">✨</span>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>✨</span>
                <span className="absolute top-1/2 -left-4 -translate-y-1/2 text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>✨</span>
                <span className="absolute top-1/2 -right-4 -translate-y-1/2 text-2xl animate-bounce" style={{ animationDelay: '0.7s' }}>✨</span>
              </>
            )}
          </div>

          {/* Titre */}
          <h2 className={`text-3xl font-bold mb-2 ${config.textColor} animate-slide-up`}>
            Nouveau Badge !
          </h2>

          {/* Nom du badge */}
          <h3 className="text-2xl font-bold text-black mb-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
            {badge.name}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            {badge.description}
          </p>

          {/* Points */}
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${config.bgColor} text-white font-bold text-lg shadow-lg animate-slide-up`} style={{ animationDelay: '300ms' }}>
            <span>+</span>
            <span>{badge.points}</span>
            <span>points</span>
          </div>

          {/* Rareté */}
          <div className="mt-4 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${config.textColor} bg-opacity-20 ${config.bgColor.replace('from-', 'bg-').split(' ')[0]}`}>
              {badge.rarity === 'common' && 'Commun'}
              {badge.rarity === 'rare' && 'Rare'}
              {badge.rarity === 'epic' && 'Épique'}
              {badge.rarity === 'legendary' && 'Légendaire'}
            </span>
          </div>

          {/* Bouton continuer */}
          <Button
            onClick={handleClose}
            className={`mt-6 w-full bg-gradient-to-r ${config.bgColor} hover:opacity-90 text-white font-semibold animate-slide-up`}
            style={{ animationDelay: '500ms' }}
          >
            Continuer
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .animate-fall {
          animation: fall 3s ease-in forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

/**
 * Mini notification de badge (toast)
 */
interface BadgeToastProps {
  badge: {
    icon: string;
    name: string;
    rarity: "common" | "rare" | "epic" | "legendary";
  };
  onClose: () => void;
}

export function BadgeToast({ badge, onClose }: BadgeToastProps) {
  const config = rarityConfig[badge.rarity];

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-xl border-2 ${config.borderColor} p-4 flex items-center gap-4 animate-slide-in-right max-w-sm`}>
      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
        <span className="text-3xl">{badge.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-600">Nouveau badge débloqué !</p>
        <p className="font-bold text-black truncate">{badge.name}</p>
      </div>
      <button
        onClick={onClose}
        className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
