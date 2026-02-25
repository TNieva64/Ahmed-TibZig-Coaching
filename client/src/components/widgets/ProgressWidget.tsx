/**
 * ProgressWidget
 *
 * Affiche la progression récente du client
 * avec graphiques et indicateurs clés
 */

import { useState, useEffect } from 'react';
import { TrendingUp, Trophy, Target, Activity } from 'lucide-react';

interface ProgressMetric {
  id: string;
  type: 'weight' | 'bodyFat' | 'performance' | 'energy';
  value: string;
  unit: string;
  date: string;
  change?: string; // "+2.5 kg", "-1%", etc.
}

interface ProgressGoal {
  id: string;
  type: string;
  targetValue: string;
  currentValue: string;
  progress: number; // Percentage
}

interface ProgressWidgetProps {
  className?: string;
}

export default function ProgressWidget({ className = '' }: ProgressWidgetProps) {
  const [recentMetrics, setRecentMetrics] = useState<ProgressMetric[]>([]);
  const [goals, setGoals] = useState<ProgressGoal[]>([]);

  // TODO: Récupérer les vraies données via tRPC
  useEffect(() => {
    // Mock data
    const mockMetrics: ProgressMetric[] = [
      {
        id: '1',
        type: 'weight',
        value: '78.5',
        unit: 'kg',
        date: new Date().toISOString(),
        change: '-1.2 kg',
      },
      {
        id: '2',
        type: 'performance',
        value: '12',
        unit: 'reps',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        change: '+3 reps',
      },
    ];

    const mockGoals: ProgressGoal[] = [
      {
        id: '1',
        type: 'Poids cible',
        targetValue: '75 kg',
        currentValue: '78.5 kg',
        progress: 70,
      },
      {
        id: '2',
        type: 'Objectif performance',
        targetValue: '15 reps',
        currentValue: '12 reps',
        progress: 80,
      },
    ];

    setRecentMetrics(mockMetrics);
    setGoals(mockGoals);
  }, []);

  const typeIcons: Record<string, any> = {
    weight: Activity,
    bodyFat: TrendingUp,
    performance: Trophy,
    energy: Target,
  };

  const typeColors: Record<string, string> = {
    weight: 'text-blue-600',
    bodyFat: 'text-green-600',
    performance: 'text-purple-600',
    energy: 'text-orange-600',
  };

  return (
    <div className={`bg-white rounded-xl border-2 border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-black text-lg">Progression Récente</h3>
        <a
          href="/dashboard/progress"
          className="text-gold hover:text-black text-sm font-semibold"
        >
          Voir tout →
        </a>
      </div>

      {/* Recent Metrics */}
      {recentMetrics.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-3">Derniers enregistrements</h4>
          <div className="space-y-3">
            {recentMetrics.map((metric) => {
              const Icon = typeIcons[metric.type] || Activity;
              return (
                <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[metric.type]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-black">
                        {metric.value} {metric.unit}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(metric.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  {metric.change && (
                    <span className={`text-sm font-semibold ${
                      metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Goals Progress */}
      {goals.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-3">Objectifs en cours</h4>
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-black">{goal.type}</span>
                  <span className="text-gray-600">
                    {goal.currentValue} / {goal.targetValue}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold to-gold/80 transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recentMetrics.length === 0 && goals.length === 0 && (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Aucune progression enregistrée</p>
          <a
            href="/dashboard/progress"
            className="inline-block bg-gold hover:bg-gold/90 text-black font-semibold py-2 px-4 rounded-lg"
          >
            Enregistrer ma première mesure
          </a>
        </div>
      )}

      {/* Add New Button */}
      {recentMetrics.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <a
            href="/dashboard/progress"
            className="block w-full text-center border-2 border-gold text-gold hover:bg-gold hover:text-black font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            + Ajouter une mesure
          </a>
        </div>
      )}
    </div>
  );
}
