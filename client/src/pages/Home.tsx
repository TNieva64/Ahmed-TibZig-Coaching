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
                <Link href="/reservation">
                  <a className="premium-button inline-flex items-center justify-center gap-2 group">
                    Réserver mon Bilan Gratuit
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Link>
                <Link href="/coaching">
                  <a className="premium-button-outline inline-flex items-center justify-center gap-2">
                    Découvrir les Offres
                  </a>
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
            <div className="relative h-96 lg:h-full min-h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-transparent rounded-2xl" />
              <div className="absolute inset-0 border-2 border-gold/30 rounded-2xl" />
              
              {/* Placeholder for image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-gold/50 mb-4">AC</div>
                  <p className="text-gray-400 text-sm">Photo du profil à ajouter</p>
                </div>
              </div>
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
            <Link href="/coaching#transformation">
              <a className="group">
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
              </a>
            </Link>

            {/* Pillar 2: Performance */}
            <Link href="/coaching#performance">
              <a className="group">
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
              </a>
            </Link>

            {/* Pillar 3: Inclusif */}
            <Link href="/coaching#inclusif">
              <a className="group">
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
              </a>
            </Link>
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
          <Link href="/reservation">
            <a className="premium-button inline-flex items-center justify-center gap-2 group">
              Réserver Maintenant
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
