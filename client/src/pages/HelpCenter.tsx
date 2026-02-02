import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle, 
  Search, 
  ArrowLeft,
  Mail,
  MessageCircle,
  BookOpen,
  Settings,
  User,
  Shield,
  CreditCard,
  Calendar,
  Video,
  Utensils,
  Trophy,
  Bell
} from "lucide-react";
import { toast } from "sonner";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon: any;
}

const faqData: FAQItem[] = [
  // Compte et Profil
  {
    id: "account-1",
    category: "Compte",
    question: "Comment créer un compte ?",
    answer: "Pour créer un compte, cliquez sur le bouton 'Se connecter' en haut de la page d'accueil. Vous pouvez vous inscrire avec votre adresse email ou via votre compte Google. Suivez les instructions à l'écran pour compléter votre inscription.",
    icon: User
  },
  {
    id: "account-2",
    category: "Compte",
    question: "Comment modifier mes informations personnelles ?",
    answer: "Allez dans 'Mon compte' > 'Profil' pour modifier vos informations personnelles. Vous pouvez changer votre nom, email, photo de profil et préférences. N'oubliez pas de sauvegarder vos modifications.",
    icon: User
  },
  {
    id: "account-3",
    category: "Compte",
    question: "Comment supprimer mon compte ?",
    answer: "La suppression de compte est disponible dans 'Mes données personnelles' > 'Supprimer mon compte'. Attention : cette action est irréversible et entraînera la suppression de toutes vos données. Nous vous recommandons d'exporter vos données avant de supprimer votre compte.",
    icon: User
  },
  {
    id: "account-4",
    category: "Compte",
    question: "J'ai oublié mon mot de passe, que faire ?",
    answer: "Cliquez sur 'Mot de passe oublié' sur la page de connexion. Vous recevrez un email avec un lien pour réinitialiser votre mot de passe. Si vous ne recevez pas l'email, vérifiez votre dossier spam ou contactez le support.",
    icon: User
  },

  // Programmes et Coaching
  {
    id: "program-1",
    category: "Programmes",
    question: "Comment choisir un programme adapté ?",
    answer: "Lors de l'onboarding, nous évaluons votre niveau, vos objectifs et vos disponibilités. Vous pouvez ensuite consulter tous les programmes disponibles dans l'onglet 'Parcours'. Chaque programme indique le niveau requis, la durée et les objectifs.",
    icon: Trophy
  },
  {
    id: "program-2",
    category: "Programmes",
    question: "Puis-je changer de programme en cours de route ?",
    answer: "Oui, vous pouvez changer de programme à tout moment. Contactez votre coach pour discuter des options disponibles. Cependant, nous recommandons de terminer le programme en cours pour en tirer tous les bénéfices.",
    icon: Trophy
  },
  {
    id: "program-3",
    category: "Programmes",
    question: "Comment suivre ma progression ?",
    answer: "Votre progression est automatiquement suivie dans l'onglet 'Progression'. Vous y trouverez vos statistiques, vos accomplissements et l'évolution de vos performances. N'hésitez pas à consulter cette section régulièrement.",
    icon: Trophy
  },

  // Nutrition
  {
    id: "nutrition-1",
    category: "Nutrition",
    question: "Les programmes nutritionnels sont-ils personnalisés ?",
    answer: "Oui, nos plans nutritionnels sont personnalisés en fonction de vos objectifs, de vos préférences alimentaires et de vos éventuelles allergies ou restrictions. Vous pouvez consulter vos recommandations dans l'onglet 'Nutrition'.",
    icon: Utensils
  },
  {
    id: "nutrition-2",
    category: "Nutrition",
    question: "Comment accéder aux recettes ?",
    answer: "Toutes les recettes sont disponibles dans l'onglet 'Recettes'. Vous pouvez les filtrer par type de repas, par régime alimentaire ou par ingrédients. Chaque recette inclut les instructions détaillées et les informations nutritionnelles.",
    icon: Utensils
  },

  // Vidéos et Exercices
  {
    id: "video-1",
    category: "Vidéos",
    question: "Comment accéder aux vidéos d'exercices ?",
    answer: "Les vidéos d'exercices sont disponibles dans la bibliothèque d'exercices ('Exercices') et directement dans vos programmes. Vous pouvez les regarder autant de fois que nécessaire pour bien maîtriser les mouvements.",
    icon: Video
  },
  {
    id: "video-2",
    category: "Vidéos",
    question: "Puis-je télécharger les vidéos pour les regarder hors ligne ?",
    answer: "Pour l'instant, les vidéos ne sont pas disponibles en téléchargement hors ligne. Vous devez être connecté à internet pour les regarder. Nous travaillons sur une application mobile qui permettra cette fonctionnalité.",
    icon: Video
  },
  {
    id: "video-3",
    category: "Vidéos",
    question: "Comment soumettre une vidéo pour analyse ?",
    answer: "Allez dans l'onglet 'Analyse vidéo' et suivez les instructions pour enregistrer ou télécharger une vidéo de vous en train d'effectuer un exercice. Votre coach l'analysera et vous fournira des feedbacks personnalisés.",
    icon: Video
  },

  // Réservations et Planning
  {
    id: "booking-1",
    category: "Réservations",
    question: "Comment réserver une séance avec mon coach ?",
    answer: "Utilisez l'onglet 'Réservation' pour voir les créneaux disponibles. Sélectionnez le jour et l'heure qui vous conviennent, puis confirmez votre réservation. Vous recevrez une confirmation par email.",
    icon: Calendar
  },
  {
    id: "booking-2",
    category: "Réservations",
    question: "Comment annuler ou déplacer une réservation ?",
    answer: "Allez dans 'Mes réservations' et cliquez sur 'Annuler' ou 'Déplacer'. Respectez le délai de préavis indiqué dans vos conditions générales (généralement 24h) pour éviter des frais d'annulation.",
    icon: Calendar
  },

  // Gamification et Badges
  {
    id: "gamification-1",
    category: "Gamification",
    question: "Comment fonctionnent les badges ?",
    answer: "Les badges sont des récompenses que vous gagnez en accomplissant certains objectifs : compléter un programme, atteindre un objectif de poids, maintenir une série d'entraînements, etc. Consultez vos badges dans l'onglet 'Badges'.",
    icon: Trophy
  },
  {
    id: "gamification-2",
    category: "Gamification",
    question: "Qu'est-ce que le système de points ?",
    answer: "Vous gagnez des points en vous entraînant, en complétant des programmes, en participant à des défis et en atteignant vos objectifs. Ces points vous permettent de monter de niveau et de débloquer des récompenses exclusives.",
    icon: Trophy
  },

  // Notifications
  {
    id: "notification-1",
    category: "Notifications",
    question: "Comment gérer mes notifications ?",
    answer: "Allez dans 'Paramètres' > 'Notifications' pour choisir quelles notifications vous souhaitez recevoir : rappels d'entraînement, messages du coach, nouvelles recettes, etc. Vous pouvez aussi désactiver toutes les notifications si vous le préférez.",
    icon: Bell
  },

  // Confidentialité et Données
  {
    id: "privacy-1",
    category: "Confidentialité",
    question: "Mes données sont-elles sécurisées ?",
    answer: "Oui, nous prenons la protection de vos données très au sérieux. Toutes vos données sont chiffrées et stockées de manière sécurisée. Nous sommes conformes au RGPD et ne partageons jamais vos données sans votre consentement explicite.",
    icon: Shield
  },
  {
    id: "privacy-2",
    category: "Confidentialité",
    question: "Comment exporter mes données ?",
    answer: "Allez dans 'Mes données personnelles' > 'Exporter mes données'. Vous pourrez télécharger toutes vos données au format JSON. Ce fichier contient toutes les informations que nous stockons vous concernant.",
    icon: Shield
  },
  {
    id: "privacy-3",
    category: "Confidentialité",
    question: "Quelles sont mes droits RGPD ?",
    answer: "Conformément au RGPD, vous avez le droit d'accéder à vos données, de les rectifier, de les effacer, de vous opposer à leur traitement, et de demander leur portabilité. Exercez ces droits dans la section 'Mes données personnelles'.",
    icon: Shield
  },

  // Paiement et Abonnement
  {
    id: "payment-1",
    category: "Paiement",
    question: "Quels sont les modes de paiement acceptés ?",
    answer: "Nous acceptons les cartes bancaires (Visa, Mastercard, American Express) et PayPal. Tous les paiements sont sécurisés via notre partenaire de paiement certifié.",
    icon: CreditCard
  },
  {
    id: "payment-2",
    category: "Paiement",
    question: "Comment annuler mon abonnement ?",
    answer: "Vous pouvez annuler votre abonnement à tout moment dans 'Mon compte' > 'Abonnement'. L'annulation prendra effet à la fin de la période de facturation en cours. Aucun remboursement ne sera effectué pour la période en cours.",
    icon: CreditCard
  },
  {
    id: "payment-3",
    category: "Paiement",
    question: "Puis-je obtenir un remboursement ?",
    answer: "Les remboursements sont accordés selon nos conditions générales de vente. En cas de problème technique ou de service non rendu, contactez le support pour examiner votre demande.",
    icon: CreditCard
  },

  // Support technique
  {
    id: "support-1",
    category: "Support",
    question: "Comment contacter le support ?",
    answer: "Vous pouvez nous contacter via le formulaire de contact dans l'onglet 'Contact' ou directement par email à support@andaloussi-coaching.com. Notre équipe répond généralement sous 24h ouvrées.",
    icon: MessageCircle
  },
  {
    id: "support-2",
    category: "Support",
    question: "L'application ne fonctionne pas correctement, que faire ?",
    answer: "Essayez d'abord de rafraîchir la page (F5) ou de vider le cache de votre navigateur. Si le problème persiste, contactez le support en précisant votre navigateur, votre appareil et la nature du problème.",
    icon: Settings
  },
];

const categories = [
  { name: "Tout", icon: HelpCircle },
  { name: "Compte", icon: User },
  { name: "Programmes", icon: Trophy },
  { name: "Nutrition", icon: Utensils },
  { name: "Vidéos", icon: Video },
  { name: "Réservations", icon: Calendar },
  { name: "Gamification", icon: Trophy },
  { name: "Notifications", icon: Bell },
  { name: "Confidentialité", icon: Shield },
  { name: "Paiement", icon: CreditCard },
  { name: "Support", icon: MessageCircle },
];

export default function HelpCenter() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tout");

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === "Tout" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSupport = () => {
    setLocation("/contact");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container h-20 flex items-center gap-4">
          <Button
            onClick={() => setLocation("/dashboard")}
            variant="ghost"
            size="icon"
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-gold" />
            <h1 className="text-2xl font-bold text-black">Centre d'aide</h1>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-4xl">
        {/* Hero section */}
        <Card className="mb-8 border-gold/30 bg-gradient-to-br from-gold/5 to-transparent">
          <CardHeader className="text-center">
            <HelpCircle className="w-12 h-12 text-gold mx-auto mb-4" />
            <CardTitle className="text-3xl">Comment pouvons-nous vous aider ?</CardTitle>
            <CardDescription className="text-base">
              Trouvez des réponses à vos questions ou contactez notre support
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Barre de recherche */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher une question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>

            {/* Boutons d'action rapide */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={handleContactSupport}
                className="bg-gold text-black hover:bg-gold/90"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contacter le support
              </Button>
              <Button
                onClick={() => setLocation("/personal-data")}
                variant="outline"
                className="border-gold text-gold hover:bg-gold hover:text-black"
              >
                <Shield className="w-4 h-4 mr-2" />
                Mes données personnelles
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Catégories */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Catégories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  variant={selectedCategory === cat.name ? "default" : "outline"}
                  className={
                    selectedCategory === cat.name
                      ? "bg-gold text-black hover:bg-gold/90"
                      : "border-gold/30 text-gray-700 hover:bg-gold/10"
                  }
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {cat.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Résultats */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filteredFAQs.length} question{filteredFAQs.length > 1 ? "s" : ""} trouvée{filteredFAQs.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* FAQ */}
        {filteredFAQs.length > 0 ? (
          <Card className="border-gold/30">
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((faq) => {
                  const Icon = faq.icon;
                  return (
                    <AccordionItem key={faq.id} value={faq.id} className="border-b border-gray-200">
                      <AccordionTrigger className="hover:no-underline hover:text-gold transition-colors">
                        <div className="flex items-start gap-3 text-left">
                          <Icon className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                          <div>
                            <Badge variant="outline" className="mb-2 text-xs">
                              {faq.category}
                            </Badge>
                            <p className="font-medium">{faq.question}</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700">
                        <div className="pl-8">
                          {faq.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-gold/30">
            <CardContent className="py-12 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun résultat</h3>
              <p className="text-gray-600 mb-4">
                Nous n'avons pas trouvé de réponse correspondant à votre recherche.
              </p>
              <Button
                onClick={handleContactSupport}
                className="bg-gold text-black hover:bg-gold/90"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Poser une question au support
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Section ressources additionnelles */}
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <Card className="border-gold/30 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation("/politique-confidentialite")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="w-5 h-5 text-gold" />
                Politique de confidentialité
              </CardTitle>
              <CardDescription>
                En savoir plus sur la protection de vos données
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-gold/30 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation("/conditions-generales")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="w-5 h-5 text-gold" />
                Conditions générales
              </CardTitle>
              <CardDescription>
                Consultez nos conditions d'utilisation
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
