import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Share2,
  Users,
  Gift,
  Trophy,
  Copy,
  Check,
  ExternalLink,
  TrendingUp,
  Mail,
  Calendar,
} from "lucide-react";

export default function Referral() {
  const [copied, setCopied] = useState(false);

  const { data: referralCode } = trpc.referral.getMyReferralCode.useQuery();
  const { data: stats, refetch } = trpc.referral.getMyReferralStats.useQuery();
  const { data: leaderboard } = trpc.referral.getReferralLeaderboard.useQuery({ limit: 10 });

  const handleCopyLink = () => {
    if (referralCode?.link) {
      navigator.clipboard.writeText(referralCode.link);
      setCopied(true);
      toast.success("Lien copié !");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCode = () => {
    if (referralCode?.code) {
      navigator.clipboard.writeText(referralCode.code);
      toast.success("Code copié !");
    }
  };

  const handleShareWhatsApp = () => {
    if (referralCode?.link) {
      const message = encodeURIComponent(
        `🏋️ Rejoins-moi sur Andaloussi Coaching ! Coaching sportif en ligne personnalisé avec Ahmed Andaloussi, athlète paralympien. Utilise mon code ${referralCode.code} pour t'inscrire : ${referralCode.link}`
      );
      window.open(`https://wa.me/?text=${message}`, "_blank");
    }
  };

  const handleShareEmail = () => {
    if (referralCode?.link) {
      const subject = encodeURIComponent("Rejoins Andaloussi Coaching !");
      const body = encodeURIComponent(
        `Salut,\n\nJe te recommande Andaloussi Coaching, une plateforme de coaching sportif en ligne personnalisé avec Ahmed Andaloussi, athlète paralympien et coach certifié.\n\nUtilise mon code de parrainage ${referralCode.code} pour t'inscrire :\n${referralCode.link}\n\nÀ bientôt !`
      );
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="container max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gold mb-2 flex items-center">
            <Share2 className="w-10 h-10 mr-3" />
            Programme de Parrainage
          </h1>
          <p className="text-gray-400">Partagez votre passion et gagnez des récompenses</p>
        </div>

        {/* Comment ça marche */}
        <Card className="bg-gradient-to-br from-gold/10 to-transparent border-gold mb-8">
          <CardHeader>
            <CardTitle className="text-gold text-2xl">🎁 Comment ça marche ?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-gold">1</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Partagez votre lien</h3>
                <p className="text-gray-400 text-sm">
                  Envoyez votre lien unique à vos amis, famille ou sur les réseaux sociaux
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-gold">2</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Ils s'inscrivent</h3>
                <p className="text-gray-400 text-sm">
                  Vos filleuls utilisent votre code pour créer leur compte
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-gold">3</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Vous gagnez !</h3>
                <p className="text-gray-400 text-sm">
                  Recevez <span className="text-gold font-semibold">1 mois offert</span> par filleul inscrit
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Votre lien de parrainage */}
          <Card className="bg-gray-900 border-gold lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-gold">Votre Lien de Parrainage</CardTitle>
              <CardDescription className="text-gray-400">
                Partagez ce lien avec vos amis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Code de parrainage */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Votre code</label>
                <div className="flex gap-2">
                  <Input
                    value={referralCode?.code || "Chargement..."}
                    readOnly
                    className="bg-gray-800 border-gray-700 text-white text-lg font-mono"
                  />
                  <Button
                    onClick={handleCopyCode}
                    className="bg-gold text-black hover:bg-gold/90"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Lien complet */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Lien complet</label>
                <div className="flex gap-2">
                  <Input
                    value={referralCode?.link || "Chargement..."}
                    readOnly
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <Button
                    onClick={handleCopyLink}
                    className={`${
                      copied ? "bg-green-600" : "bg-gold"
                    } text-black hover:opacity-90 transition-colors`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Boutons de partage */}
              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-3">Partager via</p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleShareWhatsApp}
                    className="bg-green-600 text-white hover:bg-green-700 flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button
                    onClick={handleShareEmail}
                    className="bg-blue-600 text-white hover:bg-blue-700 flex-1"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques rapides */}
          <Card className="bg-gray-900 border-gold">
            <CardHeader>
              <CardTitle className="text-gold">Vos Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Parrainages
                </span>
                <span className="text-2xl font-bold text-white">
                  {stats?.completedReferrals || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center">
                  <Gift className="w-4 h-4 mr-2" />
                  Récompenses
                </span>
                <span className="text-2xl font-bold text-gold">
                  {stats?.totalRewards || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Clics
                </span>
                <span className="text-2xl font-bold text-white">
                  {stats?.totalClicks || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vos filleuls */}
          <Card className="bg-gray-900 border-gold">
            <CardHeader>
              <CardTitle className="text-gold flex items-center">
                <Users className="w-6 h-6 mr-2" />
                Vos Filleuls ({stats?.referredUsers?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.referredUsers && stats.referredUsers.length > 0 ? (
                <div className="space-y-3">
                  {stats.referredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-white font-semibold">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        {user.completedAt && (
                          <p className="text-gray-500 text-xs flex items-center mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(user.completedAt).toLocaleDateString("fr-FR")}
                          </p>
                        )}
                      </div>
                      <div>
                        {user.rewardGranted ? (
                          <Badge className="bg-gold text-black">
                            <Gift className="w-3 h-3 mr-1" />
                            Récompensé
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-700 text-gray-300">En attente</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Aucun filleul pour le moment</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Partagez votre lien pour commencer !
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Classement */}
          <Card className="bg-gray-900 border-gold">
            <CardHeader>
              <CardTitle className="text-gold flex items-center">
                <Trophy className="w-6 h-6 mr-2" />
                Classement des Ambassadeurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.userId}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-600/20 to-transparent border border-yellow-600/30"
                          : index === 1
                          ? "bg-gradient-to-r from-gray-400/20 to-transparent border border-gray-400/30"
                          : index === 2
                          ? "bg-gradient-to-r from-orange-600/20 to-transparent border border-orange-600/30"
                          : "bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0
                              ? "bg-yellow-600 text-black"
                              : index === 1
                              ? "bg-gray-400 text-black"
                              : index === 2
                              ? "bg-orange-600 text-white"
                              : "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className="text-white font-semibold">{entry.userName}</span>
                      </div>
                      <span className="text-gold font-bold">{entry.referralCount} parrainages</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Classement vide</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
