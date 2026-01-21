export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-serif font-bold text-gold mb-8">Mentions Légales</h1>

        <div className="prose prose-invert max-w-none space-y-8">
          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">1. ÉDITEUR DU SITE</h2>
            <div className="text-gray-300 space-y-2">
              <p><strong>Nom :</strong> Ahmed Andaloussi</p>
              <p><strong>Statut :</strong> [Auto-entrepreneur / EURL / SASU - À compléter]</p>
              <p><strong>SIRET :</strong> [À compléter]</p>
              <p><strong>Adresse :</strong> [Adresse professionnelle - À compléter]</p>
              <p><strong>Email :</strong> contact@andaloussicoaching.com</p>
              <p><strong>Téléphone :</strong> [À compléter]</p>
              <p><strong>Numéro de carte professionnelle :</strong> [À compléter - Obligatoire pour éducateur sportif]</p>
            </div>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">2. HÉBERGEUR DU SITE</h2>
            <div className="text-gray-300 space-y-2">
              <p><strong>Nom :</strong> Manus</p>
              <p><strong>Site web :</strong> <a href="https://manus.im" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">https://manus.im</a></p>
            </div>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">3. DIRECTEUR DE PUBLICATION</h2>
            <p className="text-gray-300">Ahmed Andaloussi</p>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">4. PROPRIÉTÉ INTELLECTUELLE</h2>
            <p className="text-gray-300">
              L'ensemble du contenu de ce site web (textes, images, vidéos, logos, graphismes, programmes d'entraînement) 
              est la propriété exclusive d'Ahmed Andaloussi et est protégé par le droit d'auteur français et international.
            </p>
            <p className="text-gray-300 mt-4">
              Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, 
              quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.
            </p>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">5. PROTECTION DES DONNÉES PERSONNELLES</h2>
            <p className="text-gray-300">
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, 
              vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles.
            </p>
            <p className="text-gray-300 mt-4">
              Pour plus d'informations, consultez notre{" "}
              <a href="/politique-confidentialite" className="text-gold hover:underline">Politique de Confidentialité</a>.
            </p>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">6. RESPONSABILITÉ</h2>
            <p className="text-gray-300">
              L'éditeur s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site, 
              mais ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.
            </p>
            <p className="text-gray-300 mt-4">
              L'éditeur ne peut être tenu responsable des dommages directs ou indirects causés au matériel de l'utilisateur 
              lors de l'accès au site, et résultant soit de l'utilisation d'un matériel ne répondant pas aux spécifications, 
              soit de l'apparition d'un bug ou d'une incompatibilité.
            </p>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">7. AVERTISSEMENT SANTÉ</h2>
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-gray-300">
              <p className="font-semibold text-red-400 mb-2">⚠️ IMPORTANT</p>
              <p>
                Les programmes de coaching sportif proposés sur ce site ne remplacent en aucun cas un avis médical professionnel. 
                Avant de commencer tout programme d'entraînement, il est fortement recommandé de consulter un médecin, 
                notamment en cas de problème de santé, de blessure ou de traitement médical en cours.
              </p>
              <p className="mt-2">
                En cas de douleur, de malaise ou de tout symptôme inhabituel pendant l'exercice, arrêtez immédiatement 
                et consultez un professionnel de santé.
              </p>
            </div>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">8. ASSURANCE RESPONSABILITÉ CIVILE PROFESSIONNELLE</h2>
            <div className="text-gray-300 space-y-2">
              <p><strong>Assureur :</strong> [Nom de la compagnie d'assurance - À compléter]</p>
              <p><strong>Numéro de contrat :</strong> [Numéro - À compléter]</p>
              <p><strong>Coordonnées :</strong> [Adresse et téléphone de l'assureur - À compléter]</p>
            </div>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">9. MÉDIATION DE LA CONSOMMATION</h2>
            <p className="text-gray-300">
              Conformément à l'article L612-1 du Code de la consommation, en cas de litige, vous pouvez recourir gratuitement 
              à un médiateur de la consommation :
            </p>
            <div className="text-gray-300 space-y-2 mt-4">
              <p><strong>Nom :</strong> [Nom du médiateur - À compléter, ex: CM2C, Medicys]</p>
              <p><strong>Site web :</strong> [URL - À compléter]</p>
              <p><strong>Adresse :</strong> [Adresse - À compléter]</p>
            </div>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">10. DROIT APPLICABLE</h2>
            <p className="text-gray-300">
              Les présentes mentions légales sont régies par le droit français. 
              En cas de litige et à défaut d'accord amiable, le litige sera porté devant les tribunaux français 
              conformément aux règles de compétence en vigueur.
            </p>
          </section>

          <section className="bg-zinc-900 border border-gold/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">11. CONTACT</h2>
            <p className="text-gray-300">
              Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
            </p>
            <ul className="text-gray-300 mt-4 space-y-2">
              <li>• Par email : contact@andaloussicoaching.com</li>
              <li>• Par téléphone : [À compléter]</li>
              <li>• Via le formulaire de contact du site</li>
            </ul>
          </section>

          <p className="text-sm text-gray-500 mt-8">
            Dernière mise à jour : 21 janvier 2026
          </p>
        </div>
      </div>
    </div>
  );
}
