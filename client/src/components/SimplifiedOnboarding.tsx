/**
 * Composant Client - Onboarding Simplifié
 *
 * Version simplifiée de l'onboarding pour réduire l'abandon
 * Se concentre sur l'essentiel : 5 questions clés
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

interface OnboardingData {
  // Question 1 : Objectif principal
  primaryGoal: string;
  
  // Question 2 : Niveau actuel
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  
  // Question 3 : Disponibilité hebdomadaire
  weeklyAvailability: number;
  
  // Question 4 : Limitations ou handicaps
  hasLimitations: boolean;
  limitations?: string;
  
  // Question 5 : Consentement RGPD
  acceptPrivacyPolicy: boolean;
}

export default function SimplifiedOnboarding() {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [, navigate] = useLocation();
  const submitMutation = trpc.simplifiedOnboarding.submitSimplified.useMutation({
    onSuccess: () => {
      toast.success("🎉 Bienvenue ! Votre parcours commence maintenant.");
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
  const [data, setData] = useState<OnboardingData>({
    primaryGoal: '',
    currentLevel: 'beginner',
    weeklyAvailability: 3,
    hasLimitations: false,
    limitations: '',
    acceptPrivacyPolicy: false,
  });

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.primaryGoal.length > 0;
      case 2:
        return true; // currentLevel a toujours une valeur par défaut ('beginner')
      case 3:
        return data.weeklyAvailability >= 1 && data.weeklyAvailability <= 7;
      case 4:
        return !data.hasLimitations || (data.hasLimitations && data.limitations !== undefined && data.limitations.length > 0);
      case 5:
        return data.acceptPrivacyPolicy;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    submitMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black pt-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">
              Étape {step} sur {totalSteps}
            </span>
            <span className="text-sm text-gray-400">
              {Math.round((step / totalSteps) * 100)}% complété
            </span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Card principale */}
        <Card className="bg-zinc-900 border-zinc-800 p-8">
          {step === 1 && (
            <Step1 primaryGoal={data.primaryGoal} onChange={(v) => updateData('primaryGoal', v)} />
          )}
          
          {step === 2 && (
            <Step2 currentLevel={data.currentLevel} onChange={(v) => updateData('currentLevel', v)} />
          )}
          
          {step === 3 && (
            <Step3 
              weeklyAvailability={data.weeklyAvailability} 
              onChange={(v) => updateData('weeklyAvailability', v)} 
            />
          )}
          
          {step === 4 && (
            <Step4 
              hasLimitations={data.hasLimitations}
              limitations={data.limitations}
              onHasLimitationsChange={(v) => updateData('hasLimitations', v)}
              onLimitationsChange={(v) => updateData('limitations', v)}
            />
          )}
          
          {step === 5 && (
            <Step5 
              acceptPrivacyPolicy={data.acceptPrivacyPolicy}
              onChange={(v) => updateData('acceptPrivacyPolicy', v)}
            />
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-zinc-800">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 1}
              className="text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Précédent
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || submitMutation.isPending}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                {submitMutation.isPending ? 'Enregistrement...' : 'Commencer mon coaching 🎉'}
              </Button>
            )}
          </div>
        </Card>

        {/* Message d'encouragement */}
        <div className="mt-6 text-center text-sm text-gray-400">
          {step === 1 && "💪 Commençons par votre objectif principal"}
          {step === 2 && "📊 Ensuite, votre niveau actuel"}
          {step === 3 && "📅 Combien de temps par semaine ?"}
          {step === 4 && "🤗 Y a-t-il des limitations à prendre en compte ?"}
          {step === 5 && "✅ Dernière étape : vos droits"}
        </div>
      </div>
    </div>
  );
}

// Steps components
function Step1({ primaryGoal, onChange }: { primaryGoal: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Quel est votre objectif principal ? 🎯
        </h2>
        <p className="text-gray-400">
          Soyez précis pour qu'on puisse créer le programme parfait pour vous.
        </p>
      </div>

      <div className="space-y-3">
        {[
          { value: 'lose_weight', label: 'Perdre du poids', emoji: '⚖️' },
          { value: 'gain_muscle', label: 'Prendre du muscle', emoji: '💪' },
          { value: 'improve_endurance', label: 'Améliorer mon endurance', emoji: '🏃' },
          { value: 'stay_healthy', label: 'Rester en bonne santé', emoji: '💚' },
          { value: 'prepare_event', label: 'Préparer un événement', emoji: '🏅' },
          { value: 'recover_injury', label: 'Récupérer d\'une blessure', emoji: '🏥' },
        ].map(option => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              primaryGoal === option.value
                ? 'border-yellow-500 bg-yellow-500/10'
                : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{option.emoji}</span>
              <span className="text-white font-medium">{option.label}</span>
              {primaryGoal === option.value && (
                <CheckCircle2 className="w-5 h-5 text-yellow-500 ml-auto" />
              )}
            </div>
          </button>
        ))}

        <Input
          type="text"
          placeholder="Autre (précisez)..."
          value={primaryGoal.includes('other_') ? primaryGoal.replace('other_', '') : ''}
          onChange={(e) => onChange('other_' + e.target.value)}
          className="mt-4 bg-zinc-800 border-zinc-700 text-white"
        />
      </div>
    </div>
  );
}

function Step2({ currentLevel, onChange }: { currentLevel: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Quel est votre niveau actuel ? 📊
        </h2>
        <p className="text-gray-400">
          Pas de jugement, c'est pour adapter le programme à votre rythme.
        </p>
      </div>

      <div className="space-y-3">
        {[
          { value: 'beginner', label: 'Débutant', desc: 'Je débute ou je reprends après une longue pause', emoji: '🌱' },
          { value: 'intermediate', label: 'Intermédiaire', desc: 'Je pratique régulièrement depuis quelques mois', emoji: '🌿' },
          { value: 'advanced', label: 'Avancé', desc: 'Je suis un pratiquant assidu', emoji: '🌳' },
        ].map(option => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              currentLevel === option.value
                ? 'border-yellow-500 bg-yellow-500/10'
                : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{option.emoji}</span>
              <div className="flex-1">
                <div className="text-white font-medium">{option.label}</div>
                <div className="text-sm text-gray-400 mt-1">{option.desc}</div>
              </div>
              {currentLevel === option.value && (
                <CheckCircle2 className="w-5 h-5 text-yellow-500" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step3({ weeklyAvailability, onChange }: { weeklyAvailability: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Combien de jours par semaine ? 📅
        </h2>
        <p className="text-gray-400">
          Soyez réaliste. Mieux vaut 3 jours réguliers que 7 jours irréalistes.
        </p>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map(days => (
          <button
            key={days}
            onClick={() => onChange(days)}
            className={`p-4 rounded-lg border-2 transition-all ${
              weeklyAvailability === days
                ? 'border-yellow-500 bg-yellow-500/20'
                : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{days}</div>
              <div className="text-xs text-gray-400">
                {days === 1 ? 'jour' : 'jours'}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="text-center text-sm text-gray-400">
        {weeklyAvailability === 1 && "C'est un début, on ajustera ensuite"}
        {weeklyAvailability === 2 && "2 jours, c'est déjà bien !"}
        {weeklyAvailability === 3 && "3 jours, l'idéal pour commencer"}
        {weeklyAvailability >= 4 && "Wow, vous êtes motivé !"}
      </div>
    </div>
  );
}

function Step4({ 
  hasLimitations, 
  limitations, 
  onHasLimitationsChange, 
  onLimitationsChange 
}: { 
  hasLimitations: boolean; 
  limitations?: string; 
  onHasLimitationsChange: (v: boolean) => void; 
  onLimitationsChange: (v: string) => void; 
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Avez-vous des limitations ? 🤗
        </h2>
        <p className="text-gray-400">
          Blessures, handicaps, allergies... On adapte tout à votre situation.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-zinc-800 rounded-lg">
          <Checkbox
            id="has-limitations"
            checked={hasLimitations}
            onCheckedChange={onHasLimitationsChange}
          />
          <label 
            htmlFor="has-limitations" 
            className="text-white cursor-pointer flex-1"
          >
            J'ai des limitations ou des besoins particuliers
          </label>
        </div>

        {hasLimitations && (
          <Textarea
            placeholder="Décrivez vos limitations (blessures, handicaps, allergies, etc.)..."
            value={limitations}
            onChange={(e) => onLimitationsChange(e.target.value)}
            rows={4}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        )}

        {hasLimitations && (
          <div className="text-sm text-gray-400 p-4 bg-zinc-800 rounded-lg">
            💚 <strong>Information importante :</strong> Ces informations nous permettent
            d'adapter votre programme. Tout reste confidentiel entre vous et le coach.
          </div>
        )}
      </div>
    </div>
  );
}

function Step5({ acceptPrivacyPolicy, onChange }: { acceptPrivacyPolicy: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Vos droits ✅
        </h2>
        <p className="text-gray-400">
          Dernière étape : on s'assure que tout est clair.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-zinc-800 rounded-lg">
          <Checkbox
            id="privacy"
            checked={acceptPrivacyPolicy}
            onCheckedChange={onChange}
          />
          <label htmlFor="privacy" className="text-sm text-gray-300 cursor-pointer">
            J'ai lu et j'accepte la{' '}
            <a href="/politique-confidentialite" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:underline">
              Politique de Confidentialité
            </a>
            {' '}et les{' '}
            <a href="/cgu" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:underline">
              Conditions Générales
            </a>
          </label>
        </div>

        <div className="text-sm text-gray-400 space-y-2 p-4 bg-zinc-800 rounded-lg">
          <p>✅ Vos données restent confidentielles</p>
          <p>✅ Vous pouvez les supprimer à tout moment</p>
          <p>✅ Pas de cession à des tiers</p>
          <p>✅ Hébergement sécurisé en France</p>
        </div>
      </div>
    </div>
  );
}
