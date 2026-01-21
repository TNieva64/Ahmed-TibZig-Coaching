import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Search, Heart, Clock, Users, Flame, ChefHat, ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Recipe {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: "breakfast" | "lunch" | "dinner" | "snack" | "dessert";
  difficulty: "easy" | "medium" | "hard";
  prepTime: number;
  cookTime: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  isVegetarian: number;
  isVegan: number;
  isGlutenFree: number;
  isDairyFree: number;
  isKeto: number;
  isLowCarb: number;
  isHighProtein: number;
  goal: "weight_loss" | "muscle_gain" | "maintenance" | "endurance";
  ingredients: string;
  instructions: string;
  tips: string | null;
}

export default function Recipes() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [goal, setGoal] = useState<string>("");
  const [maxPrepTime, setMaxPrepTime] = useState<string>("");
  const [dietary, setDietary] = useState({
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: false,
    isKeto: false,
    isLowCarb: false,
    isHighProtein: false,
  });

  // UI State
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [selectedForShopping, setSelectedForShopping] = useState<number[]>([]);

  // Initialize recipes
  const initMutation = trpc.recipe.initializeRecipes.useMutation({
    onSuccess: () => {
      toast.success("Recettes initialisées avec succès !");
      refetch();
    },
  });

  // Fetch recipes with filters
  const { data: recipes, isLoading, refetch } = trpc.recipe.getRecipes.useQuery({
    search: search || undefined,
    category: category as any || undefined,
    difficulty: difficulty as any || undefined,
    goal: goal as any || undefined,
    maxPrepTime: maxPrepTime ? parseInt(maxPrepTime) : undefined,
    ...dietary,
  });

  // Fetch favorites
  const { data: favorites } = trpc.recipe.getFavorites.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Add to favorites
  const addFavoriteMutation = trpc.recipe.addToFavorites.useMutation({
    onSuccess: () => {
      toast.success("Recette ajoutée aux favoris !");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Shopping list
  const { data: shoppingList } = trpc.recipe.generateShoppingList.useQuery(
    { recipeIds: selectedForShopping },
    { enabled: selectedForShopping.length > 0 && showShoppingList }
  );

  const favoriteIds = new Set(favorites?.map(f => f.id) || []);

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      breakfast: "Petit-déjeuner",
      lunch: "Déjeuner",
      dinner: "Dîner",
      snack: "Collation",
      dessert: "Dessert",
    };
    return labels[cat] || cat;
  };

  const getDifficultyColor = (diff: string) => {
    const colors: Record<string, string> = {
      easy: "bg-green-500/20 text-green-500",
      medium: "bg-orange-500/20 text-orange-500",
      hard: "bg-red-500/20 text-red-500",
    };
    return colors[diff] || "";
  };

  const getGoalLabel = (g: string) => {
    const labels: Record<string, string> = {
      weight_loss: "Perte de poids",
      muscle_gain: "Prise de masse",
      maintenance: "Maintien",
      endurance: "Endurance",
    };
    return labels[g] || g;
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setDifficulty("");
    setGoal("");
    setMaxPrepTime("");
    setDietary({
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isDairyFree: false,
      isKeto: false,
      isLowCarb: false,
      isHighProtein: false,
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-gold mb-2">Recettes Nutritionnelles</h1>
            <p className="text-gray-400">
              {recipes?.length || 0} recettes disponibles
            </p>
          </div>
          <div className="flex gap-2">
            {isAuthenticated && (
              <Button
                onClick={() => setShowShoppingList(true)}
                disabled={selectedForShopping.length === 0}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Liste de courses ({selectedForShopping.length})
              </Button>
            )}
            {recipes && recipes.length === 0 && (
              <Button
                onClick={() => initMutation.mutate()}
                disabled={initMutation.isPending}
                className="bg-gold text-black hover:bg-gold/90"
              >
                {initMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ChefHat className="h-4 w-4 mr-2" />
                )}
                Initialiser les recettes
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-zinc-900 border-gold/20 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <Label className="text-gray-300">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Nom de recette..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <Label className="text-gray-300">Catégorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes</SelectItem>
                  <SelectItem value="breakfast">Petit-déjeuner</SelectItem>
                  <SelectItem value="lunch">Déjeuner</SelectItem>
                  <SelectItem value="dinner">Dîner</SelectItem>
                  <SelectItem value="snack">Collation</SelectItem>
                  <SelectItem value="dessert">Dessert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div>
              <Label className="text-gray-300">Difficulté</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes</SelectItem>
                  <SelectItem value="easy">Facile</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="hard">Difficile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Goal */}
            <div>
              <Label className="text-gray-300">Objectif</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous</SelectItem>
                  <SelectItem value="weight_loss">Perte de poids</SelectItem>
                  <SelectItem value="muscle_gain">Prise de masse</SelectItem>
                  <SelectItem value="maintenance">Maintien</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dietary Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-4">
            {Object.entries({
              isVegetarian: "Végétarien",
              isVegan: "Vegan",
              isGlutenFree: "Sans gluten",
              isDairyFree: "Sans lactose",
              isKeto: "Keto",
              isLowCarb: "Low carb",
              isHighProtein: "Riche en protéines",
            }).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={dietary[key as keyof typeof dietary]}
                  onCheckedChange={(checked) =>
                    setDietary({ ...dietary, [key]: checked })
                  }
                />
                <Label htmlFor={key} className="text-sm text-gray-300 cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </div>

          <Button
            onClick={clearFilters}
            variant="outline"
            className="border-gold/20 text-gold hover:bg-gold/10"
          >
            <X className="h-4 w-4 mr-2" />
            Réinitialiser les filtres
          </Button>
        </Card>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes?.map((recipe) => (
            <Card
              key={recipe.id}
              className="bg-zinc-900 border-gold/20 overflow-hidden hover:border-gold/40 transition-all cursor-pointer group"
              onClick={() => setSelectedRecipe(recipe)}
            >
              {/* Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                <ChefHat className="h-16 w-16 text-gold/40" />
              </div>

              <div className="p-6">
                {/* Title & Favorite */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-white group-hover:text-gold transition-colors flex-1">
                    {recipe.name}
                  </h3>
                  {isAuthenticated && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!favoriteIds.has(recipe.id)) {
                          addFavoriteMutation.mutate({ recipeId: recipe.id });
                        }
                      }}
                      className={favoriteIds.has(recipe.id) ? "text-red-500" : "text-gray-500"}
                    >
                      <Heart className={`h-5 w-5 ${favoriteIds.has(recipe.id) ? "fill-current" : ""}`} />
                    </Button>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {recipe.description}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-gold/20 text-gold border-gold/30">
                    {getCategoryLabel(recipe.category)}
                  </Badge>
                  <Badge className={getDifficultyColor(recipe.difficulty)}>
                    {recipe.difficulty === "easy" ? "Facile" : recipe.difficulty === "medium" ? "Moyen" : "Difficile"}
                  </Badge>
                  <Badge variant="outline" className="border-green-500/30 text-green-500">
                    {getGoalLabel(recipe.goal)}
                  </Badge>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-3 gap-2 text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{recipe.prepTime + recipe.cookTime} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{recipe.servings} pers.</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4" />
                    <span>{recipe.calories} kcal</span>
                  </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-blue-500/10 rounded p-2 text-center">
                    <p className="text-blue-500 font-bold">{recipe.protein}g</p>
                    <p className="text-gray-500">Protéines</p>
                  </div>
                  <div className="bg-orange-500/10 rounded p-2 text-center">
                    <p className="text-orange-500 font-bold">{recipe.carbs}g</p>
                    <p className="text-gray-500">Glucides</p>
                  </div>
                  <div className="bg-yellow-500/10 rounded p-2 text-center">
                    <p className="text-yellow-500 font-bold">{recipe.fat}g</p>
                    <p className="text-gray-500">Lipides</p>
                  </div>
                </div>

                {/* Add to Shopping List */}
                {isAuthenticated && (
                  <div className="mt-4">
                    <Checkbox
                      id={`shopping-${recipe.id}`}
                      checked={selectedForShopping.includes(recipe.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedForShopping([...selectedForShopping, recipe.id]);
                        } else {
                          setSelectedForShopping(selectedForShopping.filter(id => id !== recipe.id));
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Label
                      htmlFor={`shopping-${recipe.id}`}
                      className="ml-2 text-sm text-gray-400 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Ajouter à la liste de courses
                    </Label>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Recipe Detail Dialog */}
        {selectedRecipe && (
          <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
            <DialogContent className="bg-zinc-900 border-gold/20 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-gold text-2xl">{selectedRecipe.name}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  {selectedRecipe.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-gold/20 text-gold border-gold/30">
                    {getCategoryLabel(selectedRecipe.category)}
                  </Badge>
                  <Badge className={getDifficultyColor(selectedRecipe.difficulty)}>
                    {selectedRecipe.difficulty === "easy" ? "Facile" : selectedRecipe.difficulty === "medium" ? "Moyen" : "Difficile"}
                  </Badge>
                  <Badge variant="outline" className="border-green-500/30 text-green-500">
                    {getGoalLabel(selectedRecipe.goal)}
                  </Badge>
                  {selectedRecipe.isVegetarian === 1 && <Badge>Végétarien</Badge>}
                  {selectedRecipe.isVegan === 1 && <Badge>Vegan</Badge>}
                  {selectedRecipe.isGlutenFree === 1 && <Badge>Sans gluten</Badge>}
                  {selectedRecipe.isHighProtein === 1 && <Badge>Riche en protéines</Badge>}
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <Clock className="h-6 w-6 text-gold mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Temps total</p>
                    <p className="text-lg font-bold text-white">{selectedRecipe.prepTime + selectedRecipe.cookTime} min</p>
                  </div>
                  <div>
                    <Users className="h-6 w-6 text-gold mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Portions</p>
                    <p className="text-lg font-bold text-white">{selectedRecipe.servings}</p>
                  </div>
                  <div>
                    <Flame className="h-6 w-6 text-gold mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Calories</p>
                    <p className="text-lg font-bold text-white">{selectedRecipe.calories} kcal</p>
                  </div>
                </div>

                {/* Macros */}
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h3 className="font-bold text-white mb-3">Valeurs nutritionnelles (par portion)</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-500">{selectedRecipe.protein}g</p>
                      <p className="text-sm text-gray-400">Protéines</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-500">{selectedRecipe.carbs}g</p>
                      <p className="text-sm text-gray-400">Glucides</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-500">{selectedRecipe.fat}g</p>
                      <p className="text-sm text-gray-400">Lipides</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-500">{selectedRecipe.fiber || 0}g</p>
                      <p className="text-sm text-gray-400">Fibres</p>
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <h3 className="font-bold text-white mb-3">Ingrédients</h3>
                  <ul className="space-y-2">
                    {JSON.parse(selectedRecipe.ingredients).map((ingredient: any, index: number) => (
                      <li key={index} className="flex items-center gap-2 text-gray-300">
                        <span className="w-2 h-2 bg-gold rounded-full"></span>
                        <span>{ingredient.quantity} {ingredient.unit} {ingredient.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="font-bold text-white mb-3">Instructions</h3>
                  <ol className="space-y-3">
                    {JSON.parse(selectedRecipe.instructions).map((step: string, index: number) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-gold text-black rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="text-gray-300">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Tips */}
                {selectedRecipe.tips && (
                  <div className="bg-gold/10 border border-gold/20 rounded-lg p-4">
                    <h3 className="font-bold text-gold mb-2">💡 Astuce</h3>
                    <p className="text-gray-300">{selectedRecipe.tips}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Shopping List Dialog */}
        {showShoppingList && shoppingList && (
          <Dialog open={showShoppingList} onOpenChange={setShowShoppingList}>
            <DialogContent className="bg-zinc-900 border-gold/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-gold text-2xl">Liste de courses</DialogTitle>
                <DialogDescription className="text-gray-400">
                  {shoppingList.totalRecipes} recette(s) sélectionnée(s)
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Selected Recipes */}
                <div>
                  <h3 className="font-bold text-white mb-2">Recettes :</h3>
                  <div className="flex flex-wrap gap-2">
                    {shoppingList.recipes.map((recipe: any) => (
                      <Badge key={recipe.id} className="bg-gold/20 text-gold">
                        {recipe.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <h3 className="font-bold text-white mb-3">Ingrédients à acheter :</h3>
                  <div className="bg-zinc-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <ul className="space-y-2">
                      {shoppingList.ingredients.map((ingredient: any, index: number) => (
                        <li key={index} className="flex items-center gap-3 py-2 border-b border-zinc-700 last:border-0">
                          <Checkbox id={`ingredient-${index}`} />
                          <Label htmlFor={`ingredient-${index}`} className="flex-1 text-gray-300 cursor-pointer">
                            {ingredient.quantity} {ingredient.unit} {ingredient.name}
                          </Label>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    // Copy to clipboard
                    const text = shoppingList.ingredients
                      .map((i: any) => `${i.quantity} ${i.unit} ${i.name}`)
                      .join("\n");
                    navigator.clipboard.writeText(text);
                    toast.success("Liste copiée dans le presse-papiers !");
                  }}
                  className="w-full bg-gold text-black hover:bg-gold/90"
                >
                  Copier la liste
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
