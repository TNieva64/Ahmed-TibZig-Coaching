import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, Edit2, Trash2, Users } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function Admin() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"programs" | "clients" | "resources">("programs");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center border-gold/30">
          <p className="text-gray-600 mb-4">Accès refusé. Vous devez être administrateur.</p>
          <Button onClick={() => navigate("/")} className="bg-gold text-black hover:bg-gold/90">
            Retour à l'accueil
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container h-20 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Administration</h1>
          <Button onClick={() => navigate("/")} variant="outline">
            Retour au site
          </Button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container flex gap-8">
          <button
            onClick={() => setActiveTab("programs")}
            className={`px-4 py-4 font-medium border-b-2 transition-colors ${
              activeTab === "programs"
                ? "border-gold text-gold"
                : "border-transparent text-gray-600 hover:text-black"
            }`}
          >
            Programmes
          </button>
          <button
            onClick={() => setActiveTab("clients")}
            className={`px-4 py-4 font-medium border-b-2 transition-colors ${
              activeTab === "clients"
                ? "border-gold text-gold"
                : "border-transparent text-gray-600 hover:text-black"
            }`}
          >
            Clients
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`px-4 py-4 font-medium border-b-2 transition-colors ${
              activeTab === "resources"
                ? "border-gold text-gold"
                : "border-transparent text-gray-600 hover:text-black"
            }`}
          >
            Ressources
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-12">
        {activeTab === "programs" && <ProgramsSection />}
        {activeTab === "clients" && <ClientsSection />}
        {activeTab === "resources" && <ResourcesSection />}
      </main>
    </div>
  );
}

function ProgramsSection() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Gestion des Programmes</h2>
        <Button className="bg-gold text-black hover:bg-gold/90 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouveau programme
        </Button>
      </div>

      <div className="space-y-4">
        <Card className="p-6 border-gold/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-black">Transformation 3 mois</h3>
              <p className="text-sm text-gray-600">Programme de perte de poids et transformation physique</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Modifier
              </Button>
              <Button size="sm" variant="outline" className="flex items-center gap-2 text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
                Supprimer
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Catégorie</p>
              <p className="font-medium text-black">Transformation</p>
            </div>
            <div>
              <p className="text-gray-600">Durée</p>
              <p className="font-medium text-black">90 jours</p>
            </div>
            <div>
              <p className="text-gray-600">Clients assignés</p>
              <p className="font-medium text-black">5</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gold/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-black">Performance Triathlon</h3>
              <p className="text-sm text-gray-600">Préparation pour compétitions de triathlon</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Modifier
              </Button>
              <Button size="sm" variant="outline" className="flex items-center gap-2 text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
                Supprimer
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Catégorie</p>
              <p className="font-medium text-black">Performance</p>
            </div>
            <div>
              <p className="text-gray-600">Durée</p>
              <p className="font-medium text-black">180 jours</p>
            </div>
            <div>
              <p className="text-gray-600">Clients assignés</p>
              <p className="font-medium text-black">3</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ClientsSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-black mb-6">Gestion des Clients</h2>

      <div className="space-y-4">
        <Card className="p-6 border-gold/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-black">Jean Dupont</h3>
              <p className="text-sm text-gray-600">jean.dupont@email.com</p>
            </div>
            <Button className="bg-gold text-black hover:bg-gold/90 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Assigner un programme
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Programmes actifs</p>
              <p className="font-medium text-black">1</p>
            </div>
            <div>
              <p className="text-gray-600">Date d'inscription</p>
              <p className="font-medium text-black">15 janvier 2026</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gold/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-black">Marie Martin</h3>
              <p className="text-sm text-gray-600">marie.martin@email.com</p>
            </div>
            <Button className="bg-gold text-black hover:bg-gold/90 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Assigner un programme
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Programmes actifs</p>
              <p className="font-medium text-black">2</p>
            </div>
            <div>
              <p className="text-gray-600">Date d'inscription</p>
              <p className="font-medium text-black">10 janvier 2026</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ResourcesSection() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Gestion des Ressources</h2>
        <Button className="bg-gold text-black hover:bg-gold/90 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ajouter une ressource
        </Button>
      </div>

      <div className="space-y-4">
        <Card className="p-6 border-gold/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-black">Plan d'entraînement personnalisé</h3>
              <p className="text-sm text-gray-600">PDF - Transformation 3 mois</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Modifier
              </Button>
              <Button size="sm" variant="outline" className="flex items-center gap-2 text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
                Supprimer
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gold/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-black">Introduction au programme</h3>
              <p className="text-sm text-gray-600">Vidéo YouTube - Transformation 3 mois</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Modifier
              </Button>
              <Button size="sm" variant="outline" className="flex items-center gap-2 text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
                Supprimer
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
