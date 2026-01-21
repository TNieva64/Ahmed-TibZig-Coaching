export default function PolitiqueConfidentialite() {
  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-serif font-bold text-gold mb-8">Politique de Confidentialité</h1>
        
        <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-300">
            <strong>Conformité RGPD :</strong> Cette politique de confidentialité est conforme au Règlement Général 
            sur la Protection des Données (RGPD) et à la loi Informatique et Libertés modifiée.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">1. RESPONSABLE DU TRAITEMENT</h2>
            <div className="text-gray-300 space-y-2">
              <p><strong>Identité :</strong> Ahmed Andaloussi</p>
              <p><strong>Adresse :</strong> [Adresse professionnelle - À compléter]</p>
              <p><strong>Email :</strong> contact@andaloussicoaching.com</p>
              <p><strong>Téléphone :</strong> [À compléter]</p>
            </div>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">2. DONNÉES COLLECTÉES</h2>
            <p className="text-gray-300 mb-4">Nous collectons les données personnelles suivantes :</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Données d'identification</h3>
                <ul className="text-gray-300 space-y-1 ml-4">
                  <li>• Nom et prénom</li>
                  <li>• Adresse email</li>
                  <li>• Méthode de connexion (OAuth)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Données de santé et forme physique</h3>
                <ul className="text-gray-300 space-y-1 ml-4">
                  <li>• Poids, masse grasse corporelle</li>
                  <li>• Objectifs de transformation physique</li>
                  <li>• Historique sportif et niveau d'activité</li>
                  <li>• Contraintes de santé et blessures</li>
                  <li>• Préférences d'entraînement</li>
                  <li>• Performances et évaluations d'énergie</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Données de nutrition</h3>
                <ul className="text-gray-300 space-y-1 ml-4">
                  <li>• Objectifs caloriques et macronutriments</li>
                  <li>• Journal alimentaire (repas, calories)</li>
                  <li>• Préférences et restrictions alimentaires</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Données d'activité</h3>
                <ul className="text-gray-300 space-y-1 ml-4">
                  <li>• Séances d'entraînement complétées</li>
                  <li>• Vidéos et photos d'exercices</li>
                  <li>• Messages échangés avec le coach</li>
                  <li>• Badges et points de gamification</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Données techniques</h3>
                <ul className="text-gray-300 space-y-1 ml-4">
                  <li>• Adresse IP</li>
                  <li>• Cookies de session (strictement nécessaires)</li>
                  <li>• Logs de connexion et d'activité</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">3. FINALITÉS DU TRAITEMENT</h2>
            <p className="text-gray-300 mb-4">Vos données sont collectées pour les finalités suivantes :</p>
            <ul className="text-gray-300 space-y-2 ml-4">
              <li>• <strong>Exécution du contrat de coaching sportif :</strong> Création et suivi de votre programme personnalisé</li>
              <li>• <strong>Communication coach-client :</strong> Échanges de messages, partage de vidéos et conseils</li>
              <li>• <strong>Suivi de progression :</strong> Analyse de vos performances et adaptation du programme</li>
              <li>• <strong>Gestion administrative :</strong> Facturation, gestion de l'abonnement</li>
              <li>• <strong>Amélioration du service :</strong> Statistiques anonymisées, optimisation de la plateforme</li>
              <li>• <strong>Emails de coaching :</strong> Séquence d'onboarding, rappels de séances, conseils (avec consentement)</li>
            </ul>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">4. BASE LÉGALE DU TRAITEMENT</h2>
            <p className="text-gray-300 mb-4">Le traitement de vos données repose sur :</p>
            <ul className="text-gray-300 space-y-2 ml-4">
              <li>• <strong>Exécution du contrat</strong> (Article 6.1.b du RGPD) : Pour fournir le service de coaching</li>
              <li>• <strong>Consentement</strong> (Article 6.1.a du RGPD) : Pour les emails marketing et communications optionnelles</li>
              <li>• <strong>Intérêt légitime</strong> (Article 6.1.f du RGPD) : Pour la sécurité et l'amélioration du service</li>
              <li>• <strong>Obligation légale</strong> (Article 6.1.c du RGPD) : Pour la facturation et la comptabilité</li>
            </ul>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">5. DESTINATAIRES DES DONNÉES</h2>
            <p className="text-gray-300 mb-4">Vos données personnelles sont accessibles uniquement par :</p>
            <ul className="text-gray-300 space-y-2 ml-4">
              <li>• <strong>Ahmed Andaloussi</strong> (coach personnel) : Accès complet pour assurer le coaching</li>
              <li>• <strong>Hébergeur (Manus)</strong> : Stockage sécurisé des données sur serveurs européens</li>
              <li>• <strong>Processeur de paiement (Stripe)</strong> : Uniquement pour les transactions financières (si applicable)</li>
            </ul>
            <p className="text-gray-300 mt-4">
              <strong>Aucune donnée n'est vendue, louée ou partagée avec des tiers à des fins commerciales.</strong>
            </p>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">6. DURÉE DE CONSERVATION</h2>
            <div className="text-gray-300 space-y-3">
              <p>• <strong>Données de compte actif :</strong> Pendant toute la durée de votre abonnement</p>
              <p>• <strong>Après résiliation :</strong> 3 ans (délai de prescription légale)</p>
              <p>• <strong>Données de facturation :</strong> 10 ans (obligation légale comptable)</p>
              <p>• <strong>Cookies de session :</strong> Supprimés à la fermeture du navigateur</p>
              <p>• <strong>Logs de sécurité :</strong> 12 mois maximum</p>
            </div>
            <p className="text-gray-300 mt-4">
              Vous pouvez demander la suppression anticipée de vos données à tout moment (voir section 8).
            </p>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">7. TRANSFERT DES DONNÉES HORS UE</h2>
            <p className="text-gray-300">
              <strong>Aucun transfert hors Union Européenne.</strong> Toutes vos données sont stockées sur des serveurs 
              situés dans l'Union Européenne et soumis au RGPD.
            </p>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">8. VOS DROITS (RGPD)</h2>
            <p className="text-gray-300 mb-4">
              Conformément aux articles 15 à 22 du RGPD, vous disposez des droits suivants :
            </p>

            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gold mb-2">✅ Droit d'accès (Article 15)</h3>
                <p className="text-gray-300">
                  Obtenir une copie de toutes vos données personnelles au format structuré (JSON/PDF).
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  👉 Accessible dans votre espace client : <a href="/mes-donnees" className="text-gold hover:underline">Mes données personnelles</a>
                </p>
              </div>

              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gold mb-2">✏️ Droit de rectification (Article 16)</h3>
                <p className="text-gray-300">
                  Corriger ou mettre à jour vos informations personnelles inexactes ou incomplètes.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  👉 Accessible dans votre profil ou via contact@andaloussicoaching.com
                </p>
              </div>

              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gold mb-2">🗑️ Droit à l'effacement (Article 17)</h3>
                <p className="text-gray-300">
                  Supprimer définitivement votre compte et toutes vos données personnelles.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  👉 Accessible dans votre espace client : <a href="/mes-donnees" className="text-gold hover:underline">Supprimer mon compte</a>
                </p>
              </div>

              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gold mb-2">📦 Droit à la portabilité (Article 20)</h3>
                <p className="text-gray-300">
                  Récupérer vos données dans un format structuré et les transférer à un autre service.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  👉 Téléchargement disponible dans votre espace client
                </p>
              </div>

              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gold mb-2">🚫 Droit d'opposition (Article 21)</h3>
                <p className="text-gray-300">
                  Vous opposer au traitement de vos données pour des raisons tenant à votre situation particulière.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  👉 Contactez-nous : contact@andaloussicoaching.com
                </p>
              </div>

              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gold mb-2">⏸️ Droit à la limitation (Article 18)</h3>
                <p className="text-gray-300">
                  Demander le gel temporaire du traitement de vos données dans certaines situations.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  👉 Contactez-nous : contact@andaloussicoaching.com
                </p>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mt-6">
              <p className="text-sm text-gray-300">
                <strong>Délai de réponse :</strong> Nous nous engageons à répondre à toute demande d'exercice de droits 
                dans un délai maximum de <strong>1 mois</strong> à compter de la réception de votre demande.
              </p>
            </div>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">9. SÉCURITÉ DES DONNÉES</h2>
            <p className="text-gray-300 mb-4">Nous mettons en œuvre les mesures de sécurité suivantes :</p>
            <ul className="text-gray-300 space-y-2 ml-4">
              <li>• <strong>Chiffrement HTTPS/TLS :</strong> Toutes les communications sont chiffrées</li>
              <li>• <strong>Authentification sécurisée :</strong> OAuth avec tokens JWT signés</li>
              <li>• <strong>Cookies sécurisés :</strong> HttpOnly, Secure, SameSite</li>
              <li>• <strong>Contrôle d'accès :</strong> Seul le coach et vous-même pouvez accéder à vos données</li>
              <li>• <strong>Sauvegardes régulières :</strong> Backup quotidien de la base de données</li>
              <li>• <strong>Serveurs sécurisés :</strong> Hébergement européen conforme RGPD</li>
              <li>• <strong>Monitoring :</strong> Détection des tentatives d'accès non autorisées</li>
            </ul>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">10. COOKIES</h2>
            <p className="text-gray-300 mb-4">
              Ce site utilise uniquement des <strong>cookies strictement nécessaires</strong> au fonctionnement 
              (cookies de session d'authentification). Ces cookies sont exemptés de consentement selon l'article 82 
              de la loi Informatique et Libertés.
            </p>
            <p className="text-gray-300">
              <strong>Aucun cookie de tracking, analytics ou publicitaire n'est utilisé.</strong>
            </p>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">11. RÉCLAMATION AUPRÈS DE LA CNIL</h2>
            <p className="text-gray-300 mb-4">
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès 
              de la Commission Nationale de l'Informatique et des Libertés (CNIL) :
            </p>
            <div className="text-gray-300 space-y-2">
              <p><strong>Site web :</strong> <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">www.cnil.fr</a></p>
              <p><strong>Adresse :</strong> 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07</p>
              <p><strong>Téléphone :</strong> 01 53 73 22 22</p>
            </div>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">12. MODIFICATIONS DE LA POLITIQUE</h2>
            <p className="text-gray-300">
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
              Toute modification sera publiée sur cette page avec une nouvelle date de mise à jour. 
              Nous vous encourageons à consulter régulièrement cette page.
            </p>
            <p className="text-gray-300 mt-4">
              En cas de modification substantielle, nous vous en informerons par email.
            </p>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">13. CONTACT - DÉLÉGUÉ À LA PROTECTION DES DONNÉES</h2>
            <p className="text-gray-300 mb-4">
              Pour toute question concernant cette politique de confidentialité ou l'exercice de vos droits :
            </p>
            <div className="text-gray-300 space-y-2">
              <p><strong>Email :</strong> contact@andaloussicoaching.com</p>
              <p><strong>Objet du message :</strong> "RGPD - Exercice de mes droits"</p>
              <p><strong>Délégué à la Protection des Données (DPO) :</strong> Ahmed Andaloussi</p>
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
