import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, Play, Search, Filter, Dumbbell, Clock, Target } from "lucide-react";
import { useLocation } from "wouter";

export default function ExerciseLibrary() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [adaptedOnly, setAdaptedOnly] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  const { data: exercises, isLoading, refetch } = trpc.exercise.getExercises.useQuery({
    category: selectedCategory !== "all" ? selectedCategory as any : undefined,
    difficulty: selectedDifficulty !== "all" ? selectedDifficulty as any : undefined,
    search: searchQuery || undefined,
    adaptedForDisability: adaptedOnly || undefined,
  });

  const { data: favorites } = trpc.exercise.getUserFavorites.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const toggleFavoriteMutation = trpc.exercise.toggleFavorite.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const favoriteIds = favorites?.map(f => f.exerciseId) || [];

  const handleToggleFavorite = (exerciseId: number) => {
    toggleFavoriteMutation.mutate({ exerciseId });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "intermediate": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "advanced": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "expert": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "cardio": return "🏃";
      case "strength": return "💪";
      case "flexibility": return "🧘";
      case "hiit": return "🔥";
      case "endurance": return "⏱️";
      case "recovery": return "🌿";
      default: return "🎯";
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de la bibliothèque...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-900 border-gold/20 max-w-md">
          <CardHeader>
            <CardTitle className="text-gold">Connexion requise</CardTitle>
            <CardDescription>Vous devez être connecté pour accéder à la bibliothèque d'exercices.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setLocation("/api/oauth/login")} 
              className="w-full bg-gold text-black hover:bg-gold/90"
            >
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl font-bold text-gold mb-4">Bibliothèque d'Exercices</h1>
          <p className="text-gray-400 text-lg">Plus de {exercises?.length || 0} exercices exclusifs avec vidéos HD</p>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Rechercher un exercice..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="strength">Force</SelectItem>
                  <SelectItem value="flexibility">Flexibilité</SelectItem>
                  <SelectItem value="hiit">HIIT</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="recovery">Récupération</SelectItem>
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Difficulté" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  <SelectItem value="beginner">Débutant</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire</SelectItem>
                  <SelectItem value="advanced">Avancé</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>

              {/* Adapted Filter */}
              <Button
                variant={adaptedOnly ? "default" : "outline"}
                onClick={() => setAdaptedOnly(!adaptedOnly)}
                className={adaptedOnly ? "bg-gold text-black" : "border-gray-700 text-white"}
              >
                <Filter className="w-4 h-4 mr-2" />
                Adapté handicap
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Exercises Grid */}
        {exercises && exercises.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-12 text-center">
              <Dumbbell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Aucun exercice trouvé.</p>
              <p className="text-gray-500 text-sm mt-2">Essayez de modifier vos filtres.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises?.map((exercise) => {
              const isFavorite = favoriteIds.includes(exercise.id);

              return (
                <Card 
                  key={exercise.id} 
                  className="bg-gray-900 border-gray-800 hover:border-gold/50 transition-all cursor-pointer group"
                  onClick={() => setSelectedExercise(exercise)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white flex items-center gap-2 group-hover:text-gold transition-colors">
                          <span className="text-2xl">{getCategoryIcon(exercise.category)}</span>
                          {exercise.name}
                        </CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {exercise.description || "Exercice de qualité professionnelle"}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(exercise.id);
                        }}
                        className="hover:bg-transparent"
                      >
                        <Heart 
                          className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`} 
                        />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getDifficultyColor(exercise.difficulty)}>
                          {exercise.difficulty === "beginner" && "Débutant"}
                          {exercise.difficulty === "intermediate" && "Intermédiaire"}
                          {exercise.difficulty === "advanced" && "Avancé"}
                          {exercise.difficulty === "expert" && "Expert"}
                        </Badge>
                        <Badge variant="outline" className="border-gray-700 text-gray-400">
                          {exercise.category}
                        </Badge>
                        {exercise.isAdaptedForDisability === 1 && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            Adapté
                          </Badge>
                        )}
                      </div>

                      {exercise.duration && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{exercise.duration} min</span>
                        </div>
                      )}

                      {exercise.equipment && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Target className="w-4 h-4" />
                          <span>{exercise.equipment}</span>
                        </div>
                      )}

                      {exercise.videoUrl && (
                        <Button className="w-full bg-gold text-black hover:bg-gold/90 flex items-center gap-2">
                          <Play className="w-4 h-4" />
                          Voir la vidéo
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Exercise Detail Dialog */}
      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-3xl">
          {selectedExercise && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-gold flex items-center gap-2">
                  <span className="text-3xl">{getCategoryIcon(selectedExercise.category)}</span>
                  {selectedExercise.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {selectedExercise.videoUrl && (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={selectedExercise.videoUrl.replace("watch?v=", "embed/")}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gold mb-2">Description</h3>
                  <p className="text-gray-300">{selectedExercise.description || "Aucune description disponible."}</p>
                </div>

                {selectedExercise.instructions && (
                  <div>
                    <h3 className="text-lg font-semibold text-gold mb-2">Instructions</h3>
                    <p className="text-gray-300 whitespace-pre-line">{selectedExercise.instructions}</p>
                  </div>
                )}

                {selectedExercise.tips && (
                  <div>
                    <h3 className="text-lg font-semibold text-gold mb-2">Conseils</h3>
                    <p className="text-gray-300 whitespace-pre-line">{selectedExercise.tips}</p>
                  </div>
                )}

                {selectedExercise.muscleGroups && (
                  <div>
                    <h3 className="text-lg font-semibold text-gold mb-2">Groupes musculaires</h3>
                    <p className="text-gray-300">{selectedExercise.muscleGroups}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
