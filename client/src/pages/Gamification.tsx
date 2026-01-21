import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Star, Award, TrendingUp, Target } from "lucide-react";
import { useLocation } from "wouter";

export default function Gamification() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: allAchievements, isLoading: loadingAchievements } = trpc.gamification.getAllAchievements.useQuery();
  const { data: userAchievements, isLoading: loadingUserAchievements } = trpc.gamification.getUserAchievements.useQuery({});
  const { data: streak, isLoading: loadingStreak } = trpc.gamification.getUserStreak.useQuery({});

  if (loading || loadingAchievements || loadingUserAchievements || loadingStreak) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de vos accomplissements...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-900 border-gold/20 max-w-md">
          <CardHeader>
            <CardTitle className="text-gold">Connexion requise</CardTitle>
            <CardDescription>Vous devez être connecté pour voir vos accomplissements.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setLocation("/api/oauth/login")} 
              className="w-full bg-gold text-black hover:bg-gold/90"
            >
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const earnedAchievementIds = userAchievements?.map(ua => ua.achievementId) || [];
  const totalPoints = allAchievements
    ?.filter(a => earnedAchievementIds.includes(a.id))
    .reduce((sum, a) => sum + (a.points || 0), 0) || 0;

  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;

  // Calculate level based on points
  const getLevel = (points: number) => {
    if (points < 100) return { name: "Bronze", color: "text-amber-700", progress: points };
    if (points < 300) return { name: "Argent", color: "text-gray-400", progress: points - 100 };
    if (points < 600) return { name: "Or", color: "text-gold", progress: points - 300 };
    return { name: "Platine", color: "text-blue-400", progress: points - 600 };
  };

  const level = getLevel(totalPoints);
  const nextLevelPoints = level.name === "Bronze" ? 100 : level.name === "Argent" ? 200 : level.name === "Or" ? 300 : 1000;
  const progressPercent = (level.progress / nextLevelPoints) * 100;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl font-bold text-gold mb-4">Mes Accomplissements</h1>
          <p className="text-gray-400 text-lg">Suivez votre progression et débloquez des badges exclusifs</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Streak Card */}
          <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-500" />
                  Série Actuelle
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-6xl font-bold text-orange-500 mb-2">{currentStreak}</div>
                <p className="text-gray-400">jours consécutifs</p>
                <div className="mt-4 pt-4 border-t border-orange-500/20">
                  <p className="text-sm text-gray-400">Record personnel</p>
                  <p className="text-2xl font-bold text-orange-400">{longestStreak} jours</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Level Card */}
          <Card className="bg-gradient-to-br from-gold/20 to-yellow-900/20 border-gold/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-gold" />
                Niveau
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-4xl font-bold ${level.color} mb-2`}>{level.name}</div>
                <p className="text-gray-400 mb-4">{totalPoints} points</p>
                <div className="space-y-2">
                  <Progress value={progressPercent} className="h-3" />
                  <p className="text-sm text-gray-400">
                    {level.progress}/{nextLevelPoints} points pour le prochain niveau
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements Card */}
          <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="w-6 h-6 text-blue-500" />
                Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-500 mb-2">
                  {userAchievements?.length || 0}
                </div>
                <p className="text-gray-400">badges débloqués</p>
                <div className="mt-4 pt-4 border-t border-blue-500/20">
                  <p className="text-sm text-gray-400">Total disponible</p>
                  <p className="text-2xl font-bold text-blue-400">{allAchievements?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-serif font-bold text-gold mb-6">Badges Disponibles</h2>
          
          {allAchievements && allAchievements.length === 0 ? (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="py-12 text-center">
                <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Aucun badge disponible pour le moment.</p>
                <p className="text-gray-500 text-sm mt-2">Votre coach ajoutera des badges bientôt !</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allAchievements?.map((achievement) => {
                const isEarned = earnedAchievementIds.includes(achievement.id);
                const earnedDate = userAchievements?.find(ua => ua.achievementId === achievement.id)?.earnedAt;

                return (
                  <Card 
                    key={achievement.id} 
                    className={`${
                      isEarned 
                        ? "bg-gradient-to-br from-gold/20 to-yellow-900/20 border-gold/50" 
                        : "bg-gray-900 border-gray-800 opacity-60"
                    } transition-all hover:scale-105`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className={`${isEarned ? "text-gold" : "text-gray-400"} flex items-center gap-2`}>
                            {achievement.icon ? (
                              <span className="text-2xl">{achievement.icon}</span>
                            ) : (
                              <Star className="w-5 h-5" />
                            )}
                            {achievement.name}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {achievement.description || "Badge spécial"}
                          </CardDescription>
                        </div>
                        {isEarned && (
                          <Badge className="bg-gold text-black">
                            Débloqué
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Trophy className="w-4 h-4 text-gold" />
                          <span className="text-gold font-semibold">{achievement.points} points</span>
                        </div>
                        {isEarned && earnedDate && (
                          <p className="text-xs text-gray-500">
                            {new Date(earnedDate).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                      {achievement.category && (
                        <Badge variant="outline" className="mt-3 border-gray-700 text-gray-400">
                          {achievement.category}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Motivation Section */}
        <Card className="bg-gradient-to-r from-gold/10 to-transparent border-gold/30">
          <CardContent className="py-8">
            <div className="flex items-center gap-4">
              <div className="bg-gold/20 p-4 rounded-full">
                <TrendingUp className="w-8 h-8 text-gold" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gold mb-1">Continuez comme ça !</h3>
                <p className="text-gray-400">
                  Chaque séance complétée vous rapproche de vos objectifs et débloque de nouveaux badges.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
