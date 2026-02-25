import { Link } from 'wouter';
import { ArrowRight, Check, Zap, Users, Clock, Award, TrendingUp, Star, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';

// Testimonials data
const testimonials = [
  {
    name: "Sophie M.",
    transformation: "-4kg en 21 jours",
    quote: "Je pensais que 21 jours c'était trop court, mais avec le suivi quotidien d'Ahmed, j'ai complètement changé mes habitudes. Le matin je me sens déjà plus légère et plus énergique!",
    rating: 5
  },
  {
    name: "Thomas P.",
    transformation: "+15% d'énergie",
    quote: "Le meilleur investissement que j'ai fait. 49€ pour 21 jours de coaching avec un athlète paralympien... c'est donné. Les check-ins quotidiens m'ont gardé motivé.",
    rating: 5
  },
  {
    name: "Marie L.",
    transformation: "-3cm de tour de taille",
    quote: "J'ai hésité à cause du prix, mais après ces 21 jours je me dis que j'aurais dû commencer plus tôt. La communauté privée est aussi super motivante!",
    rating: 5
  }
];

// Before/After results
const beforeAfter = [
  {
    before: "Fatigue chronique, pas de motivation",
    after: "Énergie débordante, envie de bouger"
  },
  {
    before: "Habitudes alimentaires chaotiques",
    after: "Nutrition structurée, plaisirs gustatifs"
  },
  {
    before: "Sport = corvée",
    after: "Sport = plaisir et réussite"
  },
  {
    before: "Seul dans mon coin",
    after: "Communauté qui vous booste"
  }
];

export default function Challenge21Jours() {
  const [spotsLeft, setSpotsLeft] = useState(12);
  const [isLoading, setIsLoading] = useState(false);

  // Countdown timer for urgency
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 18,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
          if (minutes < 0) {
            minutes = 59;
            hours--;
            if (hours < 0) {
              hours = 23;
              days--;
              if (days < 0) {
                clearInterval(timer);
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate spots decreasing for social proof
  useEffect(() => {
    const interval = setInterval(() => {
      setSpotsLeft(prev => {
        if (prev > 3 && Math.random() > 0.7) {
          return prev - 1;
        }
        return prev;
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: 'challenge-21-jours',
          price: 49,
          productName: 'Challenge 21 Jours - Ahmed Andaloussi Coaching'
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      // Fallback to reservation page
      window.location.href = '/reservation?offer=challenge-21-jours';
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Urgency Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-3">
        <div className="container">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <AlertCircle className="w-5 h-5 animate-pulse" />
            <span className="font-semibold">
              🔥 OFFRE SPÉCIALE : Plus que <span className="text-yellow-300 font-bold text-xl">{spotsLeft} places</span> disponibles pour ce mois !
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-black text-white overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -z-10" />

        <div className="container section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-block">
                <span className="bg-gold/20 text-gold border border-gold/30 px-4 py-2 rounded-full text-sm font-semibold">
                  ⚡ OFFRE INTRODUCTIVE - ACCÈS LIMITÉ
                </span>
              </div>

              <h1 className="heading-display text-white">
                Challenge 21 Jours
              </h1>

              <p className="text-2xl text-gold font-bold">
                Transformez vos habitudes. Transformez votre vie.
              </p>

              <p className="text-xl text-gray-300 leading-relaxed">
                21 jours pour créer des habitudes qui durent. Programme personnalisé, check-ins quotidiens, communauté privée et coaching direct avec Ahmed Andaloussi, athlète paralympien.
              </p>

              {/* Price Comparison */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gold/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 line-through text-lg">Prix normal : 150€</p>
                    <p className="text-5xl font-bold text-white">49€</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-2xl">-67%</p>
                    <p className="text-gray-400">Économisez 101€</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Satisfait ou remboursé sous 14 jours</span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full md:w-auto bg-gradient-to-r from-gold to-yellow-500 hover:from-yellow-400 hover:to-gold text-black font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold/20"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Chargement...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    👉 REJOINDRE LE CHALLENGE
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </button>

              {/* Urgency Timer */}
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm text-red-300 mb-2">⏰ L'offre expire dans :</p>
                <div className="flex gap-4">
                  {[
                    { value: timeLeft.days, label: 'Jours' },
                    { value: timeLeft.hours, label: 'Heures' },
                    { value: timeLeft.minutes, label: 'Min' },
                    { value: timeLeft.seconds, label: 'Sec' }
                  ].map(({ value, label }) => (
                    <div key={label} className="text-center">
                      <div className="text-2xl font-bold text-white">{String(value).padStart(2, '0')}</div>
                      <div className="text-xs text-gray-400">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-gold" />
                  <span className="text-sm text-gray-300">Athlète Paralympien</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gold" />
                  <span className="text-sm text-gray-300">+500 clients accompagnés</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-gold" />
                  <span className="text-sm text-gray-300">4.9/5 satisfaction</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative h-96 lg:h-full min-h-96 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-orange-500/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-8xl mb-6">💪</div>
                  <p className="text-gold font-bold text-2xl mb-2">21 JOURS</p>
                  <p className="text-white text-xl">Pour changer votre vie</p>
                  <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-gold">21</div>
                      <div className="text-sm text-gray-400">Jours</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gold">∞</div>
                      <div className="text-sm text-gray-400">Support</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gold">1</div>
                      <div className="text-sm text-gray-400">Transformation</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 border-2 border-gold/30 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="section-padding bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-black mb-4">
              Ce que vous obtenez pour 49€
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une valeur totale de 150€, offerte à -67% pour vous permettre de démarrer sans risques
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                title: "Programme Personnalisé",
                description: "Adapté à vos objectifs, votre niveau et vos contraintes. Que vous soyez débutant ou avancé.",
                value: "Valeur: 60€"
              },
              {
                icon: Clock,
                title: "Check-ins Quotidiens",
                description: "Chaque jour, un point sur votre progression, ajustements si nécessaires, motivation garantie.",
                value: "Valeur: 40€"
              },
              {
                icon: Users,
                title: "Communauté Privée",
                description: "Rejoignez un groupe motivé de participants. Échangez, partagez, progressez ensemble.",
                value: "Valeur: 30€"
              },
              {
                icon: Award,
                title: "Coaching Ahmed Direct",
                description: "Accès direct à Ahmed Andaloussi, athlète paralympien. Questions, conseils, support personnalisé.",
                value: "Inestimable"
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-14 h-14 bg-gold/20 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-gold" />
                  </div>
                  <h3 className="heading-md text-black mb-3">{item.title}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <p className="text-sm text-gold font-semibold">{item.value}</p>
                </div>
              );
            })}
          </div>

          {/* Total Value Box */}
          <div className="mt-12 bg-black text-white rounded-xl p-8 text-center">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div>
                <p className="text-gray-400 mb-2">Valeur totale réelle</p>
                <p className="text-4xl font-bold line-through text-gray-500">150€</p>
              </div>
              <div className="hidden md:block w-px h-16 bg-gray-700" />
              <div>
                <p className="text-gray-400 mb-2">Votre prix aujourd'hui</p>
                <p className="text-5xl font-bold text-gold">49€</p>
              </div>
              <div className="hidden md:block w-px h-16 bg-gray-700" />
              <div>
                <p className="text-gray-400 mb-2">Vous économisez</p>
                <p className="text-4xl font-bold text-green-400">101€</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Section */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-black mb-4">
              Avant / Après : Vos résultats en 21 jours
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des transformations concrètes, mesurables et durables
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {beforeAfter.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">✗</span>
                    </div>
                    <h4 className="font-semibold text-red-700">AVANT</h4>
                  </div>
                  <p className="text-gray-700">{item.before}</p>
                </div>
                <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-green-700">APRÈS 21 JOURS</h4>
                  </div>
                  <p className="text-gray-700 font-medium">{item.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-black mb-4">
              Ils ont relevé le défi
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez les résultats de ceux qui ont osé se transformer en 21 jours
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-black">{testimonial.name}</p>
                  <p className="text-gold font-medium">{testimonial.transformation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-black mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Un processus simple, guidé, efficace
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Inscription Express",
                description: "En 2 minutes, vous réservez votre place. Paiement sécurisé, sans engagement."
              },
              {
                step: "02",
                title: "Questionnaire Détaillé",
                description: "Vous recevez un formulaire complet pour comprendre vos objectifs, votre niveau, vos contraintes."
              },
              {
                step: "03",
                title: "Programme Sur Mesure",
                description: "Ahmed crée votre programme personnalisé en 24-48h. Nutrition + entraînement adaptés."
              },
              {
                step: "04",
                title: "Défi de 21 Jours",
                description: "Check-ins quotidiens, communauté active, coaching direct. Vous n'êtes jamais seul."
              },
              {
                step: "05",
                title: "Transformation",
                description: "Bilan final, résultats mesurables, nouvelles habitudes acquises. Vous continuez avec un programme d'entretien."
              }
            ].map((item, index) => (
              <div key={index} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gold text-black rounded-full flex items-center justify-center text-2xl font-bold">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1 pb-8 border-b-2 border-gray-100 last:border-0">
                  <h3 className="heading-md text-black mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="section-padding bg-gradient-to-br from-green-900 to-green-800 text-white">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-6xl mb-6">🛡️</div>
            <h2 className="heading-lg text-white mb-6">
              Garantie Satisfait ou Remboursé
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Essayez le Challenge 21 Jours pendant 14 jours. Si vous n'êtes pas satisfait pour quelque raison que ce soit, 
              envoyez-nous un simple email et nous vous remboursons intégralement. Sans question, sans tracas.
            </p>
            <div className="inline-block bg-white/10 rounded-lg px-6 py-3">
              <p className="font-semibold">0 risque • 100% satisfaction ou remboursé</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section-padding bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="heading-display text-white mb-6">
              Prêt à transformer votre vie en 21 jours ?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Plus que <span className="text-gold font-bold text-2xl">{spotsLeft} places</span> disponibles. 
              L'offre à 49€ est limitée dans le temps. Ne manquez pas cette opportunité.
            </p>

            {/* Final Price Display */}
            <div className="bg-gray-900 rounded-2xl p-8 mb-8 border border-gold/30">
              <div className="flex items-center justify-center gap-8 mb-6">
                <div className="text-center">
                  <p className="text-gray-400 line-through text-lg">Prix normal</p>
                  <p className="text-3xl text-gray-500 line-through">150€</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400">Votre prix</p>
                  <p className="text-5xl font-bold text-gold">49€</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400">Économie</p>
                  <p className="text-3xl text-green-400 font-bold">-67%</p>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full md:w-auto bg-gradient-to-r from-gold to-yellow-500 hover:from-yellow-400 hover:to-gold text-black font-bold py-5 px-12 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold/30"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Chargement...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    🚀 REJOINDRE LE CHALLENGE MAINTENANT
                    <ArrowRight className="w-6 h-6" />
                  </span>
                )}
              </button>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Paiement sécurisé SSL
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Garantie 14 jours
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Sans engagement
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              💳 Tous les paiements sont sécurisés via Stripe. Vos informations sont 100% protégées.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="heading-lg text-black text-center mb-12">
              Questions Fréquentes
            </h2>

            <div className="space-y-6">
              {[
                {
                  q: "Est-ce que 21 jours suffisent vraiment pour voir des résultats ?",
                  a: "Oui ! Les études scientifiques montrent qu'il faut 21 jours pour créer une nouvelle habitude. Nos clients observent des changements visibles dès la 2ème semaine : énergie, motivation, premiers kilos perdus. Après 21 jours, vous avez transformé votre approche pour de bon."
                },
                {
                  q: "Je suis débutant. Le challenge est-il adapté ?",
                  a: "Absolument ! Le programme est 100% personnalisé à votre niveau. Que vous soyez sédentaire ou sportif confirmé, Ahmed adapte chaque exercice et chaque conseil nutritionnel à votre réalité."
                },
                {
                  q: "Pourquoi le prix est-il si bas (49€ au lieu de 150€) ?",
                  a: "C'est une offre d'entrée de gamme pour vous permettre de tester la qualité du coaching sans vous engager à 150€. Notre objectif : vous montrer la valeur du coaching pour que vous continuiez ensuite. C'est gagnant-gagnant !"
                },
                {
                  q: "Que se passe-t-il après les 21 jours ?",
                  a: "Vous aurez acquis des habitudes durables et vu des résultats concrets. Vous pourrez alors continuer avec un pack de coaching classique (3 mois, 6 mois) ou maintenir vos acquis avec le programme d'entretien inclus. Aucun pressure, c'est vous qui décidez."
                },
                {
                  q: "Puis-je me faire rembourser si ça ne me convient pas ?",
                  a: "Oui ! Garantie satisfait ou remboursé pendant 14 jours. Un simple email et vous êtes remboursé à 100%, sans frais caché, sans explication à fournir. Le risque est entièrement de notre côté."
                },
                {
                  q: "Comment se déroulent les check-ins quotidiens ?",
                  a: "Chaque jour, vous recevez un formulaire rapide (5 min max) pour partager votre progression, vos ressentis, vos questions. Ahmed répond personnellement avec ajustements si nécessaires. C'est simple, rapide et ultra-motivant."
                }
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 border-l-4 border-gold">
                  <h3 className="font-semibold text-black mb-3 flex items-center gap-2">
                    <span className="text-gold">Q:</span>
                    {item.q}
                  </h3>
                  <p className="text-gray-700">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
