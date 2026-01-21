import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { Trophy, Star, Lock, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import confetti from "canvas-confetti";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Achievement {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  category: "workout" | "nutrition" | "streak" | "milestone" | "special";
  requirement: string | null;
  points: number;
  createdAt: Date;
  earnedAt?: Date;
}

export default function Badges() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);
  const [newBadges, setNewBadges] = useState<Achievement[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  const { data: allBadges, isLoading: loadingAll } = trpc.badge.getAllBadges.useQuery();
  const { data: userBadges, isLoading: loadingUser, refetch } = trpc.badge.getUserBadges.useQuery(
    { userId: user?.id },
    { enabled: isAuthenticated }
  );

  const checkBadgesMutation = trpc.badge.checkAndAwardBadges.useMutation({
    onSuccess: (data) => {
      if (data.newlyEarnedBadges.length > 0) {
        setNewBadges(data.newlyEarnedBadges);
        setShowCelebration(true);
        fireConfetti();
        toast.success(`🎉 Vous avez gagné ${data.newlyEarnedBadges.length} nouveau(x) badge(s) !`);
        refetch();
      } else {
        toast.info("Aucun nouveau badge pour le moment. Continuez vos efforts !");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la vérification des badges");
    },
  });

  const fireConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  useEffect(() => {
    // Auto-check badges on page load
    if (isAuthenticated) {
      checkBadgesMutation.mutate({ userId: user?.id });
    }
  }, [isAuthenticated]);

  if (loading || loadingAll || loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation('/');
    return null;
  }

  const earnedBadgeIds = new Set(userBadges?.map(b => b.id) || []);
  const totalPoints = userBadges?.reduce((sum, b) => sum + b.points, 0) || 0;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      workout: "bg-blue-500/20 text-blue-500 border-blue-500/30",
      nutrition: "bg-green-500/20 text-green-500 border-green-500/30",
      streak: "bg-orange-500/20 text-orange-500 border-orange-500/30",
      milestone: "bg-purple-500/20 text-purple-500 border-purple-500/30",
      special: "bg-gold/20 text-gold border-gold/30",
    };
    return colors[category] || "bg-gray-500/20 text-gray-500 border-gray-500/30";
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      workout: "Entraînement",
      nutrition: "Nutrition",
      streak: "Régularité",
      milestone: "Progression",
      special: "Spécial",
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-gold mb-2">Badges de Motivation</h1>
            <p className="text-gray-400">Débloquez des badges en atteignant vos objectifs</p>
          </div>
          <Button
            onClick={() => checkBadgesMutation.mutate({ userId: user?.id })}
            disabled={checkBadgesMutation.isPending}
            className="bg-gold text-black hover:bg-gold/90"
          >
            {checkBadgesMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Vérifier les badges
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-zinc-900 border-gold/20 p-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-gold" />
              <div>
                <p className="text-sm text-gray-400">Badges débloqués</p>
                <p className="text-2xl font-bold text-white">
                  {userBadges?.length || 0} / {allBadges?.length || 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="bg-zinc-900 border-gold/20 p-6">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-gold" />
              <div>
                <p className="text-sm text-gray-400">Points totaux</p>
                <p className="text-2xl font-bold text-white">{totalPoints}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-zinc-900 border-gold/20 p-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-gold" />
              <div>
                <p className="text-sm text-gray-400">Progression</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round(((userBadges?.length || 0) / (allBadges?.length || 1)) * 100)}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allBadges?.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);
            const earnedBadge = userBadges?.find(b => b.id === badge.id);

            return (
              <Card
                key={badge.id}
                onClick={() => setSelectedBadge(isEarned ? earnedBadge! : badge)}
                className={`p-6 cursor-pointer transition-all hover:scale-105 ${
                  isEarned
                    ? 'bg-gradient-to-br from-gold/20 to-gold/5 border-gold/40'
                    : 'bg-zinc-900 border-zinc-700 opacity-60'
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  {/* Icon */}
                  <div className={`text-6xl ${!isEarned && 'grayscale'}`}>
                    {isEarned ? badge.icon : <Lock className="h-16 w-16 text-gray-600" />}
                  </div>

                  {/* Name */}
                  <h3 className={`font-bold text-lg ${isEarned ? 'text-gold' : 'text-gray-500'}`}>
                    {badge.name}
                  </h3>

                  {/* Description */}
                  <p className={`text-sm ${isEarned ? 'text-gray-300' : 'text-gray-600'}`}>
                    {badge.description}
                  </p>

                  {/* Category & Points */}
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <Badge className={getCategoryColor(badge.category)}>
                      {getCategoryLabel(badge.category)}
                    </Badge>
                    <Badge variant="outline" className="border-gold/20 text-gold">
                      {badge.points} pts
                    </Badge>
                  </div>

                  {/* Earned Date */}
                  {isEarned && earnedBadge?.earnedAt && (
                    <p className="text-xs text-gray-500">
                      Obtenu le {new Date(earnedBadge.earnedAt).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Badge Detail Dialog */}
        {selectedBadge && (
          <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
            <DialogContent className="bg-zinc-900 border-gold/20 text-white">
              <DialogHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="text-8xl">{selectedBadge.icon}</div>
                </div>
                <DialogTitle className="text-gold text-center text-2xl">{selectedBadge.name}</DialogTitle>
                <DialogDescription className="text-gray-400 text-center">
                  {selectedBadge.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Badge className={getCategoryColor(selectedBadge.category)}>
                    {getCategoryLabel(selectedBadge.category)}
                  </Badge>
                  <Badge variant="outline" className="border-gold/20 text-gold">
                    {selectedBadge.points} points
                  </Badge>
                </div>

                {selectedBadge.earnedAt && (
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Obtenu le</p>
                    <p className="text-lg font-semibold text-gold">
                      {new Date(selectedBadge.earnedAt).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                {!selectedBadge.earnedAt && selectedBadge.requirement && (
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Condition d'obtention:</p>
                    <p className="text-white">{JSON.parse(selectedBadge.requirement).type}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Celebration Dialog */}
        {showCelebration && newBadges.length > 0 && (
          <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
            <DialogContent className="bg-gradient-to-br from-gold/30 to-gold/10 border-gold/40 text-white">
              <DialogHeader>
                <DialogTitle className="text-gold text-center text-3xl mb-4">
                  🎉 Félicitations ! 🎉
                </DialogTitle>
                <DialogDescription className="text-white text-center text-lg">
                  Vous avez débloqué {newBadges.length} nouveau(x) badge(s) !
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {newBadges.map((badge) => (
                  <Card key={badge.id} className="bg-zinc-900/50 border-gold/20 p-4">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{badge.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gold">{badge.name}</h3>
                        <p className="text-gray-300 text-sm">{badge.description}</p>
                        <Badge className="mt-2 bg-gold/20 text-gold border-gold/30">
                          +{badge.points} points
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <Button
                onClick={() => setShowCelebration(false)}
                className="w-full bg-gold text-black hover:bg-gold/90"
              >
                Continuer
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
