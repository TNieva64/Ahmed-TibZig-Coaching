import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

const STEPS = [
  { id: 1, title: "Objectifs", description: "Définissez vos objectifs de coaching" },
  { id: 2, title: "Historique Sportif", description: "Parlez-nous de votre parcours" },
  { id: 3, title: "Contraintes", description: "Informations de santé et disponibilités" },
  { id: 4, title: "Motivation", description: "Ce qui vous motive à réussir" },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Objectifs
    primaryGoal: "",
    specificGoals: [] as string[],
    targetWeight: "",
    targetDate: "",
    // Step 2: Historique Sportif
    currentActivityLevel: "",
    sportsHistory: "",
    previousInjuries: "",
    // Step 3: Contraintes
    healthConditions: "",
    medications: "",
    dietaryRestrictions: "",
    availableEquipment: [] as string[],
    weeklyAvailability: "",
    preferredWorkoutTime: "",
    // Step 4: Motivation
    motivationLevel: "5",
    motivationFactors: [] as string[],
    obstacles: "",
  });

  const submitMutation = trpc.onboarding.submitResponse.useMutation({
    onSuccess: () => {
      toast.success("Onboarding complété avec succès !");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setFormData((prev) => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    submitMutation.mutate({
      primaryGoal: formData.primaryGoal,
      specificGoals: JSON.stringify(formData.specificGoals),
      targetWeight: formData.targetWeight ? parseInt(formData.targetWeight) : undefined,
      targetDate: formData.targetDate ? new Date(formData.targetDate) : undefined,
      currentActivityLevel: formData.currentActivityLevel,
      sportsHistory: formData.sportsHistory || undefined,
      previousInjuries: formData.previousInjuries || undefined,
      healthConditions: formData.healthConditions || undefined,
      medications: formData.medications || undefined,
      dietaryRestrictions: formData.dietaryRestrictions || undefined,
      availableEquipment: JSON.stringify(formData.availableEquipment),
      weeklyAvailability: parseInt(formData.weeklyAvailability),
      preferredWorkoutTime: formData.preferredWorkoutTime,
      motivationLevel: parseInt(formData.motivationLevel),
      motivationFactors: JSON.stringify(formData.motivationFactors),
      obstacles: formData.obstacles || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="container max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {STEPS.map((step) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    currentStep >= step.id
                      ? "bg-gold text-black"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <span className="text-xs mt-2 text-gray-400">{step.title}</span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold transition-all duration-300"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <Card className="bg-gray-900 border-gold">
          <CardHeader>
            <CardTitle className="text-gold text-2xl">
              {STEPS[currentStep - 1]?.title}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {STEPS[currentStep - 1]?.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Objectifs */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="primaryGoal" className="text-white">
                    Objectif Principal *
                  </Label>
                  <Select
                    value={formData.primaryGoal}
                    onValueChange={(value) => handleInputChange("primaryGoal", value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Sélectionnez votre objectif" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight_loss">Perte de poids</SelectItem>
                      <SelectItem value="muscle_gain">Prise de masse</SelectItem>
                      <SelectItem value="performance">Performance sportive</SelectItem>
                      <SelectItem value="health">Santé générale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Objectifs Spécifiques</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Marathon", "Triathlon", "Hyrox", "Ironman", "Trail", "Autre"].map((goal) => (
                      <Button
                        key={goal}
                        type="button"
                        variant={formData.specificGoals.includes(goal) ? "default" : "outline"}
                        onClick={() => handleArrayToggle("specificGoals", goal)}
                        className={formData.specificGoals.includes(goal) ? "bg-gold text-black" : ""}
                      >
                        {goal}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetWeight" className="text-white">
                      Poids Cible (kg)
                    </Label>
                    <Input
                      id="targetWeight"
                      type="number"
                      value={formData.targetWeight}
                      onChange={(e) => handleInputChange("targetWeight", e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetDate" className="text-white">
                      Date Cible
                    </Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => handleInputChange("targetDate", e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Historique Sportif */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="currentActivityLevel" className="text-white">
                    Niveau d'Activité Actuel *
                  </Label>
                  <Select
                    value={formData.currentActivityLevel}
                    onValueChange={(value) => handleInputChange("currentActivityLevel", value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Sélectionnez votre niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sédentaire (peu ou pas d'exercice)</SelectItem>
                      <SelectItem value="light">Léger (1-3 jours/semaine)</SelectItem>
                      <SelectItem value="moderate">Modéré (3-5 jours/semaine)</SelectItem>
                      <SelectItem value="active">Actif (6-7 jours/semaine)</SelectItem>
                      <SelectItem value="very_active">Très actif (2x par jour)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sportsHistory" className="text-white">
                    Historique Sportif
                  </Label>
                  <Textarea
                    id="sportsHistory"
                    value={formData.sportsHistory}
                    onChange={(e) => handleInputChange("sportsHistory", e.target.value)}
                    placeholder="Décrivez votre parcours sportif, vos expériences passées..."
                    className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousInjuries" className="text-white">
                    Blessures Antérieures
                  </Label>
                  <Textarea
                    id="previousInjuries"
                    value={formData.previousInjuries}
                    onChange={(e) => handleInputChange("previousInjuries", e.target.value)}
                    placeholder="Mentionnez toute blessure passée ou problème physique..."
                    className="bg-gray-800 border-gray-700 text-white min-h-[80px]"
                  />
                </div>
              </>
            )}

            {/* Step 3: Contraintes */}
            {currentStep === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="healthConditions" className="text-white">
                    Conditions de Santé
                  </Label>
                  <Textarea
                    id="healthConditions"
                    value={formData.healthConditions}
                    onChange={(e) => handleInputChange("healthConditions", e.target.value)}
                    placeholder="Diabète, hypertension, asthme, handicap..."
                    className="bg-gray-800 border-gray-700 text-white min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medications" className="text-white">
                    Médicaments
                  </Label>
                  <Input
                    id="medications"
                    value={formData.medications}
                    onChange={(e) => handleInputChange("medications", e.target.value)}
                    placeholder="Médicaments actuels..."
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dietaryRestrictions" className="text-white">
                    Restrictions Alimentaires
                  </Label>
                  <Input
                    id="dietaryRestrictions"
                    value={formData.dietaryRestrictions}
                    onChange={(e) => handleInputChange("dietaryRestrictions", e.target.value)}
                    placeholder="Végétarien, allergies, intolérances..."
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Équipement Disponible</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Haltères", "Barre", "Vélo", "Tapis de course", "Piscine", "Aucun"].map((equip) => (
                      <Button
                        key={equip}
                        type="button"
                        variant={formData.availableEquipment.includes(equip) ? "default" : "outline"}
                        onClick={() => handleArrayToggle("availableEquipment", equip)}
                        className={formData.availableEquipment.includes(equip) ? "bg-gold text-black" : ""}
                      >
                        {equip}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weeklyAvailability" className="text-white">
                      Disponibilité (h/semaine) *
                    </Label>
                    <Input
                      id="weeklyAvailability"
                      type="number"
                      value={formData.weeklyAvailability}
                      onChange={(e) => handleInputChange("weeklyAvailability", e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredWorkoutTime" className="text-white">
                      Moment Préféré *
                    </Label>
                    <Select
                      value={formData.preferredWorkoutTime}
                      onValueChange={(value) => handleInputChange("preferredWorkoutTime", value)}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Matin</SelectItem>
                        <SelectItem value="afternoon">Après-midi</SelectItem>
                        <SelectItem value="evening">Soir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Motivation */}
            {currentStep === 4 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="motivationLevel" className="text-white">
                    Niveau de Motivation (1-10) : {formData.motivationLevel}
                  </Label>
                  <input
                    id="motivationLevel"
                    type="range"
                    min="1"
                    max="10"
                    value={formData.motivationLevel}
                    onChange={(e) => handleInputChange("motivationLevel", e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Facteurs de Motivation</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Santé", "Esthétique", "Performance", "Bien-être", "Défi", "Autre"].map((factor) => (
                      <Button
                        key={factor}
                        type="button"
                        variant={formData.motivationFactors.includes(factor) ? "default" : "outline"}
                        onClick={() => handleArrayToggle("motivationFactors", factor)}
                        className={formData.motivationFactors.includes(factor) ? "bg-gold text-black" : ""}
                      >
                        {factor}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="obstacles" className="text-white">
                    Obstacles Potentiels
                  </Label>
                  <Textarea
                    id="obstacles"
                    value={formData.obstacles}
                    onChange={(e) => handleInputChange("obstacles", e.target.value)}
                    placeholder="Manque de temps, stress, fatigue, voyages fréquents..."
                    className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                  />
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="border-gold text-gold hover:bg-gold hover:text-black"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-gold text-black hover:bg-gold/90"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="bg-gold text-black hover:bg-gold/90"
                >
                  {submitMutation.isPending ? "Envoi..." : "Terminer"}
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
