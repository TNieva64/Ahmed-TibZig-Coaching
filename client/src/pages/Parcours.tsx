import { Link } from 'wouter';
import { ArrowRight, Trophy, Award, BookOpen, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Parcours() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-black text-white section-padding">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="heading-display text-white mb-6">Mon Parcours</h1>
            <p className="text-xl text-gray-300">
              De la passion pour le sport à l'expertise du coaching. Mon histoire est celle d'une détermination sans limite et d'une volonté de transmettre.
            </p>
          </div>
        </div>
      </section>

      {/* Main Story Section */}
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div>
                <h2 className="heading-md text-black mb-4">
                  Athlète Paralympien
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Paratriathlète depuis plus de 15 ans, j'ai participé aux Jeux Paralympiques de Tokyo 2020 où j'ai terminé 5ème au triathlon. Cette expérience m'a enseigné que le dépassement de soi n'a pas de limites, qu'elles soient physiques ou mentales.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Mon parcours m'a permis de comprendre les défis uniques de la performance sportive, la gestion de la fatigue, la nutrition d'élite, et surtout la mentalité gagnante nécessaire pour atteindre l'excellence.
                </p>
              </div>

              <div className="pt-4">
                <h2 className="heading-md text-black mb-4">
                  Coach Professionnel Certifié
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Diplômé d'État en préparation physique et coaching sportif, je combine mon expérience d'athlète avec une formation rigoureuse en sciences du sport. Mes certifications me permettent de proposer un accompagnement sécurisé et efficace.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Spécialisé en handi-coaching, j'adapte mes méthodes à chaque personne, qu'elle soit valide ou en situation de handicap. L'inclusivité n'est pas une option, c'est une conviction.
                </p>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative h-96 lg:h-full min-h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-transparent rounded-2xl" />
              <div className="absolute inset-0 border-2 border-gold/30 rounded-2xl" />
              
              {/* Placeholder for image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Trophy className="w-24 h-24 text-gold/50 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm">Photo du parcours à ajouter</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials Section */}
      <section className="section-padding bg-gray-50">
        <div className="container">
          <h2 className="heading-lg text-black text-center mb-12">
            Crédibilités et Certifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Credential 1 */}
            <div className="bg-white rounded-xl p-8 border-l-4 border-gold">
              <div className="flex items-start gap-4">
                <Award className="w-8 h-8 text-gold flex-shrink-0 mt-1" />
                <div>
                  <h3 className="heading-md text-black mb-2">
                    Jeux Paralympiques Tokyo 2020
                  </h3>
                  <p className="text-gray-600">
                    5ème place au triathlon paralympique. Représentant de la France au plus haut niveau de la compétition sportive.
                  </p>
                </div>
              </div>
            </div>

            {/* Credential 2 */}
            <div className="bg-white rounded-xl p-8 border-l-4 border-gold">
              <div className="flex items-start gap-4">
                <BookOpen className="w-8 h-8 text-gold flex-shrink-0 mt-1" />
                <div>
                  <h3 className="heading-md text-black mb-2">
                    Diplômé d'État
                  </h3>
                  <p className="text-gray-600">
                    Certification professionnelle en préparation physique et coaching sportif. Formation continue en nutrition sportive et handi-coaching.
                  </p>
                </div>
              </div>
            </div>

            {/* Credential 3 */}
            <div className="bg-white rounded-xl p-8 border-l-4 border-gold">
              <div className="flex items-start gap-4">
                <Trophy className="w-8 h-8 text-gold flex-shrink-0 mt-1" />
                <div>
                  <h3 className="heading-md text-black mb-2">
                    Expertise Multisports
                  </h3>
                  <p className="text-gray-600">
                    Spécialisé en triathlon, marathon, Hyrox et sports d'endurance. Expérience en perte de poids et prise de masse musculaire.
                  </p>
                </div>
              </div>
            </div>

            {/* Credential 4 */}
            <div className="bg-white rounded-xl p-8 border-l-4 border-gold">
              <div className="flex items-start gap-4">
                <Users className="w-8 h-8 text-gold flex-shrink-0 mt-1" />
                <div>
                  <h3 className="heading-md text-black mb-2">
                    Handi-Coaching Certifié
                  </h3>
                  <p className="text-gray-600">
                    Formation spécialisée en accompagnement des personnes en situation de handicap. Approche inclusive et adaptée.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="section-padding bg-black text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="heading-lg text-white mb-8">
              Ma Philosophie de Coaching
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              Je crois que chaque personne possède un potentiel illimité. Mon rôle n'est pas de vous imposer un programme générique, mais de construire avec vous un accompagnement personnalisé qui respecte votre réalité, vos contraintes et vos rêves.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              Que vous soyez débutant cherchant une transformation ou athlète visant l'excellence, je vous offre l'expertise d'un champion et l'empathie d'une personne qui a surmonté ses propres défis.
            </p>
            <p className="text-lg text-gold font-semibold">
              Ensemble, construisons votre changement.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gray-50">
        <div className="container text-center">
          <h2 className="heading-lg text-black mb-6">
            Prêt à Commencer ?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Réservez votre appel découverte gratuit pour discuter de vos objectifs.
          </p>
          <Link href="/reservation">
            <a className="premium-button inline-flex items-center justify-center gap-2 group">
              Réserver mon Bilan Gratuit
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
