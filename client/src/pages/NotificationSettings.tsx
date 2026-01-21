import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bell, BellOff, Calendar, Clock, Trash2, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function NotificationSettings() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [workoutRemindersEnabled, setWorkoutRemindersEnabled] = useState(true);

  const { data: upcomingReminders, refetch } = trpc.workout.getUserReminders.useQuery(
    { userId: user?.id },
    { enabled: isAuthenticated }
  );

  const deleteReminderMutation = trpc.workout.deleteReminder.useMutation({
    onSuccess: () => {
      toast.success("Rappel supprimé");
      refetch();
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du rappel");
    },
  });

  const handleDeleteReminder = (reminderId: number) => {
    if (confirm("Voulez-vous vraiment supprimer ce rappel ?")) {
      deleteReminderMutation.mutate({ reminderId });
    }
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gold mb-2 flex items-center">
            <Bell className="w-10 h-10 mr-3" />
            Notifications & Rappels
          </h1>
          <p className="text-gray-400">Gérez vos préférences de notifications</p>
        </div>

        {/* Préférences générales */}
        <Card className="bg-gray-900 border-gold mb-6">
          <CardHeader>
            <CardTitle className="text-gold">Préférences Générales</CardTitle>
            <CardDescription className="text-gray-400">
              Activez ou désactivez les notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex-1">
                <h3 className="text-white font-semibold flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-gold" />
                  Rappels de séances d'entraînement
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Recevez une notification 2 heures avant chaque séance programmée
                </p>
              </div>
              <Switch
                checked={workoutRemindersEnabled}
                onCheckedChange={setWorkoutRemindersEnabled}
                className="data-[state=checked]:bg-gold"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg opacity-50">
              <div className="flex-1">
                <h3 className="text-white font-semibold flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-gold" />
                  Notifications de messages
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Recevez une notification pour les nouveaux messages du coach
                </p>
              </div>
              <Switch disabled className="data-[state=checked]:bg-gold" />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg opacity-50">
              <div className="flex-1">
                <h3 className="text-white font-semibold flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-gold" />
                  Rapports mensuels
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Recevez votre rapport mensuel automatiquement
                </p>
              </div>
              <Switch disabled className="data-[state=checked]:bg-gold" />
            </div>

            <p className="text-gray-500 text-xs">
              Les options grisées seront disponibles prochainement
            </p>
          </CardContent>
        </Card>

        {/* Rappels à venir */}
        <Card className="bg-gray-900 border-gold">
          <CardHeader>
            <CardTitle className="text-gold flex items-center justify-between">
              <span className="flex items-center">
                <Clock className="w-6 h-6 mr-2" />
                Rappels à Venir
              </span>
              {upcomingReminders && upcomingReminders.length > 0 && (
                <Badge className="bg-gold text-black">
                  {upcomingReminders.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-gray-400">
              Vos prochains rappels de séances programmées
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingReminders && upcomingReminders.length > 0 ? (
              <div className="space-y-3">
                {upcomingReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Bell className="w-4 h-4 text-gold" />
                        <p className="text-white font-semibold">
                          Rappel de séance #{reminder.sessionId}
                        </p>
                      </div>
                      <p className="text-gray-400 text-sm flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDateTime(reminder.reminderTime)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteReminder(reminder.id)}
                      disabled={deleteReminderMutation.isPending}
                      className="border-red-500 text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BellOff className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">Aucun rappel à venir</p>
                <p className="text-gray-500 text-sm">
                  Les rappels sont créés automatiquement 2 heures avant chaque séance
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations */}
        <Card className="bg-gradient-to-br from-gold/10 to-transparent border-gold mt-6">
          <CardContent className="pt-6">
            <h3 className="text-gold font-semibold mb-2">💡 Comment ça marche ?</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>
                • Les rappels sont créés automatiquement lorsque votre coach programme une séance
              </li>
              <li>
                • Vous recevrez une notification 2 heures avant l'heure de la séance
              </li>
              <li>
                • Les rappels passés sont automatiquement supprimés
              </li>
              <li>
                • Vous pouvez supprimer manuellement un rappel si vous ne souhaitez pas être notifié
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
