import { useAuth } from "../_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, LogOut, FileText, Play, Trophy, Brain, BarChart3, Share2, Bell, ChefHat, ListChecks, Video } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import { MilestonesWidget } from "@/components/Milestones";
import { LoyaltyWidget } from "@/components/LoyaltyProgram";

export default function Dashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const { data: programs, isLoading: programsLoading } = trpc.dashboard.getPrograms.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/");
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b border-gold/30 sticky top-0 z-40">
        <div className="container h-20 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Mon Espace</h1>
            <p className="text-sm text-gray-400">Bienvenue, {user?.name} 👋</p>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              onClick={() => navigate("/progress")}
              className="bg-gold text-black hover:bg-gold/90"
            >
              Mon Suivi
            </Button>
            <Button
              onClick={() => navigate("/messages")}
              variant="outline"
              className="border-gold/30 text-gold hover:bg-gold/10"
            >
              Messages
            </Button>
            <Button
              onClick={logout}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-6xl mx-auto">
          {/* Profile Card */}
          <Card className="p-6 mb-8 bg-zinc-900 border-gold/30">
            <div className="flex gap-6 mb-6">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gold mb-4">Bienvenue dans votre espace ! 👋</h2>
                <p className="text-gray-400 mb-4">
                  Tout est prêt pour vous accompagner vers vos objectifs. Voici votre point de départ.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <p className="text-sm text-gray-500">Nom</p>
                    <p className="text-lg font-medium text-white">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-lg font-medium text-white">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Loyalty Widget */}
              <div className="w-64 flex-shrink-0">
                <LoyaltyWidget currentMonths={2} />
              </div>
            </div>
          </Card>

          {/* Milestones Widget */}
          <div className="mb-8">
            <MilestonesWidget />
          </div>

          {/* Quick Access */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gold mb-4">Accès Rapides</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card
                onClick={() => navigate("/badges")}
                className="p-4 border-gold/20 hover:border-gold/60 cursor-pointer transition-all bg-zinc-900 hover:bg-gold/5"
              >
                <div className="flex flex-col items-center text-center">
                  <Trophy className="w-8 h-8 text-gold mb-2" />
                  <span className="text-sm font-medium text-white">Badges</span>
                </div>
              </Card>

              <Card
                onClick={() => navigate("/recipes")}
                className="p-4 border-gold/20 hover:border-gold/60 cursor-pointer transition-all bg-zinc-900 hover:bg-gold/5"
              >
                <div className="flex flex-col items-center text-center">
                  <ChefHat className="w-8 h-8 text-gold mb-2" />
                  <span className="text-sm font-medium text-white">Recettes</span>
                </div>
              </Card>

              <Card
                onClick={() => navigate("/ai-insights")}
                className="p-4 border-gold/20 hover:border-gold/60 cursor-pointer transition-all bg-zinc-900 hover:bg-gold/5"
              >
                <div className="flex flex-col items-center text-center">
                  <Brain className="w-8 h-8 text-gold mb-2" />
                  <span className="text-sm font-medium text-white">IA Coach</span>
                </div>
              </Card>

              <Card
                onClick={() => navigate("/reports")}
                className="p-4 border-gold/20 hover:border-gold/60 cursor-pointer transition-all bg-zinc-900 hover:bg-gold/5"
              >
                <div className="flex flex-col items-center text-center">
                  <BarChart3 className="w-8 h-8 text-gold mb-2" />
                  <span className="text-sm font-medium text-white">Rapports</span>
                </div>
              </Card>

              <Card
                onClick={() => navigate("/referral")}
                className="p-4 border-gold/20 hover:border-gold/60 cursor-pointer transition-all bg-zinc-900 hover:bg-gold/5"
              >
                <div className="flex flex-col items-center text-center">
                  <Share2 className="w-8 h-8 text-gold mb-2" />
                  <span className="text-sm font-medium text-white">Parrainage</span>
                </div>
              </Card>

              <Card
                onClick={() => navigate("/video-analysis")}
                className="p-4 border-gold/20 hover:border-gold/60 cursor-pointer transition-all bg-zinc-900 hover:bg-gold/5"
              >
                <div className="flex flex-col items-center text-center">
                  <Video className="w-8 h-8 text-gold mb-2" />
                  <span className="text-sm font-medium text-white">Analyse</span>
                </div>
              </Card>

              <Card
                onClick={() => navigate("/playlists")}
                className="p-4 border-gold/20 hover:border-gold/60 cursor-pointer transition-all bg-zinc-900 hover:bg-gold/5"
              >
                <div className="flex flex-col items-center text-center">
                  <ListChecks className="w-8 h-8 text-gold mb-2" />
                  <span className="text-sm font-medium text-white">Playlists</span>
                </div>
              </Card>

              <Card
                onClick={() => navigate("/notifications")}
                className="p-4 border-gold/20 hover:border-gold/60 cursor-pointer transition-all bg-zinc-900 hover:bg-gold/5"
              >
                <div className="flex flex-col items-center text-center">
                  <Bell className="w-8 h-8 text-gold mb-2" />
                  <span className="text-sm font-medium text-white">Réglages</span>
                </div>
              </Card>
            </div>
          </div>

          {/* Programs Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Mes Programmes</h2>

            {programsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            ) : programs && programs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {programs.map((program) => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
                </div>

                {/* Upsell Section */}
                <Card className="mt-8 p-6 bg-gradient-to-r from-gold/20 to-orange-500/20 border-gold/40">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        🎯 Maximisez vos résultats
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Ajoutez un appel coaching personnalisé ou prolongez votre programme
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => navigate("/reservation")}
                        className="bg-gold text-black hover:bg-gold/90"
                      >
                        Réserver appel (79€)
                      </Button>
                      <Button
                        onClick={() => navigate("/coaching")}
                        variant="outline"
                        className="border-gold text-gold hover:bg-gold/10"
                      >
                        Prolonger
                      </Button>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-8 text-center border-gold/30 bg-zinc-900">
                <p className="text-gray-400 mb-4">Vous n'avez pas encore de programme assigné.</p>
                <p className="text-sm text-gray-500">
                  Contactez Ahmed pour commencer votre parcours de coaching.
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ProgramCard({ program }: { program: any }) {
  const { data: resources, isLoading } = trpc.programs.list.useQuery(undefined, {
    enabled: false,
  });

  return (
    <Card className="p-6 border-gold/30 hover:border-gold/60 transition-colors bg-zinc-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">{program.programId}</h3>
        <p className="text-sm text-gray-400">
          Statut: <span className="font-medium text-gold capitalize">{program.status}</span>
        </p>
        <p className="text-sm text-gray-400">
          Début: {new Date(program.startDate).toLocaleDateString("fr-FR")}
        </p>
        {program.endDate && (
          <p className="text-sm text-gray-400">
            Fin: {new Date(program.endDate).toLocaleDateString("fr-FR")}
          </p>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <FileText className="w-4 h-4 text-gold" />
          <span>Plans d'entraînement personnalisés</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <FileText className="w-4 h-4 text-gold" />
          <span>Guides nutritionnels</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Play className="w-4 h-4 text-gold" />
          <span>Vidéos de coaching</span>
        </div>
      </div>

      <Button className="w-full bg-gold text-black hover:bg-gold/90">
        Accéder aux ressources
      </Button>
    </Card>
  );
}
