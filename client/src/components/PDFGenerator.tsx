/**
 * Générateur de Plans d'Entraînement PDF
 * 
 * Permet à Ahmed de générer des plans professionnels au format PDF
 * avec intégration de playlists YouTube et personnification complète
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Plus, Trash2, Calendar, User, Target } from 'lucide-react';
import { toast } from 'sonner';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

interface Week {
  weekNumber: number;
  focus: string;
  exercises: Exercise[];
}

interface TrainingPlan {
  clientName: string;
  programName: string;
  startDate: string;
  duration: string;
  goal: string;
  weeks: Week[];
  youtubePlaylist?: string;
  notes?: string;
}

export default function PDFGenerator() {
  const [plan, setPlan] = useState<TrainingPlan>({
    clientName: '',
    programName: '',
    startDate: '',
    duration: '4',
    goal: '',
    weeks: [{ weekNumber: 1, focus: '', exercises: [] }],
    notes: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const updatePlan = (field: keyof TrainingPlan, value: any) => {
    setPlan(prev => ({ ...prev, [field]: value }));
  };

  const addWeek = () => {
    const newWeekNumber = plan.weeks.length + 1;
    setPlan(prev => ({
      ...prev,
      weeks: [...prev.weeks, { weekNumber: newWeekNumber, focus: '', exercises: [] }],
    }));
  };

  const removeWeek = (weekNumber: number) => {
    setPlan(prev => ({
      ...prev,
      weeks: prev.weeks.filter(w => w.weekNumber !== weekNumber),
    }));
  };

  const addExercise = (weekNumber: number) => {
    setPlan(prev => ({
      ...prev,
      weeks: prev.weeks.map(week =>
        week.weekNumber === weekNumber
          ? { ...week, exercises: [...week.exercises, { name: '', sets: 3, reps: '10-12', rest: '90s' }] }
          : week
      ),
    }));
  };

  const removeExercise = (weekNumber: number, exerciseIndex: number) => {
    setPlan(prev => ({
      ...prev,
      weeks: prev.weeks.map(week =>
        week.weekNumber === weekNumber
          ? { ...week, exercises: week.exercises.filter((_, i) => i !== exerciseIndex) }
          : week
      ),
    }));
  };

  const updateExercise = (weekNumber: number, exerciseIndex: number, field: keyof Exercise, value: any) => {
    setPlan(prev => ({
      ...prev,
      weeks: prev.weeks.map(week =>
        week.weekNumber === weekNumber
          ? {
              ...week,
              exercises: week.exercises.map((exercise, i) =>
                i === exerciseIndex ? { ...exercise, [field]: value } : exercise
              ),
            }
          : week
      ),
    }));
  };

  const generatePDF = async () => {
    // Validation
    if (!plan.clientName || !plan.programName || !plan.startDate) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (plan.weeks.some(w => w.exercises.length === 0)) {
      toast.error('Chaque semaine doit contenir au moins un exercice');
      return;
    }

    setIsGenerating(true);

    try {
      // Pour l'instant, on génère un fichier texte
      // Dans une vraie implémentation, on utiliserait jsPDF ou react-pdf
      
      let content = `
╔══════════════════════════════════════════════════════════════╗
║           PROGRAMME D'ENTRAÎNEMENT PERSONNALISÉ              ║
║                    ANDALOUSSI COACHING                       ║
╚══════════════════════════════════════════════════════════════╝

Client: ${plan.clientName}
Programme: ${plan.programName}
Objectif: ${plan.goal}
Durée: ${plan.duration} semaines
Début: ${plan.startDate}

Coach: Ahmed Andaloussi
Athlète Paralympique | 5ème aux JO Tokyo 2020

─────────────────────────────────────────────────────────────────

`;

      plan.weeks.forEach(week => {
        content += `
📅 SEMAINE ${week.weekNumber}
${week.focus ? `Focus: ${week.focus}` : ''}

`;
        week.exercises.forEach((exercise, index) => {
          content += `
${index + 1}. ${exercise.name}
   Séries: ${exercise.sets} | Répétitions: ${exercise.reps} | Repos: ${exercise.rest}
   ${exercise.notes ? `Notes: ${exercise.notes}` : ''}

`;
        });
      });

      if (plan.youtubePlaylist) {
        content += `
🎥 PLAYLIST YOUTUBE:
${plan.youtubePlaylist}

`;
      }

      if (plan.notes) {
        content += `
📝 NOTES:
${plan.notes}

`;
      }

      content += `
─────────────────────────────────────────────────────────────────
💪 Bon entraînement !

Pour toute question, contactez-moi directement sur la plateforme.

Ahmed Andaloussi
and@andcoach.fr

© 2026 Andaloussi Coaching - Tous droits réservés
`;

      // Créer et télécharger le fichier
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Programme_${plan.clientName.replace(/\s+/g, '_')}_${plan.programName.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('✅ Plan généré avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la génération du PDF');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="p-6 mb-6 bg-zinc-900 border-gold/30">
        <h1 className="text-2xl font-bold text-white mb-2">📋 Générateur de Plans d'Entraînement</h1>
        <p className="text-gray-400">
          Créez des plans professionnels PDF pour vos clients en quelques clics
        </p>
      </Card>

      {/* Informations générales */}
      <Card className="p-6 mb-6 bg-zinc-900 border-gold/30">
        <h2 className="text-xl font-semibold text-gold mb-4">Informations du Programme</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clientName" className="text-white">Nom du Client *</Label>
            <Input
              id="clientName"
              value={plan.clientName}
              onChange={(e) => updatePlan('clientName', e.target.value)}
              placeholder="Jean Dupont"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div>
            <Label htmlFor="programName" className="text-white">Nom du Programme *</Label>
            <Input
              id="programName"
              value={plan.programName}
              onChange={(e) => updatePlan('programName', e.target.value)}
              placeholder="Transformation 8 semaines"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div>
            <Label htmlFor="startDate" className="text-white">Date de Début *</Label>
            <Input
              id="startDate"
              type="date"
              value={plan.startDate}
              onChange={(e) => updatePlan('startDate', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div>
            <Label htmlFor="duration" className="text-white">Durée (semaines)</Label>
            <Select value={plan.duration} onValueChange={(v) => updatePlan('duration', v)}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 semaines</SelectItem>
                <SelectItem value="8">8 semaines</SelectItem>
                <SelectItem value="12">12 semaines</SelectItem>
                <SelectItem value="16">16 semaines</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="goal" className="text-white">Objectif Principal</Label>
            <Input
              id="goal"
              value={plan.goal}
              onChange={(e) => updatePlan('goal', e.target.value)}
              placeholder="Perte de poids, prise de masse, préparation marathon..."
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="youtubePlaylist" className="text-white">Playlist YouTube (optionnel)</Label>
            <Input
              id="youtubePlaylist"
              value={plan.youtubePlaylist || ''}
              onChange={(e) => updatePlan('youtubePlaylist', e.target.value)}
              placeholder="https://youtube.com/playlist?list=..."
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="notes" className="text-white">Notes Additionnelles</Label>
            <Textarea
              id="notes"
              value={plan.notes || ''}
              onChange={(e) => updatePlan('notes', e.target.value)}
              placeholder="Conseils nutritionnels, recommandations, etc."
              rows={3}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
        </div>
      </Card>

      {/* Semaines et exercices */}
      {plan.weeks.map((week) => (
        <Card key={week.weekNumber} className="p-6 mb-6 bg-zinc-900 border-gold/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              📅 Semaine {week.weekNumber}
            </h3>
            <Button
              onClick={() => removeWeek(week.weekNumber)}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="mb-4">
            <Label className="text-white">Focus de la semaine</Label>
            <Input
              value={week.focus}
              onChange={(e) => {
                setPlan(prev => ({
                  ...prev,
                  weeks: prev.weeks.map(w =>
                    w.weekNumber === week.weekNumber ? { ...w, focus: e.target.value } : w
                  ),
                }));
              }}
              placeholder="Ex: Renforcementforcement, Endurance, Mobilité..."
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="space-y-3 mb-4">
            {week.exercises.map((exercise, exerciseIndex) => (
              <div key={exerciseIndex} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-gold font-medium">Exercice {exerciseIndex + 1}</span>
                  <Button
                    onClick={() => removeExercise(week.weekNumber, exerciseIndex)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <Label className="text-white text-sm">Nom de l'exercice</Label>
                    <Input
                      value={exercise.name}
                      onChange={(e) => updateExercise(week.weekNumber, exerciseIndex, 'name', e.target.value)}
                      placeholder="Squats, Développé couché..."
                      className="bg-zinc-700 border-zinc-600 text-white text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-white text-sm">Séries</Label>
                    <Input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(week.weekNumber, exerciseIndex, 'sets', parseInt(e.target.value))}
                      className="bg-zinc-700 border-zinc-600 text-white text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-white text-sm">Répétitions</Label>
                    <Input
                      value={exercise.reps}
                      onChange={(e) => updateExercise(week.weekNumber, exerciseIndex, 'reps', e.target.value)}
                      placeholder="10-12"
                      className="bg-zinc-700 border-zinc-600 text-white text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-white text-sm">Repos</Label>
                    <Input
                      value={exercise.rest}
                      onChange={(e) => updateExercise(week.weekNumber, exerciseIndex, 'rest', e.target.value)}
                      placeholder="90s"
                      className="bg-zinc-700 border-zinc-600 text-white text-sm"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <Label className="text-white text-sm">Notes (optionnel)</Label>
                    <Input
                      value={exercise.notes || ''}
                      onChange={(e) => updateExercise(week.weekNumber, exerciseIndex, 'notes', e.target.value)}
                      placeholder="Consignes particulières..."
                      className="bg-zinc-700 border-zinc-600 text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={() => addExercise(week.weekNumber)}
            variant="outline"
            size="sm"
            className="border-gold text-gold hover:bg-gold/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un exercice
          </Button>
        </Card>
      ))}

      {/* Ajouter une semaine */}
      <Button
        onClick={addWeek}
        variant="outline"
        className="w-full mb-6 border-gold text-gold hover:bg-gold/10"
      >
        <Plus className="w-4 h-4 mr-2" />
        Ajouter une semaine
      </Button>

      {/* Bouton de génération */}
      <Card className="p-6 bg-gradient-to-r from-gold/20 to-orange-500/20 border-gold/40">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Prêt à générer ?</h3>
            <p className="text-gray-400 text-sm">
              {plan.weeks.length} semaine(s) • {plan.weeks.reduce((acc, w) => acc + w.exercises.length, 0)} exercice(s)
            </p>
          </div>
          <Button
            onClick={generatePDF}
            disabled={isGenerating}
            className="bg-gold text-black hover:bg-gold/90"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? 'Génération...' : 'Générer le Plan'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
