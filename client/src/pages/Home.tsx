import { Link } from 'wouter';
import { ArrowRight, Award, Users, Zap } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-black text-white overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl -z-10" />
        
        <div className="container section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-block">
                <span className="text-gold font-semibold text-sm tracking-widest">
                  ATHLÈTE PARALYMPIEN • COACH CERTIFIÉ
                </span>
              </div>

              <h1 className="heading-display text-white">
                Transformez votre potentiel
              </h1>

              <p className="text-xl text-gray-300 leading-relaxed">
                Coaching sportif en ligne personnalisé. De la transformation physique à la performance d'élite, je vous accompagne vers vos objectifs avec l'expertise d'un athlète de haut niveau.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/reservation" className="premium-button inline-flex items-center justify-center gap-2 group">
                  Réserver mon Bilan Gratuit
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/coaching" className="premium-button-outline inline-flex items-center justify-center gap-2">
                  Découvrir les Offres
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6 pt-8 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-gold" />
                  <span className="text-sm text-gray-300">5ème aux JO Tokyo 2020</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gold" />
                  <span className="text-sm text-gray-300">Coaching Inclusif</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative h-96 lg:h-full min-h-96 rounded-2xl overflow-hidden">
              <img 
                src="/ahmed-profile.jpg" 
                alt="Ahmed Andaloussi - Athéte Paralympien" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-2 border-gold/30 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="section-padding bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-black mb-4">
              Trois Piliers de Coaching
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Quel que soit votre objectif, je vous propose un accompagnement adapté à votre situation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1: Transformation */}
            <Link href="/coaching#transformation" className="group block">
              <div className="bg-white rounded-xl p-8 border-2 border-transparent hover:border-gold transition-all duration-300 h-full">
                <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-gold/30 transition-colors">
                  <Zap className="w-6 h-6 text-gold" />
                </div>
                <h3 className="heading-md text-black mb-3">Transformation</h3>
                <p className="text-gray-600 mb-4">
                  Perte de poids, prise de masse, remise en forme. Atteindre votre silhouette idéale avec un suivi personnalisé.
                </p>
                <div className="text-gold font-semibold text-sm group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                  En savoir plus <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* Pillar 2: Performance */}
            <Link href="/coaching#performance" className="group block">
              <div className="bg-white rounded-xl p-8 border-2 border-gold shadow-lg">
                <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center mb-6">
                  <Award className="w-6 h-6 text-gold" />
                </div>
                <h3 className="heading-md text-black mb-3">Performance</h3>
                <p className="text-gray-600 mb-4">
                  Triathlon, Marathon, Hyrox. Préparez-vous comme un athlète d'élite pour vos compétitions.
                </p>
                <div className="text-gold font-semibold text-sm group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                  En savoir plus <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* Pillar 3: Inclusif */}
            <Link href="/coaching#inclusif" className="group block">
              <div className="bg-white rounded-xl p-8 border-2 border-transparent hover:border-gold transition-all duration-300 h-full">
                <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-gold/30 transition-colors">
                  <Users className="w-6 h-6 text-gold" />
                </div>
                <h3 className="heading-md text-black mb-3">Coaching Inclusif</h3>
                <p className="text-gray-600 mb-4">
                  Handi-coaching adapté à votre réalité. Mon expertise de paralympien pour votre progression.
                </p>
                <div className="text-gold font-semibold text-sm group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                  En savoir plus <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-black mb-4">
              Ils Ont Transformé Leur Vie
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez les résultats concrets de mes clients qui ont atteint leurs objectifs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Témoignage 1 */}
            <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 hover:border-gold transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                  SM
                </div>
                <div>
                  <h4 className="font-bold text-black">Sophie M.</h4>
                  <p className="text-sm text-gray-600">Transformation - 6 mois</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-gold">★</span>
                  ))}
                </div>
                <p className="text-gray-700 italic">
                  "J'ai perdu 18kg en 6 mois tout en gagnant en énergie. Le suivi personnalisé d'Ahmed et ses conseils nutrition ont tout changé. Je me sens enfin bien dans mon corps !"
                </p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-gold font-bold">-18kg</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-gold font-bold">-12cm</span>
                  <span className="text-gray-600 ml-1">tour de taille</span>
                </div>
              </div>
            </div>

            {/* Témoignage 2 */}
            <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 hover:border-gold transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                  JL
                </div>
                <div>
                  <h4 className="font-bold text-black">Julien L.</h4>
                  <p className="text-sm text-gray-600">Performance - 4 mois</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-gold">★</span>
                  ))}
                </div>
                <p className="text-gray-700 italic">
                  "En préparation pour mon premier marathon, Ahmed m'a aidé à structurer mon entraînement. Résultat : 3h42 alors que je visais 4h ! Son expertise fait vraiment la différence."
                </p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-gold font-bold">3h42</span>
                  <span className="text-gray-600 ml-1">marathon</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-gold font-bold">-18min</span>
                  <span className="text-gray-600 ml-1">vs objectif</span>
                </div>
              </div>
            </div>

            {/* Témoignage 3 */}
            <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 hover:border-gold transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                  MC
                </div>
                <div>
                  <h4 className="font-bold text-black">Marie C.</h4>
                  <p className="text-sm text-gray-600">Prise de masse - 5 mois</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-gold">★</span>
                  ))}
                </div>
                <p className="text-gray-700 italic">
                  "Après des années à stagner, j'ai enfin pris 6kg de muscle sec grâce au programme d'Ahmed. Ses plans d'entraînement et conseils nutrition sont ultra précis. Je suis plus forte que jamais !"
                </p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-gold font-bold">+6kg</span>
                  <span className="text-gray-600 ml-1">muscle</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-gold font-bold">+35%</span>
                  <span className="text-gray-600 ml-1">force</span>
                </div>
              </div>
            </div>

            {/* Témoignage 4 */}
            <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 hover:border-gold transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                  PD
                </div>
                <div>
                  <h4 className="font-bold text-black">Pierre D.</h4>
                  <p className="text-sm text-gray-600">Handi-coaching - 8 mois</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-gold">★</span>
                  ))}
                </div>
                <p className="text-gray-700 italic">
                  "En fauteuil roulant depuis 3 ans, je pensais que le sport était derrière moi. Ahmed a adapté chaque exercice à ma situation. Aujourd'hui je participe à des compétitions handisport !"
                </p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-gold font-bold">1ère</span>
                  <span className="text-gray-600 ml-1">compétition</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-gold font-bold">+200%</span>
                  <span className="text-gray-600 ml-1">confiance</span>
                </div>
              </div>
            </div>

            {/* Témoignage 5 */}
            <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 hover:border-gold transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                  LB
                </div>
                <div>
                  <h4 className="font-bold text-black">Laura B.</h4>
                  <p className="text-sm text-gray-600">Remise en forme - 3 mois</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-gold">★</span>
                  ))}
                </div>
                <p className="text-gray-700 italic">
                  "Après ma grossesse, je voulais retrouver ma forme sans pression. Le coaching en ligne d'Ahmed était parfait : flexible, bienveillant et efficace. Je suis de retour à mon poids d'avant bébé !"
                </p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-gold font-bold">-12kg</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-gold font-bold">100%</span>
                  <span className="text-gray-600 ml-1">post-partum</span>
                </div>
              </div>
            </div>

            {/* Témoignage 6 */}
            <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 hover:border-gold transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                  TM
                </div>
                <div>
                  <h4 className="font-bold text-black">Thomas M.</h4>
                  <p className="text-sm text-gray-600">Transformation - 10 mois</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-gold">★</span>
                  ))}
                </div>
                <p className="text-gray-700 italic">
                  "De 105kg à 78kg, j'ai complètement transformé mon corps et mon mental. Ahmed ne se contente pas de donner des exercices, il transmet sa passion et sa détermination. Merci pour tout !"
                </p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-gold font-bold">-27kg</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-gold font-bold">-20cm</span>
                  <span className="text-gray-600 ml-1">tour de taille</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats globales */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-gold mb-2">250+</div>
              <div className="text-gray-600">Clients Accompagnés</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gold mb-2">98%</div>
              <div className="text-gray-600">Taux de Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gold mb-2">-15kg</div>
              <div className="text-gray-600">Perte Moyenne</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gold mb-2">6 mois</div>
              <div className="text-gray-600">Durée Moyenne</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-black text-white">
        <div className="container text-center">
          <h2 className="heading-lg text-white mb-6">
            Prêt à Commencer Votre Transformation ?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Réservez votre appel découverte gratuit pour discuter de vos objectifs et trouver le programme idéal.
          </p>
          <Link href="/reservation" className="premium-button inline-flex items-center justify-center gap-2 group">
            Réserver Maintenant
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
