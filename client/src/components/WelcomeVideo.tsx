import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, X } from 'lucide-react';

interface WelcomeVideoProps {
  onComplete?: () => void;
}

export default function WelcomeVideo({ onComplete }: WelcomeVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasWatched, setHasWatched] = useState(false);

  // TODO: Remplacer par l'URL réelle de la vidéo d'Ahmed une fois enregistrée
  const VIDEO_URL = "https://www.youtube.com/embed/dQw4w9WgXcQ"; // Placeholder

  const handleVideoEnd = () => {
    setHasWatched(true);
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    setIsPlaying(false);
    if (onComplete) {
      onComplete();
    }
  };

  if (!isPlaying) {
    return (
      <Card className="bg-gradient-to-br from-zinc-900 to-black border-yellow-500/20 p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Play className="w-12 h-12 text-white ml-1" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Bienvenue dans votre parcours de transformation ! 🎯
            </h2>
            <p className="text-gray-300 text-lg">
              Ahmed a enregistré un message personnel pour vous expliquer comment tirer le meilleur parti de votre coaching.
            </p>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-6 mb-6">
            <h3 className="text-yellow-500 font-semibold mb-3">📹 Dans cette vidéo, vous découvrirez :</h3>
            <ul className="text-left text-gray-300 space-y-2">
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">✓</span>
                <span>Comment naviguer dans votre dashboard personnalisé</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">✓</span>
                <span>L'approche unique d'Ahmed pour votre transformation</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">✓</span>
                <span>Les outils exclusifs à votre disposition</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">✓</span>
                <span>Comment communiquer efficacement avec votre coach</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => setIsPlaying(true)}
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold text-lg px-8"
            >
              <Play className="w-5 h-5 mr-2" />
              Regarder la Vidéo (3 min)
            </Button>
            <Button
              onClick={handleSkip}
              variant="ghost"
              size="lg"
              className="text-gray-400 hover:text-white"
            >
              Passer pour l'instant
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            💡 Conseil : Regarder cette vidéo vous aidera à démarrer du bon pied !
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-yellow-500/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Message de Bienvenue d'Ahmed</h3>
        <Button
          onClick={handleSkip}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={VIDEO_URL}
          title="Vidéo de bienvenue"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onEnded={handleVideoEnd}
        />
      </div>

      {hasWatched && (
        <div className="mt-4 text-center">
          <p className="text-green-500 font-semibold mb-2">✅ Vidéo terminée !</p>
          <Button
            onClick={handleSkip}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            Continuer vers mon Dashboard
          </Button>
        </div>
      )}
    </Card>
  );
}
