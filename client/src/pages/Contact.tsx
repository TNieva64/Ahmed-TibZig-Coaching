import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-black text-white section-padding-sm">
        <div className="container">
          <h1 className="heading-lg text-white">Nous Contacter</h1>
          <p className="text-gray-300 mt-2">Des questions ? Une demande spécifique ? Parlons-en !</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <h2 className="heading-md text-black">Informations de Contact</h2>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">Email</h3>
                  <a href="mailto:contact@andaloussicoaching.com" className="text-gray-600 hover:text-gold transition-colors">
                    contact@andaloussicoaching.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">Téléphone</h3>
                  <p className="text-gray-600">
                    Sur demande via le formulaire
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">Localisation</h3>
                  <p className="text-gray-600">
                    Pau, France<br />
                    Coaching en ligne à distance
                  </p>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-gold/10 border-2 border-gold rounded-lg p-6">
                <h3 className="font-semibold text-black mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gold" />
                  Temps de réponse
                </h3>
                <p className="text-gray-700 text-sm">
                  Nous répondons généralement dans les 24 heures. Pour les demandes urgentes, préférez la réservation directe.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <h2 className="heading-md text-black mb-8">Envoyez-nous un Message</h2>

              {submitted ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-black mb-2">Message Envoyé !</h3>
                  <p className="text-gray-600">
                    Merci de nous avoir contactés. Nous vous répondrons sous peu.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Nom complet *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Votre nom"
                      required
                      className="w-full"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                      required
                      className="w-full"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Téléphone
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+33 6 XX XX XX XX"
                      className="w-full"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Sujet *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-gold focus:outline-none bg-white"
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="coaching">Question sur le coaching</option>
                      <option value="partnership">Partenariat</option>
                      <option value="event">Événement / Atelier</option>
                      <option value="media">Demande média</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Décrivez votre demande..."
                      rows={6}
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-gold focus:outline-none resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="premium-button w-full flex items-center justify-center gap-2"
                  >
                    Envoyer le Message
                    <Send className="w-5 h-5" />
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Nous respectons votre vie privée. Vos données ne seront jamais partagées.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-gray-50">
        <div className="container">
          <h2 className="heading-lg text-black text-center mb-12">
            Questions Fréquentes
          </h2>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: 'Proposez-vous des ateliers ou des formations ?',
                a: 'Oui, je propose des ateliers spécialisés et des formations pour les futurs coachs. Contactez-moi pour plus de détails.',
              },
              {
                q: 'Êtes-vous disponible pour des événements ou des conférences ?',
                a: 'Oui, je suis disponible pour des interventions, conférences et événements sportifs. Envoyez-moi votre demande.',
              },
              {
                q: 'Proposez-vous du coaching en groupe ?',
                a: 'Actuellement, je propose du coaching individuel. Les demandes de coaching en groupe sont à discuter au cas par cas.',
              },
              {
                q: 'Quel est votre délai de réponse ?',
                a: 'Je réponds généralement dans les 24 heures. Pour les demandes urgentes, utilisez la réservation directe.',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 border-l-4 border-gold">
                <h3 className="font-semibold text-black mb-3">{item.q}</h3>
                <p className="text-gray-700">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
