import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, TrendingUp, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Progress() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [showAddMetric, setShowAddMetric] = useState(false);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  // Données d'exemple pour les graphiques
  const progressData = [
    { date: "01 Jan", weight: 85, energy: 6, performance: 7 },
    { date: "08 Jan", weight: 83.5, energy: 7, performance: 7.5 },
    { date: "15 Jan", weight: 82, energy: 7.5, performance: 8 },
    { date: "22 Jan", weight: 80.5, energy: 8, performance: 8.5 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-black">Mon Suivi de Progression</h1>
          </div>
          <Button
            onClick={() => setShowAddMetric(!showAddMetric)}
            className="bg-gold text-black hover:bg-gold/90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter une mesure
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-6xl mx-auto">
          {/* Add Metric Form */}
          {showAddMetric && (
            <Card className="p-6 mb-8 border-gold/30">
              <h2 className="text-lg font-semibold text-black mb-4">Enregistrer une nouvelle mesure</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Type de mesure</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold">
                    <option>Poids (kg)</option>
                    <option>Taux de graisse corporelle (%)</option>
                    <option>Performance (1-10)</option>
                    <option>Énergie (1-10)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Valeur</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Entrez la valeur"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">Notes (optionnel)</label>
                  <textarea
                    placeholder="Ajoutez des notes sur cette mesure..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button className="bg-gold text-black hover:bg-gold/90">Enregistrer</Button>
                  <Button onClick={() => setShowAddMetric(false)} variant="outline">
                    Annuler
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Goals Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 border-gold/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Objectif Poids</h3>
                <TrendingUp className="w-5 h-5 text-gold" />
              </div>
              <p className="text-3xl font-bold text-black mb-2">80 kg</p>
              <p className="text-sm text-gray-600">Départ: 85 kg | Progression: -5 kg</p>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div className="bg-gold h-2 rounded-full" style={{ width: "62.5%" }}></div>
              </div>
            </Card>

            <Card className="p-6 border-gold/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Performance</h3>
                <TrendingUp className="w-5 h-5 text-gold" />
              </div>
              <p className="text-3xl font-bold text-black mb-2">8.5/10</p>
              <p className="text-sm text-gray-600">Départ: 7 | Progression: +1.5</p>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div className="bg-gold h-2 rounded-full" style={{ width: "85%" }}></div>
              </div>
            </Card>

            <Card className="p-6 border-gold/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Énergie</h3>
                <TrendingUp className="w-5 h-5 text-gold" />
              </div>
              <p className="text-3xl font-bold text-black mb-2">8/10</p>
              <p className="text-sm text-gray-600">Départ: 6 | Progression: +2</p>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div className="bg-gold h-2 rounded-full" style={{ width: "80%" }}></div>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 border-gold/30">
              <h3 className="text-lg font-semibold text-black mb-4">Évolution du Poids</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[75, 90]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="weight" stroke="#FFD700" strokeWidth={2} name="Poids (kg)" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 border-gold/30">
              <h3 className="text-lg font-semibold text-black mb-4">Performance & Énergie</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="performance" stroke="#FFD700" strokeWidth={2} name="Performance" />
                  <Line type="monotone" dataKey="energy" stroke="#9CA3AF" strokeWidth={2} name="Énergie" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* History */}
          <Card className="p-6 border-gold/30">
            <h3 className="text-lg font-semibold text-black mb-4">Historique des Mesures</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <p className="font-medium text-black">Poids: 80.5 kg</p>
                  <p className="text-sm text-gray-600">22 janvier 2026</p>
                </div>
                <p className="text-sm text-gold font-medium">-4.5 kg</p>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <p className="font-medium text-black">Performance: 8.5/10</p>
                  <p className="text-sm text-gray-600">22 janvier 2026</p>
                </div>
                <p className="text-sm text-gold font-medium">+1.5</p>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <p className="font-medium text-black">Poids: 82 kg</p>
                  <p className="text-sm text-gray-600">15 janvier 2026</p>
                </div>
                <p className="text-sm text-gold font-medium">-3 kg</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-black">Poids: 85 kg (Départ)</p>
                  <p className="text-sm text-gray-600">01 janvier 2026</p>
                </div>
                <p className="text-sm text-gray-600 font-medium">Référence</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
