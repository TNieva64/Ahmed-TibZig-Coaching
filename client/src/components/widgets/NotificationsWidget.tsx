/**
 * NotificationsWidget
 *
 * Affiche les notifications récentes
 * avec possibilité de marquer comme lu
 */

import { useState, useEffect } from 'react';
import { Bell, Check, X, Award, MessageCircle, Calendar } from 'lucide-react';

interface Notification {
  id: string;
  type: 'achievement' | 'message' | 'appointment' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationsWidgetProps {
  className?: string;
}

export default function NotificationsWidget({ className = '' }: NotificationsWidgetProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // TODO: Récupérer les vraies notifications via tRPC
  useEffect(() => {
    // Mock data
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'achievement',
        title: '🏆 Nouveau badge débloqué !',
        message: 'Félicitations ! Vous avez obtenu le badge "Déterminé".',
        date: new Date().toISOString(),
        read: false,
        actionUrl: '/dashboard/badges',
      },
      {
        id: '2',
        type: 'appointment',
        title: '📅 Rappel de séance',
        message: 'Votre séance de coaching est prévue demain à 14h.',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
      },
      {
        id: '3',
        type: 'message',
        title: '💬 Nouveau message de votre coach',
        message: 'Ahmed vous a envoyé un nouveau message concernant votre programme.',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        actionUrl: '/dashboard/messages',
      },
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    // Ne pas décrémenter unreadCount car la notification est supprimée, pas lue
  };

  const typeIcons: Record<string, any> = {
    achievement: Award,
    message: MessageCircle,
    appointment: Calendar,
    system: Bell,
  };

  const typeColors: Record<string, string> = {
    achievement: 'bg-purple-100 text-purple-600',
    message: 'bg-blue-100 text-blue-600',
    appointment: 'bg-gold/20 text-gold',
    system: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className={`bg-white rounded-xl border-2 border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-black text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-gold hover:text-black text-sm font-semibold"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = typeIcons[notification.type] || Bell;
            return (
              <div
                key={notification.id}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  notification.read
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white border-gold shadow-md'
                }`}
              >
                {/* Unread indicator */}
                {!notification.read && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full" />
                )}

                <div className="flex gap-3">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[notification.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-black text-sm">{notification.title}</p>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{notification.message}</p>
                    <p className="text-gray-400 text-xs mt-2">
                      {new Date(notification.date).toLocaleDateString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  {notification.actionUrl && (
                    <a
                      href={notification.actionUrl}
                      className="text-gold hover:text-black text-sm font-semibold"
                                                    >
                      Voir →
                    </a>
                  )}
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-gray-500 hover:text-black text-sm font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Marquer comme lu
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="ml-auto text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Aucune notification</p>
        </div>
      )}

      {/* View All Link */}
      {notifications.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <a
            href="/dashboard/notifications"
            className="text-gold hover:text-black font-semibold"
          >
            Voir toutes les notifications →
          </a>
        </div>
      )}
    </div>
  );
}
