/**
 * Composant - Notifications Bienveillantes
 *
 * Système de notifications positives et encourageantes
 * Aligné avec la philosophie bienveillante d'Ahmed
 */

import { useEffect, useState } from 'react';
import { X, CheckCircle2, Trophy, Flame, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export type NotificationType = 'success' | 'achievement' | 'streak' | 'encouragement' | 'reminder';

interface PositiveNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: React.ReactNode;
  duration?: number; // en ms, undefined = permanent
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function usePositiveNotifications() {
  const [notifications, setNotifications] = useState<PositiveNotification[]>([]);

  const addNotification = (notification: Omit<PositiveNotification, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newNotification = { ...notification, id };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove si durée définie
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const notifySuccess = (message: string) => {
    return addNotification({
      type: 'success',
      title: 'Bien joué ! 💪',
      message,
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      duration: 4000,
    });
  };

  const notifyAchievement = (title: string, message: string) => {
    return addNotification({
      type: 'achievement',
      title,
      message,
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
      duration: 8000,
    });
  };

  const notifyStreak = (days: number) => {
    const messages = [
      `Ça fait ${days} jours consécutifs ! Incroyable 🔥`,
      `${days} jours d'affilée ! Vous êtes imbattable`,
      `${days} jours ! Personne ne vous arrête`,
    ];
    
    return addNotification({
      type: 'streak',
      title: `${days} jours consécutifs !`,
      message: messages[Math.floor(Math.random() * messages.length)],
      icon: <Flame className="w-5 h-5 text-orange-500" />,
      duration: 6000,
    });
  };

  const notifyEncouragement = (message: string) => {
    return addNotification({
      type: 'encouragement',
      title: 'Courage ! 💚',
      message,
      icon: <Star className="w-5 h-5 text-blue-500" />,
      duration: 5000,
    });
  };

  const notifyReminder = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
    return addNotification({
      type: 'reminder',
      title,
      message,
      icon: <CheckCircle2 className="w-5 h-5 text-purple-500" />,
      action,
      duration: 10000,
    });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    notifySuccess,
    notifyAchievement,
    notifyStreak,
    notifyEncouragement,
    notifyReminder,
  };
}

/**
 * Composant d'affichage des notifications
 */
export function PositiveNotificationCenter() {
  const { notifications, removeNotification } = usePositiveNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map(notification => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function NotificationCard({ 
  notification, 
  onClose 
}: { 
  notification: PositiveNotification; 
  onClose: () => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const bgColors = {
    success: 'bg-green-500/10 border-green-500/30',
    achievement: 'bg-yellow-500/10 border-yellow-500/30',
    streak: 'bg-orange-500/10 border-orange-500/30',
    encouragement: 'bg-blue-500/10 border-blue-500/30',
    reminder: 'bg-purple-500/10 border-purple-500/30',
  };

  return (
    <Card 
      className={`${bgColors[notification.type]} border backdrop-blur-sm p-4 transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
    >
      <div className="flex items-start gap-3">
        {notification.icon && (
          <div className="flex-shrink-0 mt-0.5">
            {notification.icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-white text-sm">
              {notification.title}
            </h4>
            <button
              onClick={handleClose}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-300 mt-1">
            {notification.message}
          </p>

          {notification.action && (
            <Button
              onClick={notification.action.onClick}
              className="mt-3 text-xs bg-white/10 hover:bg-white/20"
              size="sm"
            >
              {notification.action.label}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Hook pour déclencher des notifications contextuelles
 * basées sur les actions de l'utilisateur
 */
export function useContextualNotifications() {
  const { notifySuccess, notifyAchievement, notifyStreak, notifyEncouragement, notifyReminder } = usePositiveNotifications();

  // Notification après complétion de workout
  const notifyWorkoutComplete = (workoutTitle: string, duration: number) => {
    const messages = [
      `Séance "${workoutTitle}" terminée en ${duration} min !`,
      `Vous avez écrasé "${workoutTitle}" !`,
      `${duration} min de travail intense, bien joué !`,
    ];

    notifySuccess(messages[Math.floor(Math.random() * messages.length)]);
  };

  // Notification pour nouveau niveau
  const notifyLevelUp = (newLevel: string) => {
    notifyAchievement(
      'Nouveau niveau débloqué ! 🎉',
      `Vous êtes maintenant niveau ${newLevel} ! Continuez comme ça !`
    );
  };

  // Notification pour premier workout
  const notifyFirstWorkout = () => {
    notifyAchievement(
      'Première séance ! 🌟',
      'Félicitations pour votre première séance ! Vous venez de franchir un grand pas.'
    );
  };

  // Notification après une période d'inactivité
  const notifyReturnReminder = (daysSinceLastWorkout: number) => {
    notifyReminder(
      'On reprend ? 💪',
      `Ça fait ${daysSinceLastWorkout} jours sans entraînement. Une petite séance aujourd'hui ?`,
      {
        label: 'Voir mes programmes',
        onClick: () => {
          window.location.href = '/programs';
        },
      }
    );
  };

  // Notification de fin de semaine
  const notifyWeeklySummary = (workoutsCompleted: number, totalWorkouts: number) => {
    if (workoutsCompleted === totalWorkouts) {
      notifyAchievement(
        'Semaine parfaite ! 🏆',
        `${workoutsCompleted} séances complétées cette semaine. Vous êtes incroyable !`
      );
    } else if (workoutsCompleted > 0) {
      notifyEncouragement(
        `${workoutsCompleted} séances cette semaine !`
      );
    }
  };

  return {
    notifyWorkoutComplete,
    notifyLevelUp,
    notifyFirstWorkout,
    notifyReturnReminder,
    notifyWeeklySummary,
  };
}
