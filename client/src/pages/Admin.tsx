import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, Edit2, Trash2, Users, X, Check, TrendingUp, Activity, DollarSign, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import PDFGenerator from "@/components/PDFGenerator";

export default function Admin() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"dashboard" | "programs" | "clients" | "resources" | "pdf">("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
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
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-4 font-medium border-b-2 transition-colors ${
              activeTab === "dashboard"
                ? "border-gold text-gold"
                : "border-transparent text-gray-600 hover:text-black"
            }`}
          >
            Tableau de bord
          </button>
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
          <button
            onClick={() => setActiveTab("pdf")}
            className={`px-4 py-4 font-medium border-b-2 transition-colors ${
              activeTab === "pdf"
                ? "border-gold text-gold"
                : "border-transparent text-gray-600 hover:text-black"
            }`}
          >
            Générer Plans PDF
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-12">
        {activeTab === "dashboard" && <DashboardSection />}
        {activeTab === "programs" && <ProgramsSection />}
        {activeTab === "clients" && <ClientsSection />}
        {activeTab === "resources" && <ResourcesSection />}
        {activeTab === "pdf" && <PDFGenerator />}
      </main>
    </div>
  );
}

function DashboardSection() {
  const { data: stats, isLoading } = trpc.admin.getGlobalStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Clients",
      value: stats?.totalClients || 0,
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Clients Actifs",
      value: stats?.activeClients || 0,
      icon: Activity,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Taux de Réussite",
      value: `${stats?.successRate || 0}%`,
      icon: TrendingUp,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Revenus Mensuels",
      value: `${stats?.monthlyRevenue || 0}€`,
      icon: DollarSign,
      color: "bg-gold",
      textColor: "text-gold",
      bgColor: "bg-gold/10",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Tableau de Bord</h2>
        <p className="text-gray-600">Vue d'ensemble des performances de votre plateforme de coaching</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className={`p-6 border-2 ${kpi.bgColor} border-${kpi.textColor.split('-')[1]}-200`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
                <p className={`text-3xl font-bold ${kpi.textColor}`}>{kpi.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-full ${kpi.bgColor} flex items-center justify-center`}>
                <kpi.icon className={`w-6 h-6 ${kpi.textColor}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Alertes et Actions Rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertes */}
        <Card className="p-6 border-gold/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-black">Alertes</h3>
          </div>
          <div className="space-y-3">
            {stats && stats.atRiskClients > 0 ? (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>{stats.atRiskClients} clients</strong> n'ont pas enregistré de progression depuis 30 jours
                </p>
              </div>
            ) : (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  Aucune alerte en cours. Tous les clients progressent bien !
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Actions Rapides */}
        <Card className="p-6 border-gold/30">
          <h3 className="text-lg font-semibold text-black mb-4">Actions Rapides</h3>
          <div className="space-y-3">
            <Button
              onClick={() => {/* TODO: Implémenter */}}
              className="w-full justify-start bg-gold text-black hover:bg-gold/90"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un nouveau client
            </Button>
            <Button
              onClick={() => {/* TODO: Implémenter */}}
              className="w-full justify-start"
              variant="outline"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Voir le rapport mensuel
            </Button>
            <Button
              onClick={() => {/* TODO: Implémenter */}}
              className="w-full justify-start"
              variant="outline"
            >
              <Users className="w-4 h-4 mr-2" />
              Gérer les programmes
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ProgramsSection() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "transformation" as "transformation" | "performance" | "inclusive",
    duration: 0,
  });

  const { data: programs, isLoading, refetch } = trpc.programs.list.useQuery();
  const createMutation = trpc.admin.createProgram.useMutation({
    onSuccess: () => {
      toast.success("Programme créé avec succès");
      refetch();
      setShowCreateForm(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const updateMutation = trpc.admin.updateProgram.useMutation({
    onSuccess: () => {
      toast.success("Programme modifié avec succès");
      refetch();
      setEditingProgram(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const deleteMutation = trpc.admin.deleteProgram.useMutation({
    onSuccess: () => {
      toast.success("Programme supprimé avec succès");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "transformation",
      duration: 0,
    });
  };

  const handleSubmit = () => {
    if (editingProgram) {
      updateMutation.mutate({ id: editingProgram.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (program: any) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      description: program.description || "",
      category: program.category,
      duration: program.duration || 0,
    });
    setShowCreateForm(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Gestion des Programmes</h2>
        <Button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingProgram(null);
            resetForm();
          }}
          className="bg-gold text-black hover:bg-gold/90 flex items-center gap-2"
        >
          {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showCreateForm ? "Annuler" : "Nouveau programme"}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="p-6 mb-6 border-gold/30">
          <h3 className="text-lg font-semibold text-black mb-4">
            {editingProgram ? "Modifier le programme" : "Créer un nouveau programme"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Nom du programme</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Transformation 3 mois"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
              >
                <option value="transformation">Transformation</option>
                <option value="performance">Performance</option>
                <option value="inclusive">Inclusif</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Durée (jours)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                placeholder="90"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-black mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du programme..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-gold text-black hover:bg-gold/90"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {editingProgram ? "Modifier" : "Créer"}
            </Button>
            <Button
              onClick={() => {
                setShowCreateForm(false);
                setEditingProgram(null);
                resetForm();
              }}
              variant="outline"
            >
              Annuler
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {programs?.map((program) => (
          <Card key={program.id} className="p-6 border-gold/30">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-black">{program.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{program.description}</p>
                <div className="flex gap-4 mt-3">
                  <span className="text-sm text-gold font-medium">
                    {program.category === "transformation" && "Transformation"}
                    {program.category === "performance" && "Performance"}
                    {program.category === "inclusive" && "Inclusif"}
                  </span>
                  {program.duration && (
                    <span className="text-sm text-gray-600">{program.duration} jours</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(program)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => {
                    if (confirm("Êtes-vous sûr de vouloir supprimer ce programme ?")) {
                      deleteMutation.mutate({ id: program.id });
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ClientsSection() {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignData, setAssignData] = useState({
    programId: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  const { data: clients, isLoading: clientsLoading, refetch: refetchClients } = trpc.admin.getAllClients.useQuery();
  const { data: programs } = trpc.programs.list.useQuery();
  const { data: clientDetails, refetch: refetchDetails } = trpc.admin.getClientDetails.useQuery(
    { clientId: selectedClient! },
    { enabled: selectedClient !== null }
  );

  const assignMutation = trpc.admin.assignProgram.useMutation({
    onSuccess: () => {
      toast.success("Programme assigné avec succès");
      refetchDetails();
      setShowAssignForm(false);
      setAssignData({ programId: 0, startDate: new Date().toISOString().split("T")[0], endDate: "" });
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const unassignMutation = trpc.admin.unassignProgram.useMutation({
    onSuccess: () => {
      toast.success("Programme retiré avec succès");
      refetchDetails();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const handleAssign = () => {
    if (!selectedClient || !assignData.programId) {
      toast.error("Veuillez sélectionner un programme");
      return;
    }

    assignMutation.mutate({
      clientId: selectedClient,
      programId: assignData.programId,
      startDate: new Date(assignData.startDate),
      endDate: assignData.endDate ? new Date(assignData.endDate) : undefined,
    });
  };

  if (clientsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Liste des clients */}
      <div className="lg:col-span-1">
        <h2 className="text-2xl font-bold text-black mb-6">Clients</h2>
        <div className="space-y-2">
          {clients?.map((client) => (
            <Card
              key={client.id}
              onClick={() => setSelectedClient(client.id)}
              className={`p-4 cursor-pointer transition-colors ${
                selectedClient === client.id ? "border-gold bg-gold/5" : "border-gray-200 hover:border-gold/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-gold" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-black">{client.name || "Sans nom"}</p>
                  <p className="text-sm text-gray-600">{client.email}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Détails du client */}
      <div className="lg:col-span-2">
        {selectedClient ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">Programmes assignés</h2>
              <Button
                onClick={() => setShowAssignForm(!showAssignForm)}
                className="bg-gold text-black hover:bg-gold/90 flex items-center gap-2"
              >
                {showAssignForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showAssignForm ? "Annuler" : "Assigner un programme"}
              </Button>
            </div>

            {showAssignForm && (
              <Card className="p-6 mb-6 border-gold/30">
                <h3 className="text-lg font-semibold text-black mb-4">Assigner un nouveau programme</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black mb-2">Programme</label>
                    <select
                      value={assignData.programId}
                      onChange={(e) => setAssignData({ ...assignData, programId: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
                    >
                      <option value="0">Sélectionner un programme</option>
                      {programs?.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Date de début</label>
                    <input
                      type="date"
                      value={assignData.startDate}
                      onChange={(e) => setAssignData({ ...assignData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Date de fin (optionnel)</label>
                    <input
                      type="date"
                      value={assignData.endDate}
                      onChange={(e) => setAssignData({ ...assignData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={handleAssign}
                    disabled={assignMutation.isPending}
                    className="bg-gold text-black hover:bg-gold/90"
                  >
                    {assignMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Assigner
                  </Button>
                  <Button onClick={() => setShowAssignForm(false)} variant="outline">
                    Annuler
                  </Button>
                </div>
              </Card>
            )}

            <div className="space-y-4">
              {clientDetails?.programs.map((cp: any) => {
                const program = programs?.find((p) => p.id === cp.programId);
                return (
                  <Card key={cp.id} className="p-6 border-gold/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-black">{program?.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Début: {new Date(cp.startDate).toLocaleDateString("fr-FR")}
                          {cp.endDate && ` - Fin: ${new Date(cp.endDate).toLocaleDateString("fr-FR")}`}
                        </p>
                        <span
                          className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                            cp.status === "active"
                              ? "bg-green-100 text-green-800"
                              : cp.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {cp.status === "active" && "Actif"}
                          {cp.status === "completed" && "Terminé"}
                          {cp.status === "paused" && "En pause"}
                        </span>
                      </div>
                      <Button
                        onClick={() => {
                          if (confirm("Êtes-vous sûr de vouloir retirer ce programme ?")) {
                            unassignMutation.mutate({ clientProgramId: cp.id });
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        disabled={unassignMutation.isPending}
                      >
                        {unassignMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
              {clientDetails?.programs.length === 0 && (
                <Card className="p-8 text-center border-gold/30">
                  <p className="text-gray-600">Aucun programme assigné à ce client</p>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card className="p-8 text-center border-gold/30">
            <p className="text-gray-600">Sélectionnez un client pour voir ses programmes</p>
          </Card>
        )}
      </div>
    </div>
  );
}

function ResourcesSection() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    programId: 0,
    type: "pdf" as "pdf" | "video",
    title: "",
    description: "",
    url: "",
    order: 0,
  });

  const { data: programs } = trpc.programs.list.useQuery();
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const { data: resources, refetch } = trpc.programs.getResources.useQuery(
    { programId: selectedProgram! },
    { enabled: selectedProgram !== null }
  );

  const addMutation = trpc.admin.addResource.useMutation({
    onSuccess: () => {
      toast.success("Ressource ajoutée avec succès");
      refetch();
      setShowAddForm(false);
      setFormData({
        programId: 0,
        type: "pdf",
        title: "",
        description: "",
        url: "",
        order: 0,
      });
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const deleteMutation = trpc.admin.deleteResource.useMutation({
    onSuccess: () => {
      toast.success("Ressource supprimée avec succès");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!formData.programId || !formData.title || !formData.url) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    addMutation.mutate(formData);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Gestion des Ressources</h2>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gold text-black hover:bg-gold/90 flex items-center gap-2"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? "Annuler" : "Ajouter une ressource"}
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6 mb-6 border-gold/30">
          <h3 className="text-lg font-semibold text-black mb-4">Ajouter une nouvelle ressource</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-black mb-2">Programme</label>
              <select
                value={formData.programId}
                onChange={(e) => setFormData({ ...formData, programId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
              >
                <option value="0">Sélectionner un programme</option>
                {programs?.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as "pdf" | "video" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
              >
                <option value="pdf">PDF</option>
                <option value="video">Vidéo YouTube</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Titre</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Plan d'entraînement semaine 1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-black mb-2">URL</label>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder={formData.type === "pdf" ? "https://..." : "https://www.youtube.com/watch?v=..."}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-black mb-2">Description (optionnel)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la ressource..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleSubmit}
              disabled={addMutation.isPending}
              className="bg-gold text-black hover:bg-gold/90"
            >
              {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Ajouter
            </Button>
            <Button onClick={() => setShowAddForm(false)} variant="outline">
              Annuler
            </Button>
          </div>
        </Card>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-black mb-2">Filtrer par programme</label>
        <select
          value={selectedProgram || ""}
          onChange={(e) => setSelectedProgram(e.target.value ? parseInt(e.target.value) : null)}
          className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
        >
          <option value="">Sélectionner un programme</option>
          {programs?.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProgram ? (
        <div className="grid grid-cols-1 gap-4">
          {resources?.map((resource) => (
            <Card key={resource.id} className="p-6 border-gold/30">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        resource.type === "pdf" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {resource.type === "pdf" ? "PDF" : "Vidéo"}
                    </span>
                    <h3 className="text-lg font-semibold text-black">{resource.title}</h3>
                  </div>
                  {resource.description && <p className="text-sm text-gray-600 mb-2">{resource.description}</p>}
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gold hover:underline"
                  >
                    {resource.url}
                  </a>
                </div>
                <Button
                  onClick={() => {
                    if (confirm("Êtes-vous sûr de vouloir supprimer cette ressource ?")) {
                      deleteMutation.mutate({ id: resource.id });
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </Card>
          ))}
          {resources?.length === 0 && (
            <Card className="p-8 text-center border-gold/30">
              <p className="text-gray-600">Aucune ressource pour ce programme</p>
            </Card>
          )}
        </div>
      ) : (
        <Card className="p-8 text-center border-gold/30">
          <p className="text-gray-600">Sélectionnez un programme pour voir ses ressources</p>
        </Card>
      )}
    </div>
  );
}
