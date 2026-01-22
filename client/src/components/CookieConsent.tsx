import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const saveConsentsMutation = trpc.rgpd.saveConsents.useMutation();

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      // Afficher le banner après 1 seconde
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAcceptAll = async () => {
    try {
      await saveConsentsMutation.mutateAsync({
        cookiesAnalytics: true,
        cookiesMarketing: true,
        emailMarketing: false,
        smsMarketing: false,
        ipAddress: undefined,
        userAgent: navigator.userAgent,
      });
      
      localStorage.setItem('cookieConsent', 'all');
      setIsVisible(false);
    } catch (error) {
      console.error('Error saving consents:', error);
    }
  };

  const handleAcceptNecessary = async () => {
    try {
      await saveConsentsMutation.mutateAsync({
        cookiesAnalytics: false,
        cookiesMarketing: false,
        emailMarketing: false,
        smsMarketing: false,
        ipAddress: undefined,
        userAgent: navigator.userAgent,
      });
      
      localStorage.setItem('cookieConsent', 'necessary');
      setIsVisible(false);
    } catch (error) {
      console.error('Error saving consents:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/80 backdrop-blur-sm">
      <Card className="max-w-4xl mx-auto bg-zinc-900 border-zinc-800 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">🍪 Respect de votre vie privée</h3>
            <p className="text-gray-300 text-sm mb-4">
              Nous utilisons des cookies pour améliorer votre expérience sur notre site. 
              Les cookies fonctionnels sont nécessaires au bon fonctionnement de la plateforme. 
              Les cookies analytiques nous aident à comprendre comment vous utilisez le site.
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showDetails && (
          <div className="mb-4 p-4 bg-zinc-800 rounded-lg space-y-3">
            <div>
              <h4 className="font-semibold text-white mb-1">🔒 Cookies Fonctionnels (Obligatoires)</h4>
              <p className="text-gray-400 text-sm">
                Nécessaires pour l'authentification, la sécurité et les fonctionnalités de base.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">📊 Cookies Analytiques (Optionnels)</h4>
              <p className="text-gray-400 text-sm">
                Nous aident à comprendre comment vous utilisez le site pour l'améliorer (Google Analytics, Manus Analytics).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">🎯 Cookies Marketing (Optionnels)</h4>
              <p className="text-gray-400 text-sm">
                Utilisés pour personnaliser les publicités et mesurer leur efficacité.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleAcceptAll}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
            disabled={saveConsentsMutation.isPending}
          >
            ✅ Tout Accepter
          </Button>
          <Button
            onClick={handleAcceptNecessary}
            variant="outline"
            className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
            disabled={saveConsentsMutation.isPending}
          >
            ⚙️ Cookies Nécessaires Uniquement
          </Button>
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            {showDetails ? 'Masquer' : 'Détails'}
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          En continuant à utiliser ce site, vous acceptez notre{' '}
          <a href="/politique-confidentialite" className="text-yellow-500 hover:underline">
            Politique de Confidentialité
          </a>{' '}
          et nos{' '}
          <a href="/conditions-generales" className="text-yellow-500 hover:underline">
            Conditions Générales
          </a>
          .
        </p>
      </Card>
    </div>
  );
}
