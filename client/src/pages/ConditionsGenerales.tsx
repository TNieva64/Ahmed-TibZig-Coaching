export default function ConditionsGenerales() {
  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-serif font-bold text-gold mb-8">Conditions Générales d'Utilisation et de Vente</h1>

        <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-300">
            <strong>Important :</strong> En utilisant ce site et en souscrivant à nos services de coaching, 
            vous acceptez les présentes conditions générales dans leur intégralité.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">1. OBJET</h2>
            <p className="text-gray-300">
              Les présentes Conditions Générales d'Utilisation et de Vente (ci-après "CGU/CGV") régissent l'accès 
              et l'utilisation du site web andaloussicoaching.com ainsi que la vente de prestations de coaching sportif 
              en ligne proposées par Ahmed Andaloussi (ci-après "le Coach").
            </p>
            <p className="text-gray-300 mt-4">
              Les services proposés comprennent :
            </p>
            <ul className="text-gray-300 space-y-2 ml-4 mt-2">
              <li>• Programmes d'entraînement personnalisés</li>
              <li>• Suivi nutritionnel et plans alimentaires</li>
              <li>• Messagerie privée avec le coach</li>
              <li>• Analyse vidéo de la forme d'exécution</li>
              <li>• Suivi de progression et statistiques</li>
              <li>• Accès à une bibliothèque d'exercices et de recettes</li>
            </ul>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">2. ACCEPTATION DES CONDITIONS</h2>
            <p className="text-gray-300">
              L'utilisation du site et la souscription à un abonnement impliquent l'acceptation pleine et entière 
              des présentes CGU/CGV. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser ce site.
            </p>
            <p className="text-gray-300 mt-4">
              Le Coach se réserve le droit de modifier les présentes CGU/CGV à tout moment. Les modifications 
              seront applicables dès leur mise en ligne. Il est de votre responsabilité de consulter régulièrement 
              cette page.
            </p>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">3. INSCRIPTION ET COMPTE CLIENT</h2>
            <p className="text-gray-300 mb-4">
              Pour accéder aux services de coaching, vous devez créer un compte en fournissant des informations 
              exactes et à jour.
            </p>
            <div className="text-gray-300 space-y-3">
              <p>• Vous devez être âgé(e) de 18 ans minimum ou avoir l'autorisation d'un représentant légal</p>
              <p>• Vous êtes responsable de la confidentialité de vos identifiants de connexion</p>
              <p>• Toute activité effectuée depuis votre compte est sous votre responsabilité</p>
              <p>• Vous devez signaler immédiatement toute utilisation non autorisée de votre compte</p>
            </div>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">4. TARIFS ET MODALITÉS DE PAIEMENT</h2>
            <div className="bg-zinc-800 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Offres de coaching (À compléter selon vos tarifs)</h3>
              <div className="text-gray-300 space-y-2">
                <p>• <strong>Abonnement Mensuel :</strong> [Prix]€/mois TTC</p>
                <p>• <strong>Abonnement Trimestriel :</strong> [Prix]€/trimestre TTC (soit [Prix]€/mois)</p>
                <p>• <strong>Abonnement Annuel :</strong> [Prix]€/an TTC (soit [Prix]€/mois)</p>
              </div>
            </div>

            <p className="text-gray-300 mb-4">
              <strong>Modalités de paiement :</strong>
            </p>
            <ul className="text-gray-300 space-y-2 ml-4">
              <li>• Carte bancaire (Visa, Mastercard, American Express) via Stripe</li>
              <li>• Paiement sécurisé conforme aux normes PCI-DSS</li>
              <li>• Prélèvement automatique mensuel pour les abonnements</li>
              <li>• Facturation le jour de la souscription puis à date anniversaire</li>
            </ul>

            <p className="text-gray-300 mt-4">
              <strong>TVA :</strong> [Si auto-entrepreneur : "TVA non applicable, art. 293 B du CGI" / Si société : "TVA à 20%"]
            </p>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">5. DROIT DE RÉTRACTATION (14 JOURS)</h2>
            <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 mb-4">
              <p className="text-gray-300">
                <strong>Conformément aux articles L221-18 et suivants du Code de la consommation</strong>, vous disposez 
                d'un délai de <strong>14 jours</strong> à compter de la souscription pour exercer votre droit de rétractation 
                sans avoir à justifier de motifs ni à payer de pénalités.
              </p>
            </div>

            <p className="text-gray-300 mb-4">
              <strong>Exception :</strong> Si vous demandez expressément à commencer le coaching avant la fin du délai 
              de rétractation (accès immédiat au programme), vous renoncez à votre droit de rétractation pour la partie 
              de prestation déjà fournie.
            </p>

            <p className="text-gray-300 mb-4">
              <strong>Pour exercer votre droit de rétractation :</strong>
            </p>
            <ul className="text-gray-300 space-y-2 ml-4">
              <li>• Envoyez un email à : contact@andaloussicoaching.com</li>
              <li>• Objet : "Rétractation - Commande n°[numéro]"</li>
              <li>• Remboursement sous 14 jours par le même moyen de paiement</li>
            </ul>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">6. DURÉE ET RÉSILIATION</h2>
            <div className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Durée du contrat</h3>
                <p>
                  L'abonnement est souscrit pour une durée déterminée (1 mois, 3 mois ou 12 mois selon l'offre choisie) 
                  et se renouvelle automatiquement par tacite reconduction sauf résiliation.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Résiliation par le client</h3>
                <p>
                  Vous pouvez résilier votre abonnement à tout moment depuis votre espace client ou par email 
                  (contact@andaloussicoaching.com). La résiliation prendra effet à la fin de la période d'abonnement 
                  en cours (pas de remboursement au prorata).
                </p>
                <p className="mt-2">
                  <strong>Préavis :</strong> [À définir, ex: 7 jours avant la date de renouvellement]
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Résiliation par le Coach</h3>
                <p>
                  Le Coach se réserve le droit de résilier un abonnement en cas de :
                </p>
                <ul className="ml-4 mt-2 space-y-1">
                  <li>• Non-paiement</li>
                  <li>• Comportement inapproprié ou abusif</li>
                  <li>• Violation des présentes CGU/CGV</li>
                  <li>• Utilisation frauduleuse du service</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">7. OBLIGATIONS DU CLIENT</h2>
            <p className="text-gray-300 mb-4">En tant que client, vous vous engagez à :</p>
            <ul className="text-gray-300 space-y-2 ml-4">
              <li>• Fournir des informations exactes et complètes sur votre état de santé</li>
              <li>• Consulter un médecin avant de commencer tout programme d'entraînement</li>
              <li>• Obtenir un certificat médical de non contre-indication à la pratique sportive</li>
              <li>• Signaler immédiatement toute douleur, blessure ou problème de santé</li>
              <li>• Suivre les consignes de sécurité et les recommandations du coach</li>
              <li>• Ne pas partager votre accès au programme avec des tiers</li>
              <li>• Ne pas copier, reproduire ou diffuser le contenu du site sans autorisation</li>
              <li>• Utiliser le service de manière responsable et respectueuse</li>
            </ul>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">8. OBLIGATIONS ET RESPONSABILITÉ DU COACH</h2>
            <div className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Engagements du Coach</h3>
                <ul className="space-y-2 ml-4">
                  <li>• Fournir un programme d'entraînement personnalisé et adapté</li>
                  <li>• Répondre aux messages dans un délai raisonnable (48h ouvrées maximum)</li>
                  <li>• Assurer la confidentialité des informations personnelles</li>
                  <li>• Adapter le programme en fonction de la progression et des retours</li>
                </ul>
              </div>

              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-400 mb-2">⚠️ Limitations de responsabilité</h3>
                <ul className="text-gray-300 space-y-2 ml-4">
                  <li>• Le coaching sportif en ligne ne remplace pas un suivi médical professionnel</li>
                  <li>• Le Coach ne peut être tenu responsable des blessures ou problèmes de santé résultant 
                      d'une pratique inappropriée ou d'informations inexactes fournies par le client</li>
                  <li>• Les résultats varient selon les individus et ne peuvent être garantis</li>
                  <li>• Le Coach n'est pas responsable des interruptions de service dues à des causes techniques 
                      indépendantes de sa volonté</li>
                  <li>• La responsabilité du Coach est limitée au montant de l'abonnement payé</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">9. PROPRIÉTÉ INTELLECTUELLE</h2>
            <p className="text-gray-300 mb-4">
              L'ensemble du contenu du site (textes, images, vidéos, programmes d'entraînement, plans alimentaires, 
              logos, graphismes) est la propriété exclusive d'Ahmed Andaloussi et est protégé par le droit d'auteur.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>Vous êtes autorisé(e) à :</strong>
            </p>
            <ul className="text-gray-300 space-y-2 ml-4">
              <li>• Consulter et utiliser le contenu pour votre usage personnel uniquement</li>
              <li>• Télécharger votre programme d'entraînement pour un usage privé</li>
            </ul>
            <p className="text-gray-300 mt-4">
              <strong>Il est strictement interdit de :</strong>
            </p>
            <ul className="text-gray-300 space-y-2 ml-4">
              <li>• Reproduire, copier, modifier ou distribuer le contenu sans autorisation écrite</li>
              <li>• Utiliser le contenu à des fins commerciales</li>
              <li>• Partager votre accès avec des tiers</li>
              <li>• Extraire ou réutiliser des parties substantielles du contenu</li>
            </ul>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">10. PROTECTION DES DONNÉES PERSONNELLES</h2>
            <p className="text-gray-300">
              Le traitement de vos données personnelles est régi par notre{" "}
              <a href="/politique-confidentialite" className="text-gold hover:underline">Politique de Confidentialité</a>, 
              conforme au RGPD et à la loi Informatique et Libertés.
            </p>
            <p className="text-gray-300 mt-4">
              Vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données 
              personnelles. Pour exercer ces droits, contactez-nous à : contact@andaloussicoaching.com
            </p>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">11. FORCE MAJEURE</h2>
            <p className="text-gray-300">
              Le Coach ne pourra être tenu responsable de l'inexécution de ses obligations en cas de force majeure 
              ou d'événements indépendants de sa volonté (panne technique majeure, catastrophe naturelle, grève, etc.).
            </p>
            <p className="text-gray-300 mt-4">
              En cas d'interruption prolongée du service (plus de 30 jours), le client pourra demander le remboursement 
              au prorata de la période non utilisée.
            </p>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">12. RÉCLAMATIONS ET MÉDIATION</h2>
            <div className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Service client</h3>
                <p>
                  Pour toute réclamation, contactez-nous en priorité à : contact@andaloussicoaching.com
                </p>
                <p className="mt-2">
                  Nous nous engageons à répondre dans un délai de 7 jours ouvrés.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Médiation de la consommation</h3>
                <p>
                  Conformément à l'article L612-1 du Code de la consommation, en cas de litige non résolu à l'amiable, 
                  vous pouvez recourir gratuitement à un médiateur de la consommation :
                </p>
                <div className="mt-3 space-y-2">
                  <p><strong>Nom :</strong> [Médiateur choisi - À compléter, ex: CM2C, Medicys]</p>
                  <p><strong>Site web :</strong> [URL - À compléter]</p>
                  <p><strong>Adresse :</strong> [Adresse - À compléter]</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">13. DROIT APPLICABLE ET JURIDICTION</h2>
            <p className="text-gray-300">
              Les présentes CGU/CGV sont régies par le droit français.
            </p>
            <p className="text-gray-300 mt-4">
              En cas de litige et à défaut d'accord amiable, le litige sera porté devant les tribunaux français 
              conformément aux règles de compétence en vigueur.
            </p>
            <p className="text-gray-300 mt-4">
              Conformément à l'article L141-4 du Code de la consommation, le consommateur peut saisir à son choix, 
              outre l'une des juridictions territorialement compétentes en vertu du code de procédure civile, 
              la juridiction du lieu où il demeurait au moment de la conclusion du contrat ou de la survenance du fait dommageable.
            </p>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">14. CONTACT</h2>
            <p className="text-gray-300 mb-4">
              Pour toute question concernant les présentes CGU/CGV :
            </p>
            <div className="text-gray-300 space-y-2">
              <p><strong>Email :</strong> contact@andaloussicoaching.com</p>
              <p><strong>Téléphone :</strong> [À compléter]</p>
              <p><strong>Adresse :</strong> [Adresse professionnelle - À compléter]</p>
            </div>
          </section>

          <p className="text-sm text-gray-500 mt-8">
            <strong>Dernière mise à jour :</strong> 21 janvier 2026<br />
            <strong>Version :</strong> 1.0
          </p>
        </div>
      </div>
    </div>
  );
}
