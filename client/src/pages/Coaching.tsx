import { Link } from 'wouter';
import { ArrowRight, Check, Zap, Award, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Coaching() {
  const coachingPillars = [
    {
      id: 'transformation',
      title: 'Transformation',
      subtitle: 'Perte de poids • Prise de masse • Remise en forme',
      description: 'Atteignez votre silhouette idéale avec un suivi personnalisé et les méthodes d\'un athlète de haut niveau.',
      icon: Zap,
      color: 'from-gold/20 to-transparent',
      features: [
        'Appel Découverte inclus',
        'Planification nutritionnelle',
        'Programme d\'entraînement adapté',
        'Suivi hebdomadaire',
        'Ajustements progressifs',
      ],
    },
    {
      id: 'performance',
      title: 'Performance',
      subtitle: 'Triathlon • Marathon • Hyrox',
      description: 'Préparez-vous comme un athlète d\'élite pour vos compétitions avec un coaching spécialisé.',
      icon: Award,
      color: 'from-gold/30 to-transparent',
      features: [
        'Analyse de votre niveau',
        'Planification d\'entraînement périodisée',
        'Stratégie nutritionnelle de compétition',
        'Préparation mentale',
        'Suivi technique et physiologique',
      ],
    },
    {
      id: 'inclusif',
      title: 'Coaching Inclusif',
      subtitle: 'Handi-coaching • Adaptation personnalisée',
      description: 'Mon expertise de paralympien pour un accompagnement adapté à votre réalité et vos objectifs.',
      icon: Users,
      color: 'from-gold/20 to-transparent',
      features: [
        'Évaluation adaptée',
        'Programme sur mesure',
        'Respect de vos contraintes',
        'Progression garantie',
        'Soutien bienveillant',
      ],
    },
  ];

  const packs = [
    {
      name: '1 Mois',
      duration: '4 semaines',
      price: '199',
      popular: false,
      features: [
        'Appel Découverte inclus',
        '4 séances de coaching',
        'Plan d\'entraînement personnalisé',
        'Support par email',
        'Accès aux ressources',
      ],
    },
    {
      name: '3 Mois',
      duration: '12 semaines',
      price: '499',
      popular: true,
      features: [
        'Appel Découverte inclus',
        '12 séances de coaching',
        'Plan d\'entraînement évolutif',
        'Support prioritaire',
        'Accès aux ressources',
        'Ajustements progressifs',
        'Suivi intermédiaire',
      ],
    },
    {
      name: '6 Mois',
      duration: '24 semaines',
      price: '899',
      popular: false,
      features: [
        'Appel Découverte inclus',
        '24 séances de coaching',
        'Suivi complet et détaillé',
        'Support prioritaire 24/7',
        'Accès aux ressources',
        'Ajustements continus',
        'Suivis mensuels',
        'Garantie de résultats',
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-black text-white section-padding">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="heading-display text-white mb-6">Coaching en Ligne</h1>
            <p className="text-xl text-gray-300">
              Trois piliers d'expertise pour répondre à vos objectifs, quel que soit votre niveau ou votre situation.
            </p>
          </div>
        </div>
      </section>

      {/* Three Pillars Detail Section */}
      <section className="section-padding">
        <div className="container">
          {coachingPillars.map((pillar, index) => {
            const Icon = pillar.icon;
            const isEven = index % 2 === 0;

            return (
              <div
                key={pillar.id}
                id={pillar.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20 last:mb-0 ${
                  !isEven ? 'lg:grid-cols-2 lg:[&>*:first-child]:order-2' : ''
                }`}
              >
                {/* Content */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-gold" />
                    </div>
                    <h2 className="heading-lg text-black">{pillar.title}</h2>
                  </div>

                  <p className="text-gold font-semibold text-sm tracking-wide">
                    {pillar.subtitle}
                  </p>

                  <p className="text-lg text-gray-700 leading-relaxed">
                    {pillar.description}
                  </p>

                  <div className="space-y-3 pt-4">
                    {pillar.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/reservation" className="premium-button inline-flex items-center justify-center gap-2 group mt-6">
                    Découvrir les Packs
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Visual */}
                <div className="relative h-96 lg:h-full min-h-96">
                  <div className={`absolute inset-0 bg-gradient-to-br ${pillar.color} rounded-2xl`} />
                  <div className="absolute inset-0 border-2 border-gold/30 rounded-2xl" />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Icon className="w-24 h-24 text-gold/50 mx-auto mb-4" />
                      <p className="text-gray-400 text-sm">Illustration à ajouter</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section-padding bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-black mb-4">
              Nos Packs de Coaching
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choisissez la durée qui correspond à vos objectifs. Tous les packs incluent un Appel Découverte.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packs.map((pack, index) => (
              <div
                key={index}
                className={`rounded-xl overflow-hidden transition-all duration-300 ${
                  pack.popular
                    ? 'ring-2 ring-gold shadow-2xl scale-105'
                    : 'border-2 border-gray-200 hover:border-gold'
                }`}
              >
                {/* Header */}
                <div className={`p-8 ${pack.popular ? 'bg-black text-white' : 'bg-white'}`}>
                  {pack.popular && (
                    <div className="inline-block bg-gold text-black px-3 py-1 rounded-full text-xs font-semibold mb-4">
                      POPULAIRE
                    </div>
                  )}
                  <h3 className="heading-md mb-2">{pack.name}</h3>
                  <p className={pack.popular ? 'text-gray-300' : 'text-gray-600'}>
                    {pack.duration}
                  </p>
                </div>

                {/* Price */}
                <div className={`px-8 py-6 ${pack.popular ? 'bg-gold text-black' : 'bg-white'}`}>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{pack.price}€</span>
                    <span className={pack.popular ? 'text-black/70' : 'text-gray-600'}>
                      / mois
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className={`p-8 ${pack.popular ? 'bg-black text-white' : 'bg-white'}`}>
                  <ul className="space-y-4 mb-8">
                    {pack.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${pack.popular ? 'text-gold' : 'text-gold'}`} />
                        <span className={pack.popular ? 'text-gray-200' : 'text-gray-700'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/reservation"
                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 text-center block ${
                      pack.popular
                        ? 'bg-gold text-black hover:bg-white'
                        : 'bg-black text-white hover:bg-gold hover:text-black'
                    }`}
                  >
                    Choisir ce Pack
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-white">
        <div className="container">
          <h2 className="heading-lg text-black text-center mb-12">
            Questions Fréquentes
          </h2>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: 'Comment fonctionnent les séances de coaching ?',
                a: 'Les séances se déroulent par visioconférence. Nous discutons de votre progression, ajustons votre programme et répondons à vos questions. Chaque séance dure environ 30-45 minutes.',
              },
              {
                q: 'Puis-je changer de pack pendant mon coaching ?',
                a: 'Oui, vous pouvez passer à un pack supérieur à tout moment. La différence sera ajustée proportionnellement.',
              },
              {
                q: 'Avez-vous une garantie de résultats ?',
                a: 'Oui, pour le pack 6 mois. Si vous suivez le programme à 100%, vous verrez des résultats mesurables. Sinon, nous ajustons votre approche.',
              },
              {
                q: 'Quel est le délai pour voir les premiers résultats ?',
                a: 'Les premiers changements sont visibles après 3-4 semaines. Les résultats significatifs apparaissent après 8-12 semaines de suivi régulier.',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-6 border-l-4 border-gold">
                <h3 className="font-semibold text-black mb-3">{item.q}</h3>
                <p className="text-gray-700">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-black text-white">
        <div className="container text-center">
          <h2 className="heading-lg text-white mb-6">
            Prêt à Transformer Votre Vie ?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Réservez votre Appel Découverte. Pas d'engagement, juste une conversation pour trouver la meilleure solution pour vous.
          </p>
          <Link href="/reservation" className="premium-button inline-flex items-center justify-center gap-2 group">
            Réserver mon Appel Découverte
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
