/**
 * Page de Confirmation de Réservation
 *
 * Affiche:
 * - Récapitulatif de la réservation
 * - Détails du rendez-vous
 * - Option d'ajout au calendrier (.ics)
 * - Instructions pour rejoindre la séance
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'wouter';
import { Calendar, Clock, Mail, Phone, Video, Download, CheckCircle, Home } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

interface ReservationData {
  type: string;
  date: string;
  time: string;
  duration: number;
  price: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

// Générer un fichier .ics pour ajout au calendrier
const generateICS = (data: ReservationData): string => {
  const startDate = new Date(`${data.date}T${data.time}:00`);
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + data.duration);

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ahmed Andaloussi Coaching//FR',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:Coaching - ${data.type}`,
    `DESCRIPTION:Coaching avec Ahmed Andaloussi\\n\\nType: ${data.type}\\nClient: ${data.name}\\nEmail: ${data.email}${data.phone ? `\\nTél: ${data.phone}` : ''}${data.message ? `\\n\\nMessage: ${data.message}` : ''}`,
    'LOCATION:Zoom (lien envoyé par email)',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Rappel: Coaching dans 15 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return icsContent;
};

// Télécharger le fichier .ics
const downloadICS = (data: ReservationData) => {
  const ics = generateICS(data);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `coaching-${data.date}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function ReservationConfirm() {
  const [, setLocation] = useLocation();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<ReservationData | null>(null);

  // Récupérer les données de réservation passées en query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get('data');

    if (dataParam) {
      try {
        const data: ReservationData = JSON.parse(atob(dataParam));
        setReservation(data);
      } catch (error) {
        console.error('Error parsing reservation data:', error);
        setLocation('/');
      }
    } else {
      // Pas de données = accès direct à la page
      setLocation('/');
    }
  }, [setLocation]);

  // Si pas de réservation, ne rien afficher
  if (!reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const coachingTypes: Record<string, string> = {
    discovery: 'Appel Découverte',
    session: 'Séance de Coaching',
    consultation: 'Consultation Spécialisée',
  };

  const formattedDate = new Date(reservation.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Success Banner */}
      <section className="bg-green-50 border-b-2 border-green-200 section-padding-sm">
        <div className="container text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h1 className="heading-lg text-green-900">Réservation Confirmée !</h1>
          <p className="text-green-700 mt-2">
            Votre demande a été enregistrée avec succès.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container max-w-3xl">
          {/* Confirmation Card */}
          <div className="bg-gradient-to-br from-gold/10 to-gold/5 border-2 border-gold rounded-2xl p-8 mb-8">
            <h2 className="heading-md text-black mb-6">Détails de Votre Réservation</h2>

            <div className="space-y-4">
              {/* Type de coaching */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type de séance</p>
                  <p className="font-semibold text-black">
                    {coachingTypes[reservation.type] || reservation.type}
                  </p>
                </div>
              </div>

              {/* Date et heure */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date et heure</p>
                  <p className="font-semibold text-black">{formattedDate}</p>
                  <p className="text-black">
                    {reservation.time} ({reservation.duration} minutes)
                  </p>
                </div>
              </div>

              {/* Prix */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tarif</p>
                  <p className="font-bold text-2xl text-black">{reservation.price}</p>
                </div>
              </div>
            </div>

            {/* Bouton Ajouter au calendrier */}
            <Button
              onClick={() => downloadICS(reservation)}
              className="w-full mt-6 premium-button"
            >
              <Download className="w-4 h-4 mr-2" />
              Ajouter au Calendrier
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-8">
            <h3 className="heading-md text-black mb-4">Prochaines Étapes</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  1
                </div>
                <div>
                  <p className="font-semibold text-black">Email de confirmation</p>
                  <p className="text-gray-600 text-sm">
                    Vous recevrez un email avec tous les détails et le lien Zoom
                    pour rejoindre la séance.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  2
                </div>
                <div>
                  <p className="font-semibold text-black">Préparation</p>
                  <p className="text-gray-600 text-sm">
                    Préparez vos questions et objectifs. Pour une séance optimale,
                    arrivez dans un endroit calme avec une connexion stable.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  3
                </div>
                <div>
                  <p className="font-semibold text-black">Le jour J</p>
                  <p className="text-gray-600 text-sm">
                    Connectez-vous 5 minutes avant l'heure prévue via le lien Zoom
                    reçu par email.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Coordonnées */}
          <div className="bg-gold/10 border-2 border-gold rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-black mb-3 flex items-center gap-2">
              <Video className="w-5 h-5 text-gold" />
              Besoin d'aide ?
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Si vous avez des questions ou souhaitez modifier votre réservation,
              contactez-nous:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4 text-gold" />
                <span>contact@andaloussi-coaching.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4 text-gold" />
                <span>+33 6 XX XX XX XX</span>
              </div>
            </div>
          </div>

          {/* Retour accueil */}
          <div className="text-center">
            <Button
              onClick={() => setLocation('/')}
              variant="outline"
              className="border-2 border-black text-black hover:bg-black hover:text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Retour à l'Accueil
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
