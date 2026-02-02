/**
 * Composant - Bouton d'aide flottant
 *
 * Bouton d'aide toujours visible pour les utilisateurs
 * Aligné avec la philosophie bienveillante : support facile et accessible
 */

import { useState } from 'react';
import { HelpCircle, X, Search, Mail, Phone, Book } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const faqItems = [
    {
      category: 'Commencer',
      items: [
        {
          q: 'Comment créer mon premier workout ?',
          a: 'Allez dans "Programmes", choisissez votre programme, puis cliquez sur "Nouvelle séance". Suivez les instructions pas à pas.',
          icon: <Book className="w-4 h-4" />,
        },
        {
          q: 'Comment logger mon repas ?',
          a: 'Dans "Nutrition", cliquez sur "Ajouter un repas". Sélectionnez le type de repas et les aliments consommés.',
          icon: <Book className="w-4 h-4" />,
        },
      ],
    },
    {
      category: 'Compte',
      items: [
        {
          q: 'Comment modifier mon profil ?',
          a: 'Cliquez sur votre avatar en haut à droite, puis "Mon profil". Modifiez vos informations et sauvegardez.',
          icon: <Search className="w-4 h-4" />,
        },
        {
          q: 'Comment supprimer mon compte ?',
          a: 'Pour des raisons de sécurité, contactez-nous par email : contact@andaloussicoaching.com',
          icon: <Mail className="w-4 h-4" />,
        },
      ],
    },
    {
      category: 'Problèmes',
      items: [
        {
          q: 'Je ne peux pas me connecter',
          a: '1. Vérifiez votre email\n2. Cliquez sur "Mot de passe oublié"\n3. Essayez en navigation privée\nToujours bloqué ? Contactez le support.',
          icon: <Search className="w-4 h-4" />,
        },
        {
          q: 'L\'application est lente',
          a: 'Vérifiez votre connexion internet. Si le problème persiste, contactez-nous.',
          icon: <Search className="w-4 h-4" />,
        },
      ],
    },
  ];

  const contactOptions = [
    {
      title: 'Email',
      description: 'Réponse sous 24h',
      value: 'contact@andaloussicoaching.com',
      icon: <Mail className="w-5 h-5" />,
      href: 'mailto:contact@andaloussicoaching.com',
    },
    {
      title: 'FAQ',
      description: 'Questions fréquentes',
      icon: <Book className="w-5 h-5" />,
      href: '/faq',
    },
  ];

  const filteredFaqs = faqItems.flatMap(category => 
    category.items.filter(item =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Besoin d'aide ?"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <HelpCircle className="w-6 h-6" />
        )}
      </button>

      {/* Panel d'aide */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="bg-zinc-900 border-zinc-800 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Besoin d'aide ? 🤗
                  </h2>
                  <p className="text-gray-400">
                    On est là pour vous. Cherchez ou contactez-nous.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher dans l'aide..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Résultats de recherche ou FAQ complète */}
              {searchQuery ? (
                filteredFaqs.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Résultats de recherche
                    </h3>
                    {filteredFaqs.map((item, index) => (
                      <div key={index} className="p-4 bg-zinc-800 rounded-lg">
                        <h4 className="font-medium text-white mb-2">{item.q}</h4>
                        <p className="text-sm text-gray-300 whitespace-pre-line">{item.a}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">
                      Aucun résultat pour "{searchQuery}"
                    </p>
                    <Button
                      variant="link"
                      onClick={() => setSearchQuery('')}
                      className="text-yellow-500"
                    >
                      Voir toute l'aide
                    </Button>
                  </div>
                )
              ) : (
                <>
                  {/* Message de bienvenue */}
                  <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-white">
                      💚 <strong>Bienvenue sur l'aide !</strong> Ici, pas de question bête.
                      Trouvez une réponse ou contactez-nous directement.
                    </p>
                  </div>

                  {/* FAQ par catégorie */}
                  {faqItems.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="space-y-3">
                      <h3 className="text-lg font-semibold text-white">
                        {category.category}
                      </h3>
                      <div className="space-y-2">
                        {category.items.map((item, itemIndex) => (
                          <details
                            key={itemIndex}
                            className="group bg-zinc-800 rounded-lg overflow-hidden"
                          >
                            <summary className="flex items-center gap-2 p-3 cursor-pointer hover:bg-zinc-700 transition-colors">
                              {item.icon}
                              <span className="flex-1 text-left text-white font-medium">
                                {item.q}
                              </span>
                            </summary>
                            <div className="p-3 pt-0 text-sm text-gray-300">
                              {item.a}
                            </div>
                          </details>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Footer - Contact direct */}
            {!searchQuery && (
              <div className="p-6 border-t border-zinc-800 bg-zinc-900">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Contact direct
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contactOptions.map((option, index) => (
                    <a
                      key={index}
                      href={option.href}
                      className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                      <div className="text-yellow-500">
                        {option.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm">
                          {option.title}
                        </div>
                        {option.description && (
                          <div className="text-xs text-gray-400 truncate">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
