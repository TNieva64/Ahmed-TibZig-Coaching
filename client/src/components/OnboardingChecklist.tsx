import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Trophy, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function OnboardingChecklist() {
  const [, setLocation] = useLocation();
  const { data: progress, isLoading, refetch } = trpc.onboarding.getProgress.useQuery();

  const completeStepMutation = trpc.onboarding.completeStep.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-gold/20 p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      </Card>
    );
  }

  if (!progress || progress.isComplete) {
    return null; // Don't show if onboarding is complete
  }

  const handleStepClick = (stepId: string) => {
    // Navigate to appropriate page based on step
    const navigationMap: Record<string, string> = {
      questionnaire_completed: '/onboarding',
      measurements_added: '/nutrition',
      goals_set: '/onboarding',
      video_watched: '/dashboard', // Will add video modal later
      first_session_booked: '/workouts',
    };

    const route = navigationMap[stepId];
    if (route) {
      setLocation(route);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-gold/30 p-6 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gold mb-1 flex items-center gap-2">
            {progress.isComplete ? (
              <>
                <Trophy className="h-5 w-5" />
                Profil Complet !
              </>
            ) : (
              'Complétez votre profil'
            )}
          </h3>
          <p className="text-sm text-gray-400">
            {progress.isComplete
              ? 'Félicitations ! Vous êtes prêt à commencer votre transformation.'
              : 'Quelques étapes pour personnaliser votre expérience'}
          </p>
        </div>
        <Badge className="bg-gold/20 text-gold border-gold/30">
          {progress.completedCount}/{progress.totalSteps}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">Progression</span>
          <span className="text-gold font-semibold">{progress.percentage}%</span>
        </div>
        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold to-yellow-500 transition-all duration-500 ease-out"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {progress.steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
              step.completed
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-zinc-800/50 border border-zinc-700/50 hover:border-gold/30 cursor-pointer'
            }`}
            onClick={() => !step.completed && handleStepClick(step.id)}
          >
            <div className="flex-shrink-0 mt-0.5">
              {step.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-500">
                  Étape {index + 1}
                </span>
                {step.completed && (
                  <Badge className="bg-green-500/20 text-green-500 text-xs">
                    Terminé
                  </Badge>
                )}
              </div>
              <h4
                className={`text-sm font-semibold mb-1 ${
                  step.completed ? 'text-green-500' : 'text-white'
                }`}
              >
                {step.label}
              </h4>
              <p className="text-xs text-gray-400">{step.description}</p>
              {step.completedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Complété le {new Date(step.completedAt).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Complete Profile Badge */}
      {progress.percentage === 100 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-gold/20 to-yellow-500/20 border border-gold/30 rounded-lg text-center">
          <Trophy className="h-8 w-8 text-gold mx-auto mb-2" />
          <h4 className="text-lg font-bold text-gold mb-1">Profil Complet !</h4>
          <p className="text-sm text-gray-300">
            Vous êtes maintenant prêt à commencer votre transformation avec Ahmed.
          </p>
        </div>
      )}
    </Card>
  );
}
