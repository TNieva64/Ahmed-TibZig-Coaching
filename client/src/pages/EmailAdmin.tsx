import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, Mail, Send, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function EmailAdmin() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch email logs
  const { data: logs, isLoading, refetch } = trpc.email.getAllEmailLogs.useQuery({ limit: 100 }, {
    enabled: isAuthenticated && user?.role === "ADMIN",
  });

  // Fetch templates
  const { data: templates } = trpc.email.getTemplates.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "ADMIN",
  });

  // Initialize templates
  const initMutation = trpc.email.initializeTemplates.useMutation({
    onSuccess: () => {
      toast.success("Templates initialisés avec succès !");
      refetch();
    },
  });

  // Run Day 3 scheduler
  const day3Mutation = trpc.email.runDay3Scheduler.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
    },
  });

  // Run Day 7 scheduler
  const day7Mutation = trpc.email.runDay7Scheduler.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
    },
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    setLocation("/");
    return null;
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      sent: "bg-green-500/20 text-green-500",
      pending: "bg-yellow-500/20 text-yellow-500",
      failed: "bg-red-500/20 text-red-500",
      bounced: "bg-orange-500/20 text-orange-500",
    };
    return colors[status] || "bg-gray-500/20 text-gray-500";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4" />;
      case "failed":
      case "bounced":
        return <XCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-gold mb-2">Administration des Emails</h1>
            <p className="text-gray-400">
              {logs?.length || 0} emails envoyés • {templates?.length || 0} templates
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-gold/20 text-gold hover:bg-gold/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-zinc-900 border-gold/20 p-6">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <Mail className="h-5 w-5 text-gold" />
              Templates
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Initialiser les templates d'emails dans la base de données
            </p>
            <Button
              onClick={() => initMutation.mutate()}
              disabled={initMutation.isPending}
              className="w-full bg-gold text-black hover:bg-gold/90"
            >
              {initMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Initialiser les templates
            </Button>
          </Card>

          <Card className="bg-zinc-900 border-gold/20 p-6">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-500" />
              Emails J+3
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Envoyer les emails de conseils aux utilisateurs inscrits il y a 3 jours
            </p>
            <Button
              onClick={() => day3Mutation.mutate()}
              disabled={day3Mutation.isPending}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              {day3Mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Envoyer les emails J+3
            </Button>
          </Card>

          <Card className="bg-zinc-900 border-gold/20 p-6">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <Send className="h-5 w-5 text-purple-500" />
              Emails J+7
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Envoyer les emails de check-in aux utilisateurs inscrits il y a 7 jours
            </p>
            <Button
              onClick={() => day7Mutation.mutate()}
              disabled={day7Mutation.isPending}
              className="w-full bg-purple-600 text-white hover:bg-purple-700"
            >
              {day7Mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Envoyer les emails J+7
            </Button>
          </Card>
        </div>

        {/* Email Logs */}
        <Card className="bg-zinc-900 border-gold/20 p-6">
          <h2 className="text-2xl font-bold text-gold mb-6">Historique des emails</h2>

          {!logs || logs.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucun email envoyé pour le moment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Statut</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Template</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Destinataire</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Sujet</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusColor(log.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(log.status)}
                          {log.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-white font-mono">{log.templateName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-300">{log.recipientEmail}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-300">{log.subject}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-400">
                          {log.sentAt
                            ? new Date(log.sentAt).toLocaleString("fr-FR")
                            : new Date(log.createdAt).toLocaleString("fr-FR")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Templates List */}
        {templates && templates.length > 0 && (
          <Card className="bg-zinc-900 border-gold/20 p-6 mt-8">
            <h2 className="text-2xl font-bold text-gold mb-6">Templates disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="bg-zinc-800 border-zinc-700 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white">{template.name}</h3>
                    <Badge className={template.isActive ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-500"}>
                      {template.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{template.subject}</p>
                  <Badge variant="outline" className="border-gold/30 text-gold text-xs">
                    {template.category}
                  </Badge>
                </Card>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
