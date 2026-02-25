import { Link } from 'wouter';
import { ArrowRight, Heart, Trophy, Target, Sparkles, Medal, Flame, User } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Parcours() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero Section - Impact émotionnel immédiat */}
      <section className="relative bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-gold/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        
        <div className="container section-padding">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6">
              <span className="text-gold font-semibold text-sm tracking-widest border border-gold/30 px-4 py-2 rounded-full">
                PARCOURS PARALYMPIQUE UNIQUE
              </span>
            </div>

            <h1 className="heading-display text-white mb-6">
              Du drame à l'excellence
            </h1>

            <p className="text-2xl text-gray-300 leading-relaxed mb-8">
              Mon histoire ne commence pas sur un podium, mais au fond d'un lit d'hôpital. 
              C'est là que j'ai appris que les limites n'existent que dans nos têtes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/coaching" className="premium-button inline-flex items-center justify-center gap-2 group">
                Découvrir mon Coaching
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#histoire" className="premium-button-outline inline-flex items-center justify-center gap-2">
                Lire mon histoire
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gold/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-gold rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* CHAPITRE 1: Le jour où tout a changé */}
      <section id="histoire" className="section-padding bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Chapter header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-gold mb-4">
                <Flame className="w-5 h-5" />
                <span className="font-semibold text-sm tracking-widest">CHAPITRE 1</span>
                <Flame className="w-5 h-5" />
              </div>
              <h2 className="heading-display text-black mb-6">
                Le jour où tout a changé
              </h2>
            </div>

            {/* Story content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              {/* Photo placeholder - Avant/Après */}
              <div className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  {/* Placeholder photo avant l'accident */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center p-8">
                      <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-semibold mb-2">Photo avant l'accident</p>
                      <p className="text-sm text-gray-500">Ahmed, sportif passionné</p>
                      <div className="mt-4 inline-block bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
                        PLACEHOLDER - Ahmed fournira
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className="space-y-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl">
                  <p className="text-lg text-gray-700 leading-relaxed italic">
                    "Ce jour-là, en une fraction de seconde, ma vie a basculé. Un accident. 
                    Un diagnostic. Trois mots qui ont résonné comme une sentence : <strong className="text-red-600">'vous ne marcherez plus'.</strong>"
                  </p>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  J'avais 25 ans. Sportif depuis toujours, ma vie était rythmée par l'entraînement, 
                  la compétition, les objectifs. Et soudain, tout s'arrêtait. Plus de course. 
                  Plus de compétition. Plus de... vie "normale".
                </p>

                <p className="text-gray-700 leading-relaxed">
                  Les mois qui ont suivi ont été un tunnel sombre. La colère. Le déni. La dépression. 
                  Je me demandais pourquoi moi. Quelle était cette punition. Je me sentais 
                  incomplet, diminué, fini.
                </p>

                <div className="bg-gold/10 border border-gold/30 p-6 rounded-xl">
                  <p className="text-gold font-semibold text-lg">
                    J'étais au fond du gouffre. Mais c'est souvent dans les ténèbres que l'on 
                    apprend à voir la lumière.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHAPITRE 2: La reconquête */}
      <section className="section-padding bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Chapter header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-gold mb-4">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold text-sm tracking-widest">CHAPITRE 2</span>
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="heading-display text-white mb-6">
                La reconquête
              </h2>
            </div>

            {/* Story content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              {/* Text content */}
              <div className="space-y-6 order-2 lg:order-1">
                <p className="text-xl text-gray-300 leading-relaxed">
                  Le déclic n'est pas arrivé immédiatement. C'est un processus. Un jour à la fois.
                </p>

                <p className="text-gray-300 leading-relaxed">
                  La réadaptation a été mon nouveau "entraînement". Chaque petit pas était une victoire. 
                  Chaque journée où je me levais avec un objectif était un pas vers la liberté.
                </p>

                <p className="text-gray-300 leading-relaxed">
                  J'ai découvert le handisport. Et là, j'ai compris quelque chose de fondamental : 
                  <strong className="text-gold"> le handicap n'est pas une fin, c'est un nouveau départ.</strong>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                    <p className="text-3xl font-bold text-gold mb-1">6 mois</p>
                    <p className="text-sm text-gray-300">de réadaptation intensive</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                    <p className="text-3xl font-bold text-gold mb-1">1er jour</p>
                    <p className="text-sm text-gray-300">retourné au sport</p>
                  </div>
                </div>
              </div>

              {/* Photo placeholder - Réadaptation */}
              <div className="space-y-6 order-1 lg:order-2">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  {/* Placeholder photo réadaptation */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    <div className="text-center p-8">
                      <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-white font-semibold mb-2">Photo réadaptation</p>
                      <p className="text-sm text-gray-400">Premiers pas vers la reconquête</p>
                      <div className="mt-4 inline-block bg-gold text-black text-xs px-3 py-1 rounded-full font-semibold">
                        PLACEHOLDER - Ahmed fournira
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">Ma timeline de reconquête</h3>
              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-32 text-gold font-semibold">Jour 1</div>
                  <div className="flex-1 text-gray-300">Acceptation de ma nouvelle réalité</div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-32 text-gold font-semibold">Semaine 2</div>
                  <div className="flex-1 text-gray-300">Découverte du handisport</div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-32 text-gold font-semibold">Mois 3</div>
                  <div className="flex-1 text-gray-300">Première séance d'entraînement adapté</div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-32 text-gold font-semibold">Mois 6</div>
                  <div className="flex-1 text-gray-300">Première compétition locale</div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-32 text-gold font-semibold">Année 2</div>
                  <div className="flex-1 text-gray-300">Qualification pour les championnats de France</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHAPITRE 3: Aux Jeux Paralympiques */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Chapter header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-gold mb-4">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold text-sm tracking-widest">CHAPITRE 3</span>
                <Trophy className="w-5 h-5" />
              </div>
              <h2 className="heading-display text-black mb-6">
                Aux Jeux Paralympiques
              </h2>
            </div>

            {/* Story content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              {/* Photo placeholder - Jeux Paralympiques */}
              <div className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  {/* Placeholder photo Tokyo 2020 */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-gold/20 to-orange-500/20 flex items-center justify-center border-4 border-gold/30">
                    <div className="text-center p-8">
                      <Medal className="w-16 h-16 text-gold mx-auto mb-4" />
                      <p className="text-black font-bold text-2xl mb-2">TOKYO 2020</p>
                      <p className="text-gray-700 font-semibold mb-2">Jeux Paralympiques</p>
                      <p className="text-sm text-gray-600 mb-4">5ème place - Triathlon PTS4</p>
                      <div className="mt-4 inline-block bg-gold text-black text-xs px-3 py-1 rounded-full font-semibold">
                        PLACEHOLDER - Photo compétition
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <p className="text-2xl font-bold text-gold">5ème</p>
                    <p className="text-xs text-gray-600">Tokyo 2020</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <p className="text-2xl font-bold text-gold">15+</p>
                    <p className="text-xs text-gray-600">Années de sport</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <p className="text-2xl font-bold text-gold">1:03</p>
                    <p className="text-xs text-gray-600">Meilleur temps</p>
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className="space-y-6">
                <p className="text-xl text-gray-700 leading-relaxed font-semibold">
                  Tokyo 2020. Le rêve devenu réalité. Après des années de travail, de sacrifices, 
                  de doutes... j'étais là.
                </p>

                <p className="text-gray-700 leading-relaxed">
                  Rien ne peut décrire l'émotion de marcher derrière le drapeau français, 
                  d'entendre l'hymne national, de sentir l'énergie de milliers de personnes 
                  qui croient en vous.
                </p>

                <p className="text-gray-700 leading-relaxed">
                  Le 5ème place au triathlon PTS4 n'est pas seulement un résultat. C'est la 
                  preuve que <strong className="text-gold">l'impossible n'existe pas</strong>. 
                  C'est la concrétisation d'un parcours que personne n'aurait parié sur moi.
                </p>

                <div className="bg-gradient-to-r from-gold/10 to-orange-500/10 p-6 rounded-xl border-l-4 border-gold">
                  <p className="text-gray-800 italic text-lg">
                    "Être aux Jeux Paralympiques, c'est plus qu'une compétition. C'est un message 
                    envoyé au monde : le handicap ne définit pas qui vous êtes. Vos rêves, 
                    votre détermination, votre courage... ça, c'est ce qui vous définit."
                  </p>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  Cette expérience m'a transformé. J'ai compris que ma place n'était pas seulement 
                  sur le terrain de compétition, mais aussi à côté de ceux qui, comme moi, 
                  voulaient se dépasser.
                </p>
              </div>
            </div>

            {/* Quote section */}
            <div className="bg-black text-white p-12 rounded-3xl text-center">
              <Heart className="w-12 h-12 text-gold mx-auto mb-6" />
              <blockquote className="text-2xl md:text-3xl font-bold mb-6 leading-relaxed">
                "Le plus grand triomphe n'est pas la médaille autour du cou.<br />
                C'est la personne que l'on devient pour l'obtenir."
              </blockquote>
              <p className="text-gold text-lg">— Ahmed Andaloussi</p>
            </div>
          </div>
        </div>
      </section>

      {/* CHAPITRE 4: Ma méthodologie née de l'expérience */}
      <section className="section-padding bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Chapter header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-gold mb-4">
                <Target className="w-5 h-5" />
                <span className="font-semibold text-sm tracking-widest">CHAPITRE 4</span>
                <Target className="w-5 h-5" />
              </div>
              <h2 className="heading-display text-black mb-6">
                Ma méthodologie née de l'expérience
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                15 ans d'expérience paralympique appliqués à votre transformation
              </p>
            </div>

            {/* Connection cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {/* Card 1: Mentalité de champion */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-gold transition-all">
                <div className="w-14 h-14 bg-gold/20 rounded-xl flex items-center justify-center mb-6">
                  <Trophy className="w-7 h-7 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-black mb-4">Mentalité de Champion</h3>
                <p className="text-gray-600 mb-4">
                  Ce que j'ai appris au plus haut niveau de la compétition, je vous l'enseigne :
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">Fixer des objectifs ambitieux mais réalistes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">Transformer les obstacles en opportunités</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">Maintenir la motivation sur la durée</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">Gérer la pression et le stress</span>
                  </li>
                </ul>
              </div>

              {/* Card 2: Approche personnalisée */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-gold transition-all">
                <div className="w-14 h-14 bg-gold/20 rounded-xl flex items-center justify-center mb-6">
                  <User className="w-7 h-7 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-black mb-4">Approche Vraiment Personnalisée</h3>
                <p className="text-gray-600 mb-4">
                  Mon parcours m'a appris que chaque personne est unique. Pas de programmes génériques :
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">Adaptation à vos contraintes physiques</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">Planification progressive pour éviter les blessures</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">Écoute de votre corps et de vos limites</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">Ajustement constant selon votre progression</span>
                  </li>
                </ul>
              </div>

              {/* Card 3: Résilience et persévérance */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-gold transition-all">
                <div className="w-14 h-14 bg-gold/20 rounded-xl flex items-center justify-center mb-6">
                  <Flame className="w-7 h-7 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-black mb-4">La Force de la Résilience</h3>
                <p className="text-gray-600 mb-4">
                  J'ai appris à rebondir quand tout semblait perdu. Cette force, je vous la transmets :
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">Repartir après un échec ou une blessure</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">Célébrer les petites victoires quotidiennes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">Ne jamais abandonner même quand c'est difficile</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">Construire une discipline durable</span>
                  </li>
                </ul>
              </div>

              {/* Card 4: Expertise scientifique */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-gold transition-all">
                <div className="w-14 h-14 bg-gold/20 rounded-xl flex items-center justify-center mb-6">
                  <Sparkles className="w-7 h-7 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-black mb-4">Expertise Certifiée</h3>
                <p className="text-gray-600 mb-4">
                  Mon expérience de terrain complétée par des certifications reconnues :
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">Diplôme d'État en préparation physique</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">Certification en nutrition sportive</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">Formation spécialisée handi-coaching</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">Mise à jour constante des connaissances</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA intermédiaire */}
            <div className="bg-gradient-to-r from-gold to-orange-500 rounded-3xl p-12 text-center text-white">
              <h3 className="text-3xl font-bold mb-4">
                Cette expertise est maintenant la vôtre
              </h3>
              <p className="text-xl mb-8 opacity-90">
                15 ans d'expérience paralympique au service de votre transformation
              </p>
              <Link href="/coaching" className="inline-flex items-center justify-center gap-2 bg-white text-gold px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors">
                Découvrir mes offres de coaching
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CHAPITRE 5: Pourquoi je partage */}
      <section className="section-padding bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Chapter header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-gold mb-4">
                <Heart className="w-5 h-5" />
                <span className="font-semibold text-sm tracking-widest">CHAPITRE 5</span>
                <Heart className="w-5 h-5" />
              </div>
              <h2 className="heading-display text-white mb-6">
                Pourquoi je partage mon histoire
              </h2>
            </div>

            {/* Story content */}
            <div className="space-y-8 mb-16">
              <p className="text-2xl text-gray-300 leading-relaxed text-center">
                Pendant longtemps, j'ai gardé cette histoire pour moi. Mais j'ai compris 
                que partager, c'est aussi <strong className="text-gold">aider les autres</strong> 
                à croire en leurs propres possibilités.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                {/* Reason 1 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-gold">1</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Inspirer</h3>
                  <p className="text-gray-400">
                    Montrer que quel que soit votre point de départ, vous pouvez atteindre 
                    des sommets insoupçonnés
                  </p>
                </div>

                {/* Reason 2 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-gold">2</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Transmettre</h3>
                  <p className="text-gray-400">
                    Partager les leçons apprises à travers mes épreuves pour vous éviter 
                    les mêmes erreurs
                  </p>
                </div>

                {/* Reason 3 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-gold">3</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Accompagner</h3>
                  <p className="text-gray-400">
                    Être le coach que j'aurais rêvé avoir à mes côtés pendant ma reconquête
                  </p>
                </div>
              </div>
            </div>

            {/* Vision statement */}
            <div className="bg-gradient-to-r from-gold/10 to-transparent p-12 rounded-3xl border border-gold/30">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Ma Vision</h3>
              <blockquote className="text-xl text-gray-300 leading-relaxed text-center italic">
                "Je crois que chaque personne a un potentiel illimité en elle. Mon rôle est de 
                vous aider à le révéler. Pas avec des promesses vides, mais avec une méthode 
                éprouvée, de l'empathie authentique, et une croyance inébranlable en votre 
                capacité à vous dépasser."
              </blockquote>
              <p className="text-gold text-lg text-center mt-6 font-semibold">
                — Ahmed Andaloussi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL - Puissant et émotionnel */}
      <section className="section-padding bg-gradient-to-br from-gold via-orange-500 to-gold relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-12 md:p-16 shadow-2xl">
              {/* Emojis pour l'émotion */}
              <div className="text-5xl mb-6">🔥💪🏆</div>

              <h2 className="heading-display text-black mb-6">
                Et vous, quelle sera votre histoire ?
              </h2>

              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Mon histoire commence par un drame et finit par des Jeux Paralympiques. 
                <br />
                La vôtre, je ne la connais pas encore. Mais une chose est sûre :
              </p>

              <p className="text-2xl font-bold text-gold mb-8">
                Ensemble, nous pouvons écrire un chapitre extraordinaire.
              </p>

              <div className="space-y-4 mb-8">
                <p className="text-gray-600">
                  Vous n'avez pas besoin d'être athlète. Vous n'avez pas besoin d'être "spécial". 
                  <br />
                  Vous avez juste besoin d'être <strong>prêt à commencer</strong>.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/reservation" className="premium-button inline-flex items-center justify-center gap-2 group text-lg px-8 py-4">
                  <span>Commencer ma transformation</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/coaching" className="premium-button-outline inline-flex items-center justify-center gap-2 text-lg px-8 py-4 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white">
                  Voir les offres de coaching
                </Link>
              </div>

              {/* Trust elements */}
              <div className="pt-8 mt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4">
                  Appel découverte 100% gratuit • Sans engagement • Réponses à toutes vos questions
                </p>
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-gold" />
                    5ème aux JO Tokyo 2020
                  </span>
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-gold" />
                    Coach diplômé d'État
                  </span>
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-gold" />
                    Accompagnement bienveillant
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery Section - Placeholders pour Ahmed */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="heading-lg text-black text-center mb-4">
              Moments Clés
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">
              Les images qui racontent mon parcours (à venir)
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Photo 1 - Avant */}
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                <div className="text-center p-4">
                  <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 font-semibold">Avant l'accident</p>
                  <div className="mt-2 inline-block bg-gray-800 text-white text-[10px] px-2 py-1 rounded-full">
                    PLACEHOLDER
                  </div>
                </div>
              </div>

              {/* Photo 2 - Réadaptation */}
              <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
                <div className="text-center p-4">
                  <Target className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-xs text-white font-semibold">Réadaptation</p>
                  <div className="mt-2 inline-block bg-gold text-black text-[10px] px-2 py-1 rounded-full">
                    PLACEHOLDER
                  </div>
                </div>
              </div>

              {/* Photo 3 - Tokyo 2020 */}
              <div className="aspect-square bg-gradient-to-br from-gold/30 to-orange-500/30 rounded-xl flex items-center justify-center border-2 border-gold/50">
                <div className="text-center p-4">
                  <Medal className="w-8 h-8 text-gold mx-auto mb-2" />
                  <p className="text-xs text-black font-bold">Tokyo 2020</p>
                  <div className="mt-2 inline-block bg-gold text-black text-[10px] px-2 py-1 rounded-full">
                    PLACEHOLDER
                  </div>
                </div>
              </div>

              {/* Photo 4 - Coaching */}
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <div className="text-center p-4">
                  <Heart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs text-blue-800 font-semibold">Avec mes clients</p>
                  <div className="mt-2 inline-block bg-blue-800 text-white text-[10px] px-2 py-1 rounded-full">
                    PLACEHOLDER
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-gray-500 text-sm mt-8">
              📸 Ahmed fournira les photos authentiques de son parcours
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
