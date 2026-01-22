import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast as showToast } from 'sonner';
import { Check, X, Edit2, User, TrendingUp, TrendingDown, Calendar, AlertCircle } from 'lucide-react';

export default function MacroAdjustments() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedValues, setEditedValues] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const { data: proposals, isLoading, refetch } = trpc.macroAdjustment.listPending.useQuery();
  const validateMutation = trpc.macroAdjustment.validate.useMutation();
  const rejectMutation = trpc.macroAdjustment.reject.useMutation();

  const handleEdit = (proposal: any) => {
    setEditingId(proposal.id);
    setEditedValues({
      calories: proposal.proposedCalories,
      protein: proposal.proposedProtein,
      carbs: proposal.proposedCarbs,
      fat: proposal.proposedFat,
    });
  };

  const handleValidate = async (proposalId: number, modified: boolean) => {
    try {
      await validateMutation.mutateAsync({
        proposalId,
        modifiedValues: modified ? editedValues : undefined,
      });
      showToast.success('✅ Ajustement validé', {
        description: 'Les nouvelles macros ont été envoyées au client',
      });
      setEditingId(null);
      refetch();
    } catch (error) {
      showToast.error('❌ Erreur', {
        description: 'Impossible de valider l\'ajustement',
      });
    }
  };

  const handleReject = async (proposalId: number) => {
    const reason = prompt('Raison du refus (optionnel) :');
    try {
      await rejectMutation.mutateAsync({
        proposalId,
        reason: reason || undefined,
      });
      showToast.success('❌ Ajustement refusé', {
        description: 'La proposition a été rejetée',
      });
      refetch();
    } catch (error) {
      showToast.error('❌ Erreur', {
        description: 'Impossible de refuser l\'ajustement',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">⚙️ Ajustements de Macros</h1>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">⚙️ Ajustements de Macros</h1>
          <p className="text-gray-400">
            Validez ou modifiez les ajustements automatiques détectés par le système
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">En attente</p>
                <p className="text-3xl font-bold text-yellow-500">{proposals?.length || 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Validés cette semaine</p>
                <p className="text-3xl font-bold text-green-500">0</p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Refusés cette semaine</p>
                <p className="text-3xl font-bold text-red-500">0</p>
              </div>
              <X className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>

        {/* Proposals List */}
        {!proposals || proposals.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
            <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Aucun ajustement en attente</h3>
            <p className="text-gray-400">
              Le système détecte automatiquement les ajustements nécessaires chaque lundi.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal: any) => (
              <Card key={proposal.id} className="bg-zinc-900 border-zinc-800 p-6">
                {/* Client Info */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-zinc-800">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{proposal.user.name}</h3>
                      <p className="text-gray-400 text-sm">{proposal.user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm flex items-center gap-2 justify-end">
                      <Calendar className="w-4 h-4" />
                      {new Date(proposal.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {/* Reason */}
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-500 font-semibold mb-1">📊 Raison de l'ajustement :</p>
                  <p className="text-white">{proposal.reason}</p>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span className="text-gray-400">
                      Poids : {proposal.currentWeight} kg → {proposal.proposedWeight} kg
                    </span>
                    <span className="text-gray-400">
                      ({parseFloat(proposal.weightChange) > 0 ? '+' : ''}{proposal.weightChange} kg en {proposal.weeksElapsed} semaines)
                    </span>
                  </div>
                </div>

                {/* Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Current Macros */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-gray-400">Macros Actuelles</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
                        <span className="text-gray-300">Calories</span>
                        <span className="font-bold">{proposal.currentCalories || 'Non défini'} kcal</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
                        <span className="text-gray-300">Protéines</span>
                        <span className="font-bold">{proposal.currentProtein || 'Non défini'} g</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
                        <span className="text-gray-300">Glucides</span>
                        <span className="font-bold">{proposal.currentCarbs || 'Non défini'} g</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
                        <span className="text-gray-300">Lipides</span>
                        <span className="font-bold">{proposal.currentFat || 'Non défini'} g</span>
                      </div>
                    </div>
                  </div>

                  {/* Proposed Macros */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-yellow-500 flex items-center gap-2">
                      {parseFloat(proposal.weightChange) > 0 ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                      Macros Proposées
                    </h4>
                    {editingId === proposal.id ? (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="calories">Calories (kcal)</Label>
                          <Input
                            id="calories"
                            type="number"
                            value={editedValues.calories}
                            onChange={(e) => setEditedValues({ ...editedValues, calories: parseInt(e.target.value) })}
                            className="bg-zinc-800 border-zinc-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="protein">Protéines (g)</Label>
                          <Input
                            id="protein"
                            type="number"
                            value={editedValues.protein}
                            onChange={(e) => setEditedValues({ ...editedValues, protein: parseInt(e.target.value) })}
                            className="bg-zinc-800 border-zinc-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="carbs">Glucides (g)</Label>
                          <Input
                            id="carbs"
                            type="number"
                            value={editedValues.carbs}
                            onChange={(e) => setEditedValues({ ...editedValues, carbs: parseInt(e.target.value) })}
                            className="bg-zinc-800 border-zinc-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fat">Lipides (g)</Label>
                          <Input
                            id="fat"
                            type="number"
                            value={editedValues.fat}
                            onChange={(e) => setEditedValues({ ...editedValues, fat: parseInt(e.target.value) })}
                            className="bg-zinc-800 border-zinc-700"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <span className="text-gray-300">Calories</span>
                          <span className="font-bold text-yellow-500">{proposal.proposedCalories} kcal</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <span className="text-gray-300">Protéines</span>
                          <span className="font-bold text-yellow-500">{proposal.proposedProtein} g</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <span className="text-gray-300">Glucides</span>
                          <span className="font-bold text-yellow-500">{proposal.proposedCarbs} g</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <span className="text-gray-300">Lipides</span>
                          <span className="font-bold text-yellow-500">{proposal.proposedFat} g</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {editingId === proposal.id ? (
                    <>
                      <Button
                        onClick={() => handleValidate(proposal.id, true)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={validateMutation.isPending}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Valider avec modifications
                      </Button>
                      <Button
                        onClick={() => setEditingId(null)}
                        variant="outline"
                        className="border-zinc-700"
                      >
                        Annuler
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleValidate(proposal.id, false)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={validateMutation.isPending}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Valider tel quel
                      </Button>
                      <Button
                        onClick={() => handleEdit(proposal)}
                        variant="outline"
                        className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                      <Button
                        onClick={() => handleReject(proposal.id)}
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500/10"
                        disabled={rejectMutation.isPending}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Refuser
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Help Section */}
        <Card className="bg-zinc-900 border-zinc-800 p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">ℹ️ Comment ça marche ?</h3>
          <div className="space-y-2 text-gray-400 text-sm">
            <p>• Le système analyse automatiquement les données de progression de chaque client chaque lundi</p>
            <p>• Si un ajustement est nécessaire (perte/gain trop rapide, plateau, etc.), une proposition est créée</p>
            <p>• Vous pouvez valider les macros proposées, les modifier, ou refuser l'ajustement</p>
            <p>• Une fois validé, le client reçoit automatiquement ses nouvelles macros par email et dans son dashboard</p>
            <p>• Les ajustements sont basés sur des formules scientifiques (BMR Mifflin-St Jeor, TDEE, distribution optimale)</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
