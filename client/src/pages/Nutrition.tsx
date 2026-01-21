import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Calculator, Plus, TrendingUp, Utensils } from "lucide-react";

export default function Nutrition() {
  const [showCalculator, setShowCalculator] = useState(false);
  const [showMealLog, setShowMealLog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Calculator state
  const [calcData, setCalcData] = useState({
    weight: "",
    height: "",
    age: "",
    gender: "male",
    activityLevel: "moderate",
    goal: "maintain",
  });

  const [calculatedMacros, setCalculatedMacros] = useState<any>(null);

  // Meal log state
  const [mealData, setMealData] = useState({
    mealType: "breakfast",
    foodItems: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    notes: "",
  });

  const { data: activePlan } = trpc.nutrition.getActivePlan.useQuery();
  const { data: dailyStats } = trpc.nutrition.getDailyStats.useQuery({
    date: new Date(selectedDate),
  });

  const logMealMutation = trpc.nutrition.logMeal.useMutation({
    onSuccess: () => {
      toast.success("Repas enregistré !");
      setShowMealLog(false);
      setMealData({
        mealType: "breakfast",
        foodItems: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        notes: "",
      });
    },
  });

  const calculateMacros = () => {
    const weight = parseFloat(calcData.weight);
    const height = parseFloat(calcData.height);
    const age = parseFloat(calcData.age);

    // BMR calculation (Mifflin-St Jeor)
    let bmr;
    if (calcData.gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity multiplier
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    let tdee = bmr * activityMultipliers[calcData.activityLevel];

    // Goal adjustment
    if (calcData.goal === "lose") tdee -= 500;
    if (calcData.goal === "gain") tdee += 300;

    // Macro distribution (40/30/30)
    const protein = Math.round((tdee * 0.3) / 4);
    const carbs = Math.round((tdee * 0.4) / 4);
    const fat = Math.round((tdee * 0.3) / 9);

    setCalculatedMacros({
      calories: Math.round(tdee),
      protein,
      carbs,
      fat,
    });
  };

  const handleLogMeal = () => {
    logMealMutation.mutate({
      date: new Date(selectedDate),
      mealType: mealData.mealType as any,
      foodItems: mealData.foodItems,
      calories: parseInt(mealData.calories),
      proteinGrams: parseInt(mealData.protein),
      carbsGrams: parseInt(mealData.carbs),
      fatGrams: parseInt(mealData.fat),
      notes: mealData.notes || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gold mb-2">Nutrition</h1>
          <p className="text-gray-400">Gérez vos plans nutritionnels et suivez votre alimentation</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={() => setShowCalculator(!showCalculator)}
            className="bg-gold text-black hover:bg-gold/90 h-20"
          >
            <Calculator className="w-6 h-6 mr-2" />
            Calculateur de Macros
          </Button>
          <Button
            onClick={() => setShowMealLog(!showMealLog)}
            className="bg-gold text-black hover:bg-gold/90 h-20"
          >
            <Plus className="w-6 h-6 mr-2" />
            Enregistrer un Repas
          </Button>
        </div>

        {/* Calculator */}
        {showCalculator && (
          <Card className="bg-gray-900 border-gold mb-8">
            <CardHeader>
              <CardTitle className="text-gold">Calculateur de Macros</CardTitle>
              <CardDescription className="text-gray-400">
                Calculez vos besoins caloriques et macronutriments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Poids (kg)</Label>
                  <Input
                    type="number"
                    value={calcData.weight}
                    onChange={(e) => setCalcData({ ...calcData, weight: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Taille (cm)</Label>
                  <Input
                    type="number"
                    value={calcData.height}
                    onChange={(e) => setCalcData({ ...calcData, height: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Âge</Label>
                  <Input
                    type="number"
                    value={calcData.age}
                    onChange={(e) => setCalcData({ ...calcData, age: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Sexe</Label>
                  <Select value={calcData.gender} onValueChange={(value) => setCalcData({ ...calcData, gender: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Homme</SelectItem>
                      <SelectItem value="female">Femme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Niveau d'Activité</Label>
                  <Select value={calcData.activityLevel} onValueChange={(value) => setCalcData({ ...calcData, activityLevel: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sédentaire</SelectItem>
                      <SelectItem value="light">Léger</SelectItem>
                      <SelectItem value="moderate">Modéré</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="very_active">Très actif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Objectif</Label>
                  <Select value={calcData.goal} onValueChange={(value) => setCalcData({ ...calcData, goal: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose">Perdre du poids</SelectItem>
                      <SelectItem value="maintain">Maintenir</SelectItem>
                      <SelectItem value="gain">Prendre du poids</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={calculateMacros} className="bg-gold text-black hover:bg-gold/90 w-full">
                Calculer
              </Button>

              {calculatedMacros && (
                <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-700">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Calories</p>
                    <p className="text-2xl font-bold text-gold">{calculatedMacros.calories}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Protéines</p>
                    <p className="text-2xl font-bold text-white">{calculatedMacros.protein}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Glucides</p>
                    <p className="text-2xl font-bold text-white">{calculatedMacros.carbs}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Lipides</p>
                    <p className="text-2xl font-bold text-white">{calculatedMacros.fat}g</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Meal Log Form */}
        {showMealLog && (
          <Card className="bg-gray-900 border-gold mb-8">
            <CardHeader>
              <CardTitle className="text-gold">Enregistrer un Repas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Type de Repas</Label>
                  <Select value={mealData.mealType} onValueChange={(value) => setMealData({ ...mealData, mealType: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Petit-déjeuner</SelectItem>
                      <SelectItem value="lunch">Déjeuner</SelectItem>
                      <SelectItem value="dinner">Dîner</SelectItem>
                      <SelectItem value="snack">Collation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Date</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Aliments</Label>
                <Textarea
                  value={mealData.foodItems}
                  onChange={(e) => setMealData({ ...mealData, foodItems: e.target.value })}
                  placeholder="Ex: 100g poulet, 200g riz, légumes..."
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Calories</Label>
                  <Input
                    type="number"
                    value={mealData.calories}
                    onChange={(e) => setMealData({ ...mealData, calories: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Protéines (g)</Label>
                  <Input
                    type="number"
                    value={mealData.protein}
                    onChange={(e) => setMealData({ ...mealData, protein: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Glucides (g)</Label>
                  <Input
                    type="number"
                    value={mealData.carbs}
                    onChange={(e) => setMealData({ ...mealData, carbs: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Lipides (g)</Label>
                  <Input
                    type="number"
                    value={mealData.fat}
                    onChange={(e) => setMealData({ ...mealData, fat: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Notes</Label>
                <Textarea
                  value={mealData.notes}
                  onChange={(e) => setMealData({ ...mealData, notes: e.target.value })}
                  placeholder="Notes optionnelles..."
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <Button
                onClick={handleLogMeal}
                disabled={logMealMutation.isPending}
                className="bg-gold text-black hover:bg-gold/90 w-full"
              >
                {logMealMutation.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Active Plan */}
        {activePlan && (
          <Card className="bg-gray-900 border-gold mb-8">
            <CardHeader>
              <CardTitle className="text-gold flex items-center">
                <Utensils className="w-6 h-6 mr-2" />
                {activePlan.title}
              </CardTitle>
              <CardDescription className="text-gray-400">{activePlan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Objectif Calories</p>
                  <p className="text-2xl font-bold text-gold">{activePlan.dailyCalories}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Protéines</p>
                  <p className="text-2xl font-bold text-white">{activePlan.proteinGrams}g</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Glucides</p>
                  <p className="text-2xl font-bold text-white">{activePlan.carbsGrams}g</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Lipides</p>
                  <p className="text-2xl font-bold text-white">{activePlan.fatGrams}g</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Stats */}
        {dailyStats && (
          <Card className="bg-gray-900 border-gold">
            <CardHeader>
              <CardTitle className="text-gold flex items-center">
                <TrendingUp className="w-6 h-6 mr-2" />
                Suivi du {new Date(selectedDate).toLocaleDateString("fr-FR")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {activePlan && (
                <>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-white">Calories</span>
                      <span className="text-gold">
                        {dailyStats.totalCalories} / {activePlan.dailyCalories}
                      </span>
                    </div>
                    <Progress
                      value={(dailyStats.totalCalories / activePlan.dailyCalories) * 100}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-white">Protéines</span>
                      <span className="text-gold">
                        {dailyStats.totalProtein}g / {activePlan.proteinGrams}g
                      </span>
                    </div>
                    <Progress
                      value={(dailyStats.totalProtein / activePlan.proteinGrams) * 100}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-white">Glucides</span>
                      <span className="text-gold">
                        {dailyStats.totalCarbs}g / {activePlan.carbsGrams}g
                      </span>
                    </div>
                    <Progress
                      value={(dailyStats.totalCarbs / activePlan.carbsGrams) * 100}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-white">Lipides</span>
                      <span className="text-gold">
                        {dailyStats.totalFat}g / {activePlan.fatGrams}g
                      </span>
                    </div>
                    <Progress
                      value={(dailyStats.totalFat / activePlan.fatGrams) * 100}
                      className="h-2"
                    />
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm">
                  {dailyStats.mealCount} repas enregistré{dailyStats.mealCount > 1 ? "s" : ""}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
