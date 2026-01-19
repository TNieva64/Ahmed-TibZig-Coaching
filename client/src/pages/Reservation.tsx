import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Calendar, Clock, User, Mail, Phone } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Reservation() {
  const [step, setStep] = useState<'type' | 'calendar' | 'form'>('type');
  const [selectedType, setSelectedType] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const coachingTypes = [
    {
      id: 'discovery',
      title: 'Appel Découverte',
      description: 'Gratuit - 30 minutes',
      details: 'Discutons de vos objectifs et trouvons le programme idéal pour vous.',
      price: 'Gratuit',
    },
    {
      id: 'session',
      title: 'Séance de Coaching',
      description: 'Payant - 45 minutes',
      details: 'Une séance complète de coaching personnalisé avec suivi et conseils.',
      price: '79€',
    },
    {
      id: 'consultation',
      title: 'Consultation Spécialisée',
      description: 'Payant - 60 minutes',
      details: 'Consultation approfondie pour les demandes complexes ou partenariats.',
      price: '129€',
    },
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00',
  ];

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    alert('Merci ! Nous vous recontacterons sous peu.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-black text-white section-padding-sm">
        <div className="container">
          <h1 className="heading-lg text-white">Réservez Votre Coaching</h1>
          <p className="text-gray-300 mt-2">Choisissez le type de séance et trouvez un créneau qui vous convient.</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container max-w-4xl">
          {/* Step 1: Select Type */}
          {step === 'type' && (
            <div>
              <h2 className="heading-md text-black mb-8">Étape 1 : Choisissez votre type de séance</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {coachingTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      setStep('calendar');
                    }}
                    className={`text-left p-6 rounded-xl border-2 transition-all duration-300 ${
                      selectedType === type.id
                        ? 'border-gold bg-gold/5'
                        : 'border-gray-200 hover:border-gold'
                    }`}
                  >
                    <h3 className="heading-md text-black mb-2">{type.title}</h3>
                    <p className="text-gold font-semibold text-sm mb-3">{type.description}</p>
                    <p className="text-gray-600 text-sm mb-4">{type.details}</p>
                    <p className="text-2xl font-bold text-black">{type.price}</p>
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep('calendar')}
                  disabled={!selectedType}
                  className="premium-button"
                >
                  Continuer <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 'calendar' && (
            <div>
              <button
                onClick={() => setStep('type')}
                className="text-gold hover:text-black transition-colors mb-6 flex items-center gap-2"
              >
                ← Retour
              </button>

              <h2 className="heading-md text-black mb-8">
                Étape 2 : Choisissez une date et une heure
              </h2>

              <div className="bg-gray-50 rounded-xl p-8 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Calendar */}
                  <div>
                    <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gold" />
                      Sélectionnez une date
                    </h3>
                    <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                      <p className="text-gray-600 text-center py-8">
                        Calendrier interactif à intégrer (Calendly ou custom)
                      </p>
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gold" />
                      Créneaux disponibles
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          className="py-2 px-3 rounded-lg border-2 border-gray-200 hover:border-gold hover:bg-gold/5 transition-all text-sm font-medium text-gray-700"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('type')}
                  className="px-8 py-3 border-2 border-gold text-gold rounded-lg hover:bg-gold/5 transition-colors font-semibold"
                >
                  Retour
                </button>
                <Button
                  onClick={() => setStep('form')}
                  className="premium-button"
                >
                  Continuer <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Form */}
          {step === 'form' && (
            <div>
              <button
                onClick={() => setStep('calendar')}
                className="text-gold hover:text-black transition-colors mb-6 flex items-center gap-2"
              >
                ← Retour
              </button>

              <h2 className="heading-md text-black mb-8">
                Étape 3 : Vos Informations de Contact
              </h2>

              <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-8 mb-8">
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2 flex items-center gap-2">
                      <User className="w-4 h-4 text-gold" />
                      Nom complet *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="Votre nom"
                      required
                      className="w-full"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gold" />
                      Email *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="votre@email.com"
                      required
                      className="w-full"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gold" />
                      Téléphone
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="+33 6 XX XX XX XX"
                      className="w-full"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Message (optionnel)
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleFormChange}
                      placeholder="Parlez-moi de vos objectifs..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-gold focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => setStep('calendar')}
                    className="px-8 py-3 border-2 border-gold text-gold rounded-lg hover:bg-gold/5 transition-colors font-semibold"
                  >
                    Retour
                  </button>
                  <Button
                    type="submit"
                    className="premium-button"
                  >
                    Confirmer la Réservation <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>

              <div className="bg-gold/10 border-2 border-gold rounded-xl p-6">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-black">Note :</span> Vous recevrez une confirmation par email avec les détails de votre séance et le lien Zoom.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="section-padding bg-gray-50">
        <div className="container">
          <h2 className="heading-md text-black text-center mb-12">
            Comment Ça Marche ?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Choisissez',
                description: 'Sélectionnez le type de séance qui vous convient.',
              },
              {
                step: '2',
                title: 'Réservez',
                description: 'Choisissez une date et une heure disponible.',
              },
              {
                step: '3',
                title: 'Confirmez',
                description: 'Remplissez vos informations de contact.',
              },
              {
                step: '4',
                title: 'Commencez',
                description: 'Recevez le lien Zoom et démarrez votre coaching !',
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 bg-gold text-black rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-black mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
