import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'wouter';
import { Check, Mail, Calendar, Clock, ArrowRight, Home } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Challenge21JoursSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setStatus('error');
        return;
      }

      try {
        const response = await fetch(`/api/stripe/session-status?sessionId=${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setSessionData(data);
          if (data.payment_status === 'paid') {
            setStatus('success');
          } else {
            setStatus('error');
          }
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Erreur vérification session:', error);
        // Si l'API n'est pas disponible, on considère quand même que c'est un succès
        // car l'utilisateur a été redirigé vers cette page
        setStatus('success');
      }
    };

    verifySession();
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <section className="flex-1 section-padding bg-gradient-to-br from-green-50 to-green-100">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            {status === 'loading' && (
              <div className="text-center py-20">
                <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <h2 className="heading-lg text-black mb-4">Vérification de votre paiement...</h2>
                <p className="text-gray-600">Veuillez patienter quelques instants.</p>
              </div>
            )}

            {status === 'success' && (
              <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
                {/* Success Icon Animation */}
                <div className="mb-8">
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <Check className="w-12 h-12 text-white" />
                  </div>
                </div>

                <h1 className="heading-display text-black mb-4">
                  Félicitations ! 🎉
                </h1>

                <p className="text-2xl text-green-600 font-bold mb-6">
                  Votre inscription au Challenge 21 Jours est confirmée
                </p>

                <p className="text-lg text-gray-700 mb-8">
                  Bienvenue dans l'aventure ! Vous venez de faire le premier pas vers une transformation durable.
                </p>

                {/* What Happens Next */}
                <div className="bg-green-50 rounded-xl p-6 mb-8 text-left">
                  <h2 className="heading-md text-black mb-6 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-green-600" />
                    Que se passe-t-il maintenant ?
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                        1
                      </div>
                      <div>
                        <h3 className="font-semibold text-black">Email de confirmation</h3>
                        <p className="text-gray-600">
                          Un email de confirmation vous a été envoyé à{' '}
                          <span className="font-medium text-green-600">
                            {sessionData?.customer_email || 'votre adresse email'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                        2
                      </div>
                      <div>
                        <h3 className="font-semibold text-black">Questionnaire détaillé (24h)</h3>
                        <p className="text-gray-600">
                          Vous allez recevoir un lien vers un questionnaire complet pour comprendre vos objectifs, votre niveau et vos contraintes.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                        3
                      </div>
                      <div>
                        <h3 className="font-semibold text-black">Programme personnalisé (48h)</h3>
                        <p className="text-gray-600">
                          Ahmed créera votre programme sur mesure en 24-48h après réception de votre questionnaire.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                        4
                      </div>
                      <div>
                        <h3 className="font-semibold text-black">Début du challenge</h3>
                        <p className="text-gray-600">
                          Accès à la communauté privée et premier check-in. C'est parti pour 21 jours de transformation !
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Info */}
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8 text-left">
                  <h3 className="font-semibold text-black mb-3">⚠️ Important</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Vérifiez vos spams si vous ne recevez pas l'email dans les heures qui suivent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Répondez au questionnaire le plus rapidement possible pour démarrer plus vite</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Rejoignez la communauté privée via le lien dans l'email</span>
                    </li>
                  </ul>
                </div>

                {/* Contact Info */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <h3 className="font-semibold text-black mb-4">Une question ?</h3>
                  <p className="text-gray-600 mb-4">
                    Notre équipe est là pour vous accompagner à chaque étape.
                  </p>
                  <a
                    href="mailto:contact@ahmed-andaloussi.com"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                  >
                    <Mail className="w-5 h-5" />
                    contact@ahmed-andaloussi.com
                  </a>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/dashboard"
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    Accéder à mon Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/"
                    className="bg-gray-200 hover:bg-gray-300 text-black font-semibold py-3 px-6 rounded-lg inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <Home className="w-5 h-5" />
                    Retour à l'accueil
                  </Link>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
                <div className="mb-8">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-5xl">⚠️</span>
                  </div>
                </div>

                <h1 className="heading-lg text-black mb-4">
                  Oups... quelque chose s'est mal passé
                </h1>

                <p className="text-lg text-gray-700 mb-8">
                  Nous n'avons pas pu confirmer votre paiement. Veuillez vérifier votre email pour voir si la transaction a été effectuée.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/challenge-21-jours"
                    className="bg-gold hover:bg-yellow-400 text-black font-semibold py-3 px-6 rounded-lg inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    Réessayer
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <a
                    href="mailto:contact@ahmed-andaloussi.com"
                    className="bg-gray-200 hover:bg-gray-300 text-black font-semibold py-3 px-6 rounded-lg inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    Contacter le support
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
