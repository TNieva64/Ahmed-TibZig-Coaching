import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Download, Play, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";

export default function ProgramDetail({ params }: { params: { programId: string } }) {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const programId = parseInt(params.programId);

  const { data: clientPrograms, isLoading: programsLoading } = trpc.dashboard.getPrograms.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/");
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (clientPrograms) {
      const program = clientPrograms.find((p) => p.programId === programId);
      setSelectedProgram(program);
    }
  }, [clientPrograms, programId]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!selectedProgram) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="container h-20 flex items-center">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          </div>
        </header>
        <main className="container py-12">
          <Card className="p-8 text-center border-gold/30">
            <p className="text-gray-600">Programme non trouvé.</p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container h-20 flex items-center">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à mes programmes
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Program Info */}
          <Card className="p-6 mb-8 border-gold/30">
            <h1 className="text-3xl font-bold text-black mb-4">Programme #{selectedProgram.programId}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Statut</p>
                <p className="text-lg font-medium text-gold capitalize">{selectedProgram.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date de début</p>
                <p className="text-lg font-medium text-black">
                  {new Date(selectedProgram.startDate).toLocaleDateString("fr-FR")}
                </p>
              </div>
              {selectedProgram.endDate && (
                <div>
                  <p className="text-sm text-gray-600">Date de fin</p>
                  <p className="text-lg font-medium text-black">
                    {new Date(selectedProgram.endDate).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Resources Section */}
          <div>
            <h2 className="text-2xl font-bold text-black mb-6">Ressources du Programme</h2>

            <div className="space-y-6">
              {/* PDFs */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gold" />
                  Documents PDF
                </h3>
                <div className="space-y-3">
                  <Card className="p-4 border-gold/30 hover:border-gold/60 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-black">Plan d'entraînement personnalisé</h4>
                        <p className="text-sm text-gray-600">Votre programme d'entraînement adapté à vos objectifs</p>
                      </div>
                      <Button className="bg-gold text-black hover:bg-gold/90 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Télécharger
                      </Button>
                    </div>
                  </Card>
                  <Card className="p-4 border-gold/30 hover:border-gold/60 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-black">Guide nutritionnel</h4>
                        <p className="text-sm text-gray-600">Recommandations diététiques personnalisées</p>
                      </div>
                      <Button className="bg-gold text-black hover:bg-gold/90 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Télécharger
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Videos */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5 text-gold" />
                  Vidéos de Coaching
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="overflow-hidden border-gold/30 hover:border-gold/60 transition-colors">
                    <div className="aspect-video bg-black flex items-center justify-center">
                      <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Vidéo de coaching"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-black mb-2">Introduction au programme</h4>
                      <p className="text-sm text-gray-600">Découvrez les principes fondamentaux de votre programme</p>
                    </div>
                  </Card>

                  <Card className="overflow-hidden border-gold/30 hover:border-gold/60 transition-colors">
                    <div className="aspect-video bg-black flex items-center justify-center">
                      <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Vidéo de coaching"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-black mb-2">Techniques d'entraînement</h4>
                      <p className="text-sm text-gray-600">Apprenez les bonnes techniques pour maximiser vos résultats</p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FileText({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}
