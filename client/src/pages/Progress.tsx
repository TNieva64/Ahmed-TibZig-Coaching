import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Minus, Plus, Download, Calendar, Target } from "lucide-react";
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { toast } from "sonner";

export default function Progress() {
  const { user, loading, isAuthenticated } = useAuth();
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<"weight" | "bodyFat" | "performance" | "energy">("weight");
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "quarter" | "year" | "all">("month");
  const [metricType, setMetricType] = useState<"weight" | "bodyFat" | "performance" | "energy">("weight");
  const [metricValue, setMetricValue] = useState("");
  const [metricNotes, setMetricNotes] = useState("");
  const chartRef = useRef<HTMLDivElement>(null);

  // Assuming user has a default client program (you may need to fetch this)
  const defaultClientProgramId = 1;

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading, refetch: refetchStats } = trpc.progress.getDashboardStats.useQuery(
    { clientProgramId: defaultClientProgramId },
    { enabled: isAuthenticated }
  );

  // Fetch metric stats for selected metric and period
  const { data: metricStats, isLoading: metricStatsLoading } = trpc.progress.getMetricStats.useQuery(
    {
      clientProgramId: defaultClientProgramId,
      metricType: selectedMetric,
      period: selectedPeriod,
    },
    { enabled: isAuthenticated }
  );

  // Add metric mutation
  const addMetricMutation = trpc.progress.addMetric.useMutation({
    onSuccess: () => {
      toast.success("Mesure enregistrée avec succès !");
      setShowAddMetric(false);
      setMetricValue("");
      setMetricNotes("");
      refetchStats();
    },
    onError: (error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });

  const handleAddMetric = () => {
    if (!metricValue) {
      toast.error("Veuillez entrer une valeur");
      return;
    }

    addMetricMutation.mutate({
      clientProgramId: defaultClientProgramId,
      metricType,
      value: parseFloat(metricValue),
      recordedAt: new Date(),
      unit: metricType === "weight" ? "kg" : metricType === "bodyFat" ? "%" : "/10",
      notes: metricNotes,
    });
  };

  const exportChart = () => {
    if (!chartRef.current) return;

    // Use html2canvas or similar library to export
    toast.success("Fonctionnalité d'export bientôt disponible !");
  };

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getTrendIcon = (trend: string | null | undefined) => {
    if (!trend) return <Minus className="h-4 w-4" />;
    if (trend === "up") return <TrendingUp className="h-4 w-4" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = (trend: string | null | undefined, metricType: string) => {
    if (!trend || trend === "stable") return "text-gray-400";
    // For weight and bodyFat, down is good; for performance and energy, up is good
    if (metricType === "weight" || metricType === "bodyFat") {
      return trend === "down" ? "text-green-500" : "text-red-500";
    } else {
      return trend === "up" ? "text-green-500" : "text-red-500";
    }
  };

  const metricLabels = {
    weight: { name: "Poids", unit: "kg", icon: "⚖️" },
    bodyFat: { name: "Masse grasse", unit: "%", icon: "📊" },
    performance: { name: "Performance", unit: "/10", icon: "💪" },
    energy: { name: "Énergie", unit: "/10", icon: "⚡" },
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-gold mb-2">Suivi de Progression</h1>
            <p className="text-gray-400">Analysez vos performances et atteignez vos objectifs</p>
          </div>
          <Button
            onClick={() => setShowAddMetric(!showAddMetric)}
            className="bg-gold text-black hover:bg-gold/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une mesure
          </Button>
        </div>

        {/* Add Metric Form */}
        {showAddMetric && (
          <Card className="bg-zinc-900 border-gold/20 p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Enregistrer une nouvelle mesure</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type de mesure</label>
                <select
                  value={metricType}
                  onChange={(e) => setMetricType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-gold"
                >
                  <option value="weight">Poids (kg)</option>
                  <option value="bodyFat">Masse grasse (%)</option>
                  <option value="performance">Performance (1-10)</option>
                  <option value="energy">Énergie (1-10)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Valeur</label>
                <input
                  type="number"
                  step="0.1"
                  value={metricValue}
                  onChange={(e) => setMetricValue(e.target.value)}
                  placeholder="Entrez la valeur"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-gold"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes (optionnel)</label>
                <textarea
                  value={metricNotes}
                  onChange={(e) => setMetricNotes(e.target.value)}
                  placeholder="Ajoutez des notes sur cette mesure..."
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-gold"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button
                  onClick={handleAddMetric}
                  disabled={addMetricMutation.isPending}
                  className="bg-gold text-black hover:bg-gold/90"
                >
                  {addMetricMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Enregistrer
                </Button>
                <Button onClick={() => setShowAddMetric(false)} variant="outline" className="border-zinc-700 text-white">
                  Annuler
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Dashboard KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats && (
            <>
              <Card className="bg-zinc-900 border-gold/20 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{metricLabels.weight.icon}</span>
                  {dashboardStats.weight.change && (
                    <Badge className={`${getTrendColor(dashboardStats.weight.change.trend, "weight")} bg-transparent`}>
                      {getTrendIcon(dashboardStats.weight.change.trend)}
                      {Math.abs(dashboardStats.weight.change.percent)}%
                    </Badge>
                  )}
                </div>
                <h3 className="text-sm text-gray-400 mb-1">{metricLabels.weight.name}</h3>
                <p className="text-3xl font-bold text-white">
                  {dashboardStats.weight.current ? `${dashboardStats.weight.current} ${metricLabels.weight.unit}` : "—"}
                </p>
                {dashboardStats.weight.change && (
                  <p className="text-xs text-gray-500 mt-1">
                    {dashboardStats.weight.change.value > 0 ? "+" : ""}
                    {dashboardStats.weight.change.value} {metricLabels.weight.unit}
                  </p>
                )}
              </Card>

              <Card className="bg-zinc-900 border-gold/20 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{metricLabels.bodyFat.icon}</span>
                  {dashboardStats.bodyFat.change && (
                    <Badge className={`${getTrendColor(dashboardStats.bodyFat.change.trend, "bodyFat")} bg-transparent`}>
                      {getTrendIcon(dashboardStats.bodyFat.change.trend)}
                      {Math.abs(dashboardStats.bodyFat.change.percent)}%
                    </Badge>
                  )}
                </div>
                <h3 className="text-sm text-gray-400 mb-1">{metricLabels.bodyFat.name}</h3>
                <p className="text-3xl font-bold text-white">
                  {dashboardStats.bodyFat.current ? `${dashboardStats.bodyFat.current} ${metricLabels.bodyFat.unit}` : "—"}
                </p>
                {dashboardStats.bodyFat.change && (
                  <p className="text-xs text-gray-500 mt-1">
                    {dashboardStats.bodyFat.change.value > 0 ? "+" : ""}
                    {dashboardStats.bodyFat.change.value} {metricLabels.bodyFat.unit}
                  </p>
                )}
              </Card>

              <Card className="bg-zinc-900 border-gold/20 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{metricLabels.performance.icon}</span>
                  {dashboardStats.performance.change && (
                    <Badge className={`${getTrendColor(dashboardStats.performance.change.trend, "performance")} bg-transparent`}>
                      {getTrendIcon(dashboardStats.performance.change.trend)}
                      {Math.abs(dashboardStats.performance.change.percent)}%
                    </Badge>
                  )}
                </div>
                <h3 className="text-sm text-gray-400 mb-1">{metricLabels.performance.name}</h3>
                <p className="text-3xl font-bold text-white">
                  {dashboardStats.performance.current ? `${dashboardStats.performance.current} ${metricLabels.performance.unit}` : "—"}
                </p>
                {dashboardStats.performance.change && (
                  <p className="text-xs text-gray-500 mt-1">
                    {dashboardStats.performance.change.value > 0 ? "+" : ""}
                    {dashboardStats.performance.change.value} {metricLabels.performance.unit}
                  </p>
                )}
              </Card>

              <Card className="bg-zinc-900 border-gold/20 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{metricLabels.energy.icon}</span>
                  {dashboardStats.energy.change && (
                    <Badge className={`${getTrendColor(dashboardStats.energy.change.trend, "energy")} bg-transparent`}>
                      {getTrendIcon(dashboardStats.energy.change.trend)}
                      {Math.abs(dashboardStats.energy.change.percent)}%
                    </Badge>
                  )}
                </div>
                <h3 className="text-sm text-gray-400 mb-1">{metricLabels.energy.name}</h3>
                <p className="text-3xl font-bold text-white">
                  {dashboardStats.energy.current ? `${dashboardStats.energy.current} ${metricLabels.energy.unit}` : "—"}
                </p>
                {dashboardStats.energy.change && (
                  <p className="text-xs text-gray-500 mt-1">
                    {dashboardStats.energy.change.value > 0 ? "+" : ""}
                    {dashboardStats.energy.change.value} {metricLabels.energy.unit}
                  </p>
                )}
              </Card>
            </>
          )}
        </div>

        {/* Chart Controls */}
        <Card className="bg-zinc-900 border-gold/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gold mb-1">Graphique d'évolution</h2>
              <p className="text-sm text-gray-400">Visualisez vos progrès dans le temps</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={exportChart}
                variant="outline"
                className="border-gold/20 text-gold hover:bg-gold/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter PNG
              </Button>
            </div>
          </div>

          {/* Metric Selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(Object.keys(metricLabels) as Array<keyof typeof metricLabels>).map((metric) => (
              <Button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                variant={selectedMetric === metric ? "default" : "outline"}
                className={
                  selectedMetric === metric
                    ? "bg-gold text-black hover:bg-gold/90"
                    : "border-zinc-700 text-white hover:bg-zinc-800"
                }
              >
                <span className="mr-2">{metricLabels[metric].icon}</span>
                {metricLabels[metric].name}
              </Button>
            ))}
          </div>

          {/* Period Selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { value: "week", label: "7 jours" },
              { value: "month", label: "30 jours" },
              { value: "quarter", label: "3 mois" },
              { value: "year", label: "1 an" },
              { value: "all", label: "Tout" },
            ].map((period) => (
              <Button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value as any)}
                variant={selectedPeriod === period.value ? "default" : "outline"}
                size="sm"
                className={
                  selectedPeriod === period.value
                    ? "bg-gold/20 text-gold border-gold/40"
                    : "border-zinc-700 text-gray-400 hover:bg-zinc-800"
                }
              >
                <Calendar className="h-3 w-3 mr-1" />
                {period.label}
              </Button>
            ))}
          </div>

          {/* Chart */}
          <div ref={chartRef}>
            {metricStatsLoading ? (
              <div className="h-80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
              </div>
            ) : metricStats && metricStats.data && metricStats.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={metricStats.data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="date"
                    stroke="#888"
                    tickFormatter={(value) => new Date(value).toLocaleDateString("fr-FR", { month: "short", day: "numeric" })}
                  />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #333", borderRadius: "8px" }}
                    labelStyle={{ color: "#D4AF37" }}
                    itemStyle={{ color: "#fff" }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString("fr-FR")}
                    formatter={(value: any) => [`${value} ${metricLabels[selectedMetric].unit}`, metricLabels[selectedMetric].name]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#D4AF37"
                    strokeWidth={3}
                    fill="url(#colorValue)"
                    dot={{ fill: "#D4AF37", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-gray-500">
                <Target className="h-12 w-12 mb-4 opacity-50" />
                <p>Aucune donnée disponible pour cette période</p>
                <p className="text-sm mt-2">Commencez à enregistrer vos mesures pour voir vos progrès</p>
              </div>
            )}
          </div>

          {/* Statistics Summary */}
          {metricStats && metricStats.count > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-zinc-800">
              <div>
                <p className="text-xs text-gray-500 mb-1">Mesures</p>
                <p className="text-lg font-semibold text-white">{metricStats.count}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Moyenne</p>
                <p className="text-lg font-semibold text-white">
                  {metricStats.average} {metricLabels[selectedMetric].unit}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Minimum</p>
                <p className="text-lg font-semibold text-green-500">
                  {metricStats.min} {metricLabels[selectedMetric].unit}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Maximum</p>
                <p className="text-lg font-semibold text-red-500">
                  {metricStats.max} {metricLabels[selectedMetric].unit}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Évolution</p>
                <p className={`text-lg font-semibold ${getTrendColor(metricStats.trend, selectedMetric)}`}>
                  {metricStats.change !== null && metricStats.change > 0 ? "+" : ""}
                  {metricStats.change !== null ? metricStats.change : "—"} {metricStats.change !== null ? metricLabels[selectedMetric].unit : ""}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Activity Summary */}
        {dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-zinc-900 border-gold/20 p-6">
              <h3 className="text-xl font-bold text-gold mb-4">Entraînement (30 derniers jours)</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Séances complétées</span>
                  <span className="text-2xl font-bold text-white">{dashboardStats.workouts.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Note moyenne</span>
                  <span className="text-2xl font-bold text-white">
                    {dashboardStats.workouts.avgRating.toFixed(1)}/10
                  </span>
                </div>
              </div>
            </Card>

            <Card className="bg-zinc-900 border-gold/20 p-6">
              <h3 className="text-xl font-bold text-gold mb-4">Nutrition (7 derniers jours)</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Jours enregistrés</span>
                  <span className="text-2xl font-bold text-white">{dashboardStats.nutrition.daysLogged}/7</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Calories moyennes</span>
                  <span className="text-2xl font-bold text-white">
                    {Math.round(dashboardStats.nutrition.avgCalories)} kcal
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
