import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Activity,
  Apple,
  Flame,
  Clock,
  Star,
  Target,
  Calendar,
  Download,
  Eye,
} from "lucide-react";

const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export default function Reports() {
  const { data: reports, refetch } = trpc.reports.getUserReports.useQuery();
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const markAsReadMutation = trpc.reports.markReportAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    if (report.isRead === 0) {
      markAsReadMutation.mutate({ reportId: report.id });
    }
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gold mb-2 flex items-center">
            <FileText className="w-10 h-10 mr-3" />
            Mes Rapports Mensuels
          </h1>
          <p className="text-gray-400">Suivez votre évolution mois après mois</p>
        </div>

        {!selectedReport ? (
          // Liste des rapports
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports && reports.length > 0 ? (
              reports.map((report) => (
                <Card
                  key={report.id}
                  className={`bg-gray-900 border-gold cursor-pointer hover:border-gold/80 transition-all ${
                    report.isRead === 0 ? "ring-2 ring-gold/50" : ""
                  }`}
                  onClick={() => handleViewReport(report)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-gold text-xl">
                        {monthNames[report.month - 1]} {report.year}
                      </CardTitle>
                      {report.isRead === 0 && (
                        <Badge className="bg-gold text-black">Nouveau</Badge>
                      )}
                    </div>
                    <CardDescription className="text-gray-400">
                      Généré le {new Date(report.generatedAt).toLocaleDateString("fr-FR")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center">
                          <Activity className="w-4 h-4 mr-2" />
                          Séances
                        </span>
                        <span className="text-white font-semibold">{report.totalWorkouts}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center">
                          <Flame className="w-4 h-4 mr-2" />
                          Calories
                        </span>
                        <span className="text-white font-semibold">{report.totalCaloriesBurned}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center">
                          <Target className="w-4 h-4 mr-2" />
                          Score
                        </span>
                        <span className="text-gold font-semibold">
                          {report.overallScore || "N/A"}/100
                        </span>
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-gold text-black hover:bg-gold/90">
                      <Eye className="w-4 h-4 mr-2" />
                      Voir le rapport
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-gray-900 border-gray-700 col-span-full">
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Aucun rapport disponible</p>
                  <p className="text-gray-500 text-sm">
                    Vos rapports mensuels apparaîtront ici automatiquement
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          // Détail du rapport
          <div>
            <Button
              onClick={() => setSelectedReport(null)}
              variant="outline"
              className="mb-6 text-gold border-gold hover:bg-gold/10"
            >
              ← Retour aux rapports
            </Button>

            <Card className="bg-gray-900 border-gold mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gold text-3xl mb-2">
                      Rapport - {monthNames[selectedReport.month - 1]} {selectedReport.year}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Généré le {new Date(selectedReport.generatedAt).toLocaleDateString("fr-FR")}
                    </CardDescription>
                  </div>
                  {selectedReport.pdfUrl && (
                    <Button className="bg-gold text-black hover:bg-gold/90">
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger PDF
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Score Global */}
            {selectedReport.overallScore && (
              <Card className="bg-gray-900 border-gold mb-6">
                <CardHeader>
                  <CardTitle className="text-gold flex items-center">
                    <Target className="w-6 h-6 mr-2" />
                    Score de Santé Global
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-4">
                    <div className="text-6xl font-bold text-gold">
                      {selectedReport.overallScore}
                      <span className="text-3xl text-gray-400">/100</span>
                    </div>
                  </div>
                  <Progress value={selectedReport.overallScore} className="h-3" />
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Statistiques d'entraînement */}
              <Card className="bg-gray-900 border-gold">
                <CardHeader>
                  <CardTitle className="text-gold flex items-center">
                    <Activity className="w-6 h-6 mr-2" />
                    Entraînement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Séances complétées</span>
                    <span className="text-2xl font-bold text-white">{selectedReport.totalWorkouts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Temps total
                    </span>
                    <span className="text-xl font-semibold text-white">
                      {Math.floor(selectedReport.totalDuration / 60)}h {selectedReport.totalDuration % 60}min
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center">
                      <Flame className="w-4 h-4 mr-2" />
                      Calories brûlées
                    </span>
                    <span className="text-xl font-semibold text-orange-400">
                      {selectedReport.totalCaloriesBurned}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center">
                      <Star className="w-4 h-4 mr-2" />
                      Note moyenne
                    </span>
                    <span className="text-xl font-semibold text-yellow-400">
                      {selectedReport.averageRating}/5
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <span className="text-gray-400">Série actuelle</span>
                    <span className="text-xl font-bold text-gold">
                      {selectedReport.currentStreak} jours 🔥
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Progression du poids */}
              {selectedReport.weightStart && selectedReport.weightEnd && (
                <Card className="bg-gray-900 border-gold">
                  <CardHeader>
                    <CardTitle className="text-gold flex items-center">
                      <TrendingUp className="w-6 h-6 mr-2" />
                      Progression
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Poids début</span>
                      <span className="text-xl font-semibold text-white">
                        {selectedReport.weightStart} kg
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Poids fin</span>
                      <span className="text-xl font-semibold text-white">
                        {selectedReport.weightEnd} kg
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                      <span className="text-gray-400">Évolution</span>
                      <span
                        className={`text-2xl font-bold flex items-center ${
                          parseFloat(selectedReport.weightChange) < 0
                            ? "text-green-400"
                            : "text-orange-400"
                        }`}
                      >
                        {parseFloat(selectedReport.weightChange) < 0 ? (
                          <TrendingDown className="w-6 h-6 mr-2" />
                        ) : (
                          <TrendingUp className="w-6 h-6 mr-2" />
                        )}
                        {Math.abs(parseFloat(selectedReport.weightChange))} kg
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Nutrition */}
              {selectedReport.nutritionCompliance !== null && (
                <Card className="bg-gray-900 border-gold">
                  <CardHeader>
                    <CardTitle className="text-gold flex items-center">
                      <Apple className="w-6 h-6 mr-2" />
                      Nutrition
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Conformité</span>
                        <span className="text-xl font-semibold text-white">
                          {selectedReport.nutritionCompliance}%
                        </span>
                      </div>
                      <Progress value={selectedReport.nutritionCompliance} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Calories moyennes/jour</span>
                      <span className="text-xl font-semibold text-white">
                        {selectedReport.averageCalories}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Commentaire du coach */}
            {selectedReport.coachComment && (
              <Card className="bg-gray-900 border-gold mb-6">
                <CardHeader>
                  <CardTitle className="text-gold">💬 Commentaire du Coach</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white text-lg leading-relaxed">{selectedReport.coachComment}</p>
                </CardContent>
              </Card>
            )}

            {/* Recommandations */}
            {selectedReport.coachRecommendations && (
              <Card className="bg-gray-900 border-gold">
                <CardHeader>
                  <CardTitle className="text-gold">🎯 Recommandations pour le mois prochain</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {JSON.parse(selectedReport.coachRecommendations).map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-gold mr-3 text-xl">•</span>
                        <span className="text-white text-lg">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
