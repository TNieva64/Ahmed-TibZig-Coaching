import { Link } from 'wouter';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white mt-20">
      <div className="container section-padding-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <div>
            <img src="/logo.svg" alt="Andaloussi Coaching" className="w-16 h-16 mb-4" />
            <p className="text-gray-300 text-sm leading-relaxed">
              Andaloussi Coaching - Votre partenaire en transformation physique et performance sportive.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-gold transition-colors text-sm block">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/parcours" className="text-gray-300 hover:text-gold transition-colors text-sm block">
                  Mon Parcours
                </Link>
              </li>
              <li>
                <Link href="/coaching" className="text-gray-300 hover:text-gold transition-colors text-sm block">
                  Coaching
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-gold transition-colors text-sm block">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <a href="mailto:contact@andaloussicoaching.com" className="text-gray-300 hover:text-gold transition-colors text-sm">
                  contact@andaloussicoaching.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <a href="tel:+33" className="text-gray-300 hover:text-gold transition-colors text-sm">
                  Sur demande
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">
                  Pau, France
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} Andaloussi Coaching. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-gold transition-colors text-sm">
                Mentions légales
              </a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors text-sm">
                Politique de confidentialité
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
