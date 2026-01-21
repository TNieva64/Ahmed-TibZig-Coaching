import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Trophy,
  Activity,
  Apple,
  Moon,
  Target,
  Zap,
  RefreshCw,
} from "lucide-react";

const priorityColors = {
  low: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  medium: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  high: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  critical: "text-red-400 border-red-400/30 bg-red-400/10",
};

const insightIcons: Record<string, any> = {
  trend_analysis: TrendingUp,
  prediction: Target,
  alert: AlertTriangle,
  recommendation: Lightbulb,
  milestone: Trophy,
};

const categoryIcons: Record<string, any> = {
  workout: Activity,
  nutrition: Apple,
  recovery: Moon,
  progress: TrendingUp,
  health: Zap,
};

export default function AIInsights() {
  const [isCalculating, setIsCalculating] = useState(false);

  const { data: insights, refetch: refetchInsights } = trpc.aiInsights.getInsights.useQuery({
    limit: 20,
    unreadOnly: false,
  });

  const { data: healthScore, refetch: refetchHealthScore } = trpc.aiInsights.getCurrentHealthScore.useQuery();
  const { data: predictions, refetch: refetchPredictions } = trpc.aiInsights.getProgressPredictions.useQuery();

  const calculateHealthScoreMutation = trpc.aiInsights.calculateHealthScore.useMutation({
    onSuccess: () => {
      toast.success("Score de santé calculé !");
      refetchHealthScore();
      refetchInsights();
    },
  });

  const calculatePredictionsMutation = trpc.aiInsights.calculatePredictions.useMutation({
    onSuccess: () => {
      toast.success("Prédictions générées !");
      refetchPredictions();
      refetchInsights();
    },
  });

  const generateAlertsMutation = trpc.aiInsights.generateAlerts.useMutation({
    onSuccess: () => {
      toast.success("Alertes générées !");
      refetchInsights();
    },
  });

  const markAsReadMutation = trpc.aiInsights.markInsightAsRead.useMutation({
    onSuccess: () => {
      refetchInsights();
    },
  });

  const handleCalculateAll = async () => {
    setIsCalculating(true);
    try {
      await calculateHealthScoreMutation.mutateAsync();
      await calculatePredictionsMutation.mutateAsync();
      await generateAlertsMutation.mutateAsync();
      toast.success("Analyse complète terminée !");
    } catch (error) {
      toast.error("Erreur lors de l'analyse");
    } finally {
      setIsCalculating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Bon";
    if (score >= 40) return "Moyen";
    return "À améliorer";
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gold mb-2 flex items-center">
              <Brain className="w-10 h-10 mr-3" />
              Dashboard IA
            </h1>
            <p className="text-gray-400">Insights intelligents et analyse de votre progression</p>
          </div>
          <Button
            onClick={handleCalculateAll}
            disabled={isCalculating}
            className="bg-gold text-black hover:bg-gold/90"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${isCalculating ? "animate-spin" : ""}`} />
            {isCalculating ? "Analyse en cours..." : "Analyser"}
          </Button>
        </div>

        {/* Health Score */}
        {healthScore && (
          <Card className="bg-gray-900 border-gold mb-8">
            <CardHeader>
              <CardTitle className="text-gold flex items-center">
                <Zap className="w-6 h-6 mr-2" />
                Score de Santé Global
              </CardTitle>
              <CardDescription className="text-gray-400">
                Calculé le {new Date(healthScore.calculatedAt).toLocaleDateString("fr-FR")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Overall Score */}
                <div className="md:col-span-1 flex flex-col items-center justify-center">
                  <div className={`text-6xl font-bold ${getScoreColor(healthScore.overallScore)}`}>
                    {healthScore.overallScore}
                  </div>
                  <div className="text-gray-400 text-sm mt-2">{getScoreLabel(healthScore.overallScore)}</div>
                </div>

                {/* Individual Scores */}
                <div className="md:col-span-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white flex items-center">
                        <Activity className="w-4 h-4 mr-2" />
                        Entraînement
                      </span>
                      <span className={`font-bold ${getScoreColor(healthScore.workoutScore)}`}>
                        {healthScore.workoutScore}
                      </span>
                    </div>
                    <Progress value={healthScore.workoutScore} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white flex items-center">
                        <Apple className="w-4 h-4 mr-2" />
                        Nutrition
                      </span>
                      <span className={`font-bold ${getScoreColor(healthScore.nutritionScore)}`}>
                        {healthScore.nutritionScore}
                      </span>
                    </div>
                    <Progress value={healthScore.nutritionScore} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white flex items-center">
                        <Moon className="w-4 h-4 mr-2" />
                        Récupération
                      </span>
                      <span className={`font-bold ${getScoreColor(healthScore.recoveryScore)}`}>
                        {healthScore.recoveryScore}
                      </span>
                    </div>
                    <Progress value={healthScore.recoveryScore} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Régularité
                      </span>
                      <span className={`font-bold ${getScoreColor(healthScore.consistencyScore)}`}>
                        {healthScore.consistencyScore}
                      </span>
                    </div>
                    <Progress value={healthScore.consistencyScore} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Predictions */}
        {predictions && predictions.length > 0 && (
          <Card className="bg-gray-900 border-gold mb-8">
            <CardHeader>
              <CardTitle className="text-gold flex items-center">
                <Target className="w-6 h-6 mr-2" />
                Prédictions de Progression
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {predictions.map((prediction) => {
                const trendColors: Record<string, string> = {
                  improving: "text-green-400",
                  stable: "text-yellow-400",
                  declining: "text-red-400",
                };

                const trendLabels: Record<string, string> = {
                  improving: "En progression",
                  stable: "Stable",
                  declining: "En baisse",
                };

                return (
                  <div key={prediction.id} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <TrendingUp className={`w-5 h-5 mr-2 ${trendColors[prediction.currentTrend]}`} />
                        <span className="text-white font-semibold">
                          {trendLabels[prediction.currentTrend]}
                        </span>
                      </div>
                      <span className="text-gray-400 text-sm">
                        Confiance: {prediction.confidenceLevel}%
                      </span>
                    </div>
                    <p className="text-gray-300 mb-2">
                      Date prédite: {new Date(prediction.predictedDate).toLocaleDateString("fr-FR")}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Taux de changement: {prediction.weeklyChangeRate}/semaine
                    </p>
                    {prediction.recommendedActions && (
                      <div className="mt-3 space-y-1">
                        {JSON.parse(prediction.recommendedActions).map((action: string, idx: number) => (
                          <div key={idx} className="flex items-start">
                            <Lightbulb className="w-4 h-4 mr-2 text-gold mt-0.5" />
                            <span className="text-sm text-gray-300">{action}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Insights */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gold mb-4">Insights Récents</h2>
          {insights && insights.length > 0 ? (
            insights.map((insight) => {
              const InsightIcon = insightIcons[insight.insightType] || Brain;
              const CategoryIcon = categoryIcons[insight.category] || Activity;

              return (
                <Card
                  key={insight.id}
                  className={`bg-gray-900 border ${priorityColors[insight.priority]} ${
                    insight.isRead === 0 ? "opacity-100" : "opacity-60"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          <InsightIcon className={`w-8 h-8 ${priorityColors[insight.priority].split(" ")[0]}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <CategoryIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-400 uppercase">{insight.category}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-400">
                              {new Date(insight.createdAt).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                          <h3 className="text-white font-semibold text-lg mb-2">{insight.title}</h3>
                          <p className="text-gray-300">{insight.message}</p>
                        </div>
                      </div>
                      {insight.isRead === 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsReadMutation.mutate({ insightId: insight.id })}
                          className="text-gold hover:text-gold/80"
                        >
                          Marquer comme lu
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-12 text-center">
                <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Aucun insight disponible pour le moment</p>
                <Button
                  onClick={handleCalculateAll}
                  disabled={isCalculating}
                  className="bg-gold text-black hover:bg-gold/90"
                >
                  Générer des insights
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
