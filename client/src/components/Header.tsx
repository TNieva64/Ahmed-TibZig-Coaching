import { useState } from 'react';
import { Menu, X, LogOut, LogIn } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { getLoginUrl } from '@/const';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success('Déconnexion réussie');
      window.location.href = '/';
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  // Liens publics (toujours visibles)
  const publicLinks = [
    { label: 'Accueil', href: '/' },
    { label: 'À Propos', href: '/a-propos' },
    { label: 'Coaching', href: '/coaching' },
    { label: 'Contact', href: '/contact' },
  ];

  // Liens privés (uniquement pour utilisateurs connectés)
  const privateLinks = [
    { label: 'Entraînement', href: '/workouts' },
    { label: 'Exercices', href: '/exercises' },
    { label: 'Messages', href: '/messages' },
    { label: 'Mon Espace', href: '/dashboard' },
  ];

  const navLinks = user ? [...publicLinks, ...privateLinks] : publicLinks;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="Andaloussi Coaching" className="w-12 h-12" />
            <span className="hidden sm:inline text-sm font-semibold text-black">
              Andaloussi<br />Coaching
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-black hover:text-gold transition-colors font-medium text-sm">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button or User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600">Bonjour, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <a
                  href={getLoginUrl()}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gold transition-colors border border-gray-300 rounded-lg"
                >
                  <LogIn className="w-4 h-4" />
                  Connexion
                </a>
                <Link href="/reservation" className="premium-button inline-block">
                  Réserver
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-black" />
            ) : (
              <Menu className="w-6 h-6 text-black" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-gray-200">
            <div className="flex flex-col gap-3 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-black hover:text-gold transition-colors font-medium py-2 block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 justify-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gold transition-colors border border-gray-300 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              ) : (
                <>
                  <a
                    href={getLoginUrl()}
                    className="flex items-center gap-2 justify-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gold transition-colors border border-gray-300 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4" />
                    Connexion
                  </a>
                  <Link
                    href="/reservation"
                    className="premium-button text-center block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Réserver
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
