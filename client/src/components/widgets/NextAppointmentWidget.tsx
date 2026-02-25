/**
 * NextAppointmentWidget
 *
 * Affiche le prochain rendez-vous de coaching
 * avec countdown et boutons d'action rapides
 */

import { useState, useEffect } from 'react';
import { Calendar, Clock, Video, ExternalLink } from 'lucide-react';

interface Appointment {
  id: string;
  type: 'discovery' | 'session' | 'consultation';
  date: string;
  time: string;
  duration: number;
  coachName: string;
  zoomLink?: string;
}

interface NextAppointmentWidgetProps {
  className?: string;
}

export default function NextAppointmentWidget({ className = '' }: NextAppointmentWidgetProps) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // TODO: Récupérer le vrai prochain rendez-vous via tRPC
  // Pour l'instant, on utilise des données mockées
  useEffect(() => {
    // Mock data
    const mockAppointment: Appointment = {
      id: '1',
      type: 'session',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 jours
      time: '14:00',
      duration: 45,
      coachName: 'Ahmed Andaloussi',
      zoomLink: 'https://zoom.us/j/123456789',
    };

    setAppointment(mockAppointment);
  }, []);

  // Calculer le temps restant
  useEffect(() => {
    if (!appointment) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const appointmentTime = new Date(appointment.date).getTime();
      const diff = appointmentTime - now;

      if (diff <= 0) {
        setTimeRemaining('Maintenant !');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days}j ${hours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}min`);
      } else {
        setTimeRemaining(`${minutes} minutes`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Toutes les minutes

    return () => clearInterval(interval);
  }, [appointment]);

  if (!appointment) {
    return (
      <div className={`bg-white rounded-xl border-2 border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Aucun rendez-vous à venir</p>
          <a
            href="/reservation"
            className="inline-block mt-4 text-gold hover:underline font-semibold"
          >
            Réserver une séance →
          </a>
        </div>
      </div>
    );
  }

  const appointmentDate = new Date(appointment.date);
  const formattedDate = appointmentDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const typeLabels: Record<string, string> = {
    discovery: 'Appel Découverte',
    session: 'Séance de Coaching',
    consultation: 'Consultation',
  };

  return (
    <div className={`bg-white rounded-xl border-2 border-gold p-6 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-black text-lg">Prochain Rendez-vous</h3>
        <span className="bg-gold/20 text-gold px-3 py-1 rounded-full text-xs font-semibold">
          {timeRemaining}
        </span>
      </div>

      {/* Appointment Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gold" />
          <div>
            <p className="font-semibold text-black">{typeLabels[appointment.type]}</p>
            <p className="text-sm text-gray-600">{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gold" />
          <div>
            <p className="text-black">{appointment.time} ({appointment.duration} min)</p>
            <p className="text-sm text-gray-600">avec {appointment.coachName}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {appointment.zoomLink && (
          <a
            href={appointment.zoomLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gold hover:bg-gold/90 text-black font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Video className="w-4 h-4" />
            Rejoindre
          </a>
        )}
        <a
          href="/dashboard/appointments"
          className="flex-1 border-2 border-gray-200 hover:border-gold text-gray-700 hover:text-black font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Détails
        </a>
      </div>
    </div>
  );
}
