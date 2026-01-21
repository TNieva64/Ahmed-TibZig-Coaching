import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, LogOut, FileText, Play, Trophy, Brain, BarChart3, Share2, Bell } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container h-20 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Mon Espace</h1>
            <p className="text-sm text-gray-600">Bienvenue, {user?.name}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate("/progress")}
              className="bg-gold text-black hover:bg-gold/90"
            >
              Mon Suivi
            </Button>
            <Button
              onClick={() => navigate("/badges")}
              className="bg-orange-500 text-white hover:bg-orange-600 flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Badges
            </Button>
            <Button
              onClick={() => navigate("/ai-insights")}
              className="bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              IA
            </Button>
            <Button
              onClick={() => navigate("/reports")}
              className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Rapports
            </Button>
            <Button
              onClick={() => navigate("/referral")}
              className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Parrainage
            </Button>
            <Button
              onClick={() => navigate("/notifications")}
              className="bg-yellow-600 text-white hover:bg-yellow-700 flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Notifications
            </Button>
            <Button
              onClick={logout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <Card className="p-6 mb-8 border-gold/30">
            <h2 className="text-xl font-semibold text-black mb-4">Profil</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nom</p>
                <p className="text-lg font-medium text-black">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-medium text-black">{user?.email}</p>
              </div>
            </div>
          </Card>

          {/* Programs Section */}
          <div>
            <h2 className="text-2xl font-bold text-black mb-6">Mes Programmes</h2>

            {programsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            ) : programs && programs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {programs.map((program) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center border-gold/30">
                <p className="text-gray-600 mb-4">Vous n'avez pas encore de programme assigné.</p>
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
    <Card className="p-6 border-gold/30 hover:border-gold/60 transition-colors">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-black mb-2">{program.programId}</h3>
        <p className="text-sm text-gray-600">
          Statut: <span className="font-medium text-gold capitalize">{program.status}</span>
        </p>
        <p className="text-sm text-gray-600">
          Début: {new Date(program.startDate).toLocaleDateString("fr-FR")}
        </p>
        {program.endDate && (
          <p className="text-sm text-gray-600">
            Fin: {new Date(program.endDate).toLocaleDateString("fr-FR")}
          </p>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <FileText className="w-4 h-4 text-gold" />
          <span>Plans d'entraînement personnalisés</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <FileText className="w-4 h-4 text-gold" />
          <span>Guides nutritionnels</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
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
