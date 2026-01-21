import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Calendar, Clock, Dumbbell, CheckCircle2, Circle, Loader2, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WorkoutSession {
  id: number;
  userId: number;
  programId: number | null;
  title: string;
  description: string | null;
  type: "cardio" | "strength" | "flexibility" | "hiit" | "endurance" | "recovery";
  scheduledDate: Date;
  duration: number | null;
  difficulty: "easy" | "medium" | "hard" | "extreme" | null;
  instructions: string | null;
  videoUrl: string | null;
  isCompleted: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function Workouts() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [completionData, setCompletionData] = useState({
    duration: "",
    notes: "",
    rating: "",
    caloriesBurned: "",
  });

  // Get start and end of current month
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const { data: sessions, refetch } = trpc.workout.getUserSessions.useQuery(
    {
      startDate: startOfMonth,
      endDate: endOfMonth,
    },
    { enabled: isAuthenticated }
  );

  const { data: stats } = trpc.workout.getCompletionStats.useQuery(
    {},
    { enabled: isAuthenticated }
  );

  const { data: reschedules } = trpc.workout.getRescheduleHistory.useQuery(
    { userId: user?.id, limit: 5 },
    { enabled: isAuthenticated }
  );

  const completeSessionMutation = trpc.workout.completeSession.useMutation({
    onSuccess: () => {
      toast.success("Séance complétée avec succès !");
      refetch();
      setIsCompletionDialogOpen(false);
      setCompletionData({ duration: "", notes: "", rating: "", caloriesBurned: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la complétion de la séance");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation('/');
    return null;
  }

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleCompleteSession = (session: WorkoutSession) => {
    setSelectedSession(session);
    setIsCompletionDialogOpen(true);
  };

  const handleSubmitCompletion = () => {
    if (!selectedSession) return;

    completeSessionMutation.mutate({
      sessionId: selectedSession.id,
      duration: completionData.duration ? parseInt(completionData.duration) : undefined,
      notes: completionData.notes || undefined,
      rating: completionData.rating ? parseInt(completionData.rating) : undefined,
      caloriesBurned: completionData.caloriesBurned ? parseInt(completionData.caloriesBurned) : undefined,
    });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      cardio: "bg-blue-500",
      strength: "bg-red-500",
      flexibility: "bg-green-500",
      hiit: "bg-orange-500",
      endurance: "bg-purple-500",
      recovery: "bg-gray-500",
    };
    return colors[type] || "bg-gray-500";
  };

  const getDifficultyBadge = (difficulty: string | null) => {
    if (!difficulty) return null;
    const variants: Record<string, string> = {
      easy: "bg-green-500/20 text-green-500",
      medium: "bg-yellow-500/20 text-yellow-500",
      hard: "bg-orange-500/20 text-orange-500",
      extreme: "bg-red-500/20 text-red-500",
    };
    return (
      <Badge className={variants[difficulty] || ""}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </Badge>
    );
  };

  // Group sessions by date
  const sessionsByDate: Record<string, WorkoutSession[]> = {};
  sessions?.forEach((session) => {
    const date = new Date(session.scheduledDate).toDateString();
    if (!sessionsByDate[date]) {
      sessionsByDate[date] = [];
    }
    sessionsByDate[date].push(session);
  });

  // Generate calendar days
  const firstDayOfMonth = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();
  const calendarDays: (Date | null)[] = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-serif font-bold text-gold mb-8">Plans d'Entraînement</h1>

        {/* Reschedule Notifications */}
        {reschedules && reschedules.length > 0 && (
          <Card className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/30 p-4 mb-6">
            <div className="flex items-start gap-3">
              <RefreshCw className="h-6 w-6 text-orange-500 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Séances reprogrammées</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Certaines séances manquées ont été automatiquement reprogrammées pour vous aider à rester sur la bonne voie.
                </p>
                <div className="space-y-2">
                  {reschedules.slice(0, 3).map((reschedule) => (
                    <div key={reschedule.id} className="bg-zinc-900/50 rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">
                            Séance #{reschedule.originalSessionId}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {new Date(reschedule.originalDate).toLocaleDateString('fr-FR')} → {new Date(reschedule.proposedDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <Badge className={reschedule.status === 'auto_accepted' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}>
                          {reschedule.status === 'auto_accepted' ? 'Acceptée' : reschedule.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-zinc-900 border-gold/20 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-400">Séances complétées</p>
                  <p className="text-2xl font-bold text-white">{stats.totalCompletions}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-zinc-900 border-gold/20 p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-400">Temps total</p>
                  <p className="text-2xl font-bold text-white">{stats.totalDuration} min</p>
                </div>
              </div>
            </Card>
            <Card className="bg-zinc-900 border-gold/20 p-4">
              <div className="flex items-center gap-3">
                <Dumbbell className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-400">Calories brûlées</p>
                  <p className="text-2xl font-bold text-white">{stats.totalCalories}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-zinc-900 border-gold/20 p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-gold" />
                <div>
                  <p className="text-sm text-gray-400">Note moyenne</p>
                  <p className="text-2xl font-bold text-white">{stats.avgRating.toFixed(1)}/5</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Calendar */}
        <Card className="bg-zinc-900 border-gold/20 p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousMonth}
              className="border-gold/20 hover:bg-gold/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold text-gold">
              {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="border-gold/20 hover:bg-gold/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-400 py-2">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dateStr = date.toDateString();
              const daySessions = sessionsByDate[dateStr] || [];
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={dateStr}
                  className={`aspect-square border rounded-lg p-2 ${
                    isToday ? 'border-gold bg-gold/5' : 'border-zinc-700 bg-zinc-800'
                  }`}
                >
                  <div className="text-sm text-white mb-1">{date.getDate()}</div>
                  <div className="space-y-1">
                    {daySessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => setSelectedSession(session)}
                        className={`w-full text-left px-1 py-0.5 rounded text-xs truncate ${
                          session.isCompleted
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-blue-500/20 text-blue-500'
                        } hover:opacity-80 transition-opacity`}
                      >
                        {session.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Session Detail Dialog */}
        {selectedSession && !isCompletionDialogOpen && (
          <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
            <DialogContent className="bg-zinc-900 border-gold/20 text-white">
              <DialogHeader>
                <DialogTitle className="text-gold">{selectedSession.title}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  {new Date(selectedSession.scheduledDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(selectedSession.type)}>
                    {selectedSession.type}
                  </Badge>
                  {getDifficultyBadge(selectedSession.difficulty)}
                  {selectedSession.duration && (
                    <Badge variant="outline" className="border-gold/20">
                      {selectedSession.duration} min
                    </Badge>
                  )}
                </div>

                {selectedSession.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-gray-300">{selectedSession.description}</p>
                  </div>
                )}

                {selectedSession.instructions && (
                  <div>
                    <h4 className="font-semibold mb-2">Instructions</h4>
                    <p className="text-gray-300 whitespace-pre-wrap">{selectedSession.instructions}</p>
                  </div>
                )}

                {selectedSession.videoUrl && (
                  <div>
                    <h4 className="font-semibold mb-2">Vidéo</h4>
                    <a
                      href={selectedSession.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:underline"
                    >
                      Voir la vidéo
                    </a>
                  </div>
                )}

                {selectedSession.isCompleted ? (
                  <Badge className="bg-green-500/20 text-green-500">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Complété
                  </Badge>
                ) : (
                  <Button
                    onClick={() => handleCompleteSession(selectedSession)}
                    className="w-full bg-gold text-black hover:bg-gold/90"
                  >
                    Marquer comme complété
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Completion Dialog */}
        <Dialog open={isCompletionDialogOpen} onOpenChange={setIsCompletionDialogOpen}>
          <DialogContent className="bg-zinc-900 border-gold/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-gold">Compléter la séance</DialogTitle>
              <DialogDescription className="text-gray-400">
                Enregistrez vos résultats pour cette séance
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="duration">Durée (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={completionData.duration}
                  onChange={(e) => setCompletionData({ ...completionData, duration: e.target.value })}
                  className="bg-zinc-800 border-gold/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="calories">Calories brûlées</Label>
                <Input
                  id="calories"
                  type="number"
                  value={completionData.caloriesBurned}
                  onChange={(e) => setCompletionData({ ...completionData, caloriesBurned: e.target.value })}
                  className="bg-zinc-800 border-gold/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="rating">Note (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={completionData.rating}
                  onChange={(e) => setCompletionData({ ...completionData, rating: e.target.value })}
                  className="bg-zinc-800 border-gold/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={completionData.notes}
                  onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                  className="bg-zinc-800 border-gold/20 text-white"
                  rows={3}
                />
              </div>
              <Button
                onClick={handleSubmitCompletion}
                disabled={completeSessionMutation.isPending}
                className="w-full bg-gold text-black hover:bg-gold/90"
              >
                {completeSessionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
