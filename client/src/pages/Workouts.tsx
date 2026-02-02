import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Calendar, Clock, Dumbbell, CheckCircle2, Circle, Loader2, ChevronLeft, ChevronRight, RefreshCw, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable } from "@dnd-kit/core";

interface WorkoutSession {
  id: number;
  userId: number;
  programId: number | null;
  title: string;
  description?: string | null;
  type: "cardio" | "strength" | "flexibility" | "hiit" | "endurance" | "recovery";
  scheduledDate: Date;
  duration?: number | null;
  difficulty?: "easy" | "medium" | "hard" | "extreme" | null;
  instructions?: string | null;
  videoUrl?: string | null;
  isCompleted: number;
  createdAt?: Date;
  updatedAt?: Date;
}

function DraggableSession({ session }: { session: WorkoutSession }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `session-${session.id}`,
    data: session,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`w-full text-left px-2 py-1 rounded text-xs flex items-center gap-1 cursor-move ${
        session.isCompleted
          ? 'bg-green-500/20 text-green-500'
          : 'bg-blue-500/20 text-blue-500'
      } hover:opacity-80 transition-opacity ${isDragging ? 'opacity-50' : ''}`}
    >
      <GripVertical className="h-3 w-3 flex-shrink-0" />
      <span className="truncate flex-1">{session.title}</span>
    </div>
  );
}

function DroppableDay({ date, children }: { date: Date; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${date.toDateString()}`,
    data: { date },
  });

  const isToday = date.toDateString() === new Date().toDateString();

  return (
    <div
      ref={setNodeRef}
      className={`aspect-square border rounded-lg p-2 transition-colors ${
        isToday ? 'border-gold bg-gold/5' : 'border-zinc-700 bg-zinc-800'
      } ${isOver ? 'border-gold bg-gold/10' : ''}`}
    >
      {children}
    </div>
  );
}

export default function Workouts() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
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

  // Stats will be calculated from sessions
  const stats = sessions ? {
    completedSessions: sessions.filter(s => s.isCompleted).length,
    totalSessions: sessions.length,
    totalDuration: sessions.filter(s => s.isCompleted).reduce((sum, s) => sum + (s.duration || 0), 0),
    totalCalories: 0, // Would need completion data
    avgRating: 0, // Would need completion data
  } : null;

  const completeSessionMutation = trpc.workout.completeSession.useMutation({
    onSuccess: () => {
      toast.success("Séance terminée avec succès !");
      setIsCompletionDialogOpen(false);
      setSelectedSession(null);
      setCompletionData({ duration: "", notes: "", rating: "", caloriesBurned: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });

  const updateSessionDateMutation = trpc.workout.updateSessionDate.useMutation({
    onSuccess: () => {
      toast.success("Séance déplacée avec succès !");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleMarkComplete = (session: WorkoutSession) => {
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

  const handleDragStart = (event: DragStartEvent) => {
    const session = event.active.data.current as WorkoutSession;
    setActiveSession(session);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveSession(null);
    
    const { active, over } = event;
    if (!over) return;

    const session = active.data.current as WorkoutSession;
    const targetDate = over.data.current?.date as Date;

    if (!targetDate) return;

    // Check if date actually changed
    const oldDate = new Date(session.scheduledDate).toDateString();
    const newDate = targetDate.toDateString();
    
    if (oldDate === newDate) return;

    // Update session date
    updateSessionDateMutation.mutate({
      sessionId: session.id,
      newDate: targetDate,
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

  const getDifficultyBadge = (difficulty?: string | null) => {
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
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-black pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-serif font-bold text-gold mb-8">Plans d'Entraînement</h1>



          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-zinc-900 border-gold/20 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-400">Séances complétées</p>
                    <p className="text-2xl font-bold text-white">{stats.completedSessions}/{stats.totalSessions}</p>
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

            <p className="text-sm text-gray-400 mb-4 flex items-center gap-2">
              <GripVertical className="h-4 w-4" />
              Glissez-déposez les séances pour les déplacer
            </p>

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

                return (
                  <DroppableDay key={dateStr} date={date}>
                    <div className="text-sm text-white mb-1">{date.getDate()}</div>
                    <div className="space-y-1">
                      {daySessions.map((session) => (
                        <div key={session.id} onClick={() => setSelectedSession(session)}>
                          <DraggableSession session={session} />
                        </div>
                      ))}
                    </div>
                  </DroppableDay>
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
                    {selectedSession.isCompleted ? (
                      <Badge className="bg-green-500/20 text-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Terminée
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-500/20 text-gray-500">
                        <Circle className="h-3 w-3 mr-1" />
                        En attente
                      </Badge>
                    )}
                  </div>

                  {selectedSession.description && (
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Description</h3>
                      <p className="text-sm text-gray-400">{selectedSession.description}</p>
                    </div>
                  )}

                  {selectedSession.duration && (
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Durée</h3>
                      <p className="text-sm text-gray-400">{selectedSession.duration} minutes</p>
                    </div>
                  )}

                  {selectedSession.instructions && (
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Instructions</h3>
                      <p className="text-sm text-gray-400 whitespace-pre-wrap">{selectedSession.instructions}</p>
                    </div>
                  )}

                  {!selectedSession.isCompleted && (
                    <Button
                      onClick={() => handleMarkComplete(selectedSession)}
                      className="w-full bg-gold hover:bg-gold/80 text-black"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Marquer comme terminée
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Completion Dialog */}
          {isCompletionDialogOpen && selectedSession && (
            <Dialog open={isCompletionDialogOpen} onOpenChange={setIsCompletionDialogOpen}>
              <DialogContent className="bg-zinc-900 border-gold/20 text-white">
                <DialogHeader>
                  <DialogTitle className="text-gold">Compléter la séance</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    {selectedSession.title}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="duration">Durée réelle (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={completionData.duration}
                      onChange={(e) => setCompletionData({ ...completionData, duration: e.target.value })}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rating">Note de difficulté (1-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="1"
                      max="5"
                      value={completionData.rating}
                      onChange={(e) => setCompletionData({ ...completionData, rating: e.target.value })}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="calories">Calories brûlées</Label>
                    <Input
                      id="calories"
                      type="number"
                      value={completionData.caloriesBurned}
                      onChange={(e) => setCompletionData({ ...completionData, caloriesBurned: e.target.value })}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={completionData.notes}
                      onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                      className="bg-zinc-800 border-zinc-700"
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleSubmitCompletion}
                    disabled={completeSessionMutation.isPending}
                    className="w-full bg-gold hover:bg-gold/80 text-black"
                  >
                    {completeSessionMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      'Valider'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeSession ? (
          <div className="px-3 py-2 rounded bg-blue-500/40 text-blue-500 text-sm font-medium border-2 border-blue-500">
            {activeSession.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
