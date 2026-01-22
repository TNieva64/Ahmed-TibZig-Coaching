import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Video, Eye, Trash2 } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";

export default function VideoAnalysis() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
  const [newAnalysis, setNewAnalysis] = useState({
    clientId: 1, // TODO: Remplacer par sélection client réelle
    videoUrl: "",
    title: "",
    description: "",
  });

  const toast = ({ title, description, variant }: { title: string; description?: string; variant?: string }) => {
    alert(title + (description ? `\n${description}` : ""));
  };

  // Queries
  const { data: analyses, refetch } = trpc.videoAnnotation.listAnalyses.useQuery({});
  const { data: analysisDetails } = trpc.videoAnnotation.getAnalysis.useQuery(
    { id: selectedAnalysisId! },
    { enabled: !!selectedAnalysisId }
  );

  // Mutations
  const createMutation = trpc.videoAnnotation.createAnalysis.useMutation({
    onSuccess: () => {
      toast({ title: "✅ Analyse vidéo créée avec succès !" });
      refetch();
      setIsCreateDialogOpen(false);
      setNewAnalysis({ clientId: 1, videoUrl: "", title: "", description: "" });
    },
    onError: (error) => {
      toast({ title: "❌ Erreur", description: error.message, variant: "destructive" });
    },
  });

  const addAnnotationMutation = trpc.videoAnnotation.addAnnotation.useMutation({
    onSuccess: () => {
      toast({ title: "✅ Annotation ajoutée" });
      refetch();
    },
  });

  const addMarkerMutation = trpc.videoAnnotation.addMarker.useMutation({
    onSuccess: () => {
      toast({ title: "✅ Marqueur ajouté" });
      refetch();
    },
  });

  const deleteMutation = trpc.videoAnnotation.deleteAnalysis.useMutation({
    onSuccess: () => {
      toast({ title: "✅ Analyse supprimée" });
      refetch();
      setSelectedAnalysisId(null);
    },
  });

  const handleCreateAnalysis = () => {
    if (!newAnalysis.videoUrl || !newAnalysis.title) {
      toast({ title: "⚠️ URL et titre requis", variant: "destructive" });
      return;
    }
    createMutation.mutate(newAnalysis);
  };

  const handleDeleteAnalysis = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette analyse ?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gold">Analyse Vidéo</h1>
          <p className="text-muted-foreground mt-2">
            Analysez la technique de vos clients avec des outils d'annotation avancés
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold/90 text-black">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Analyse
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-gold/20">
            <DialogHeader>
              <DialogTitle className="text-gold">Créer une Analyse Vidéo</DialogTitle>
              <DialogDescription>
                Ajoutez une vidéo pour analyser la technique de votre client
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Analyse squat - Session 12"
                  value={newAnalysis.title}
                  onChange={(e) => setNewAnalysis({ ...newAnalysis, title: e.target.value })}
                  className="border-gold/20"
                />
              </div>

              <div>
                <Label htmlFor="videoUrl">URL de la vidéo *</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  value={newAnalysis.videoUrl}
                  onChange={(e) => setNewAnalysis({ ...newAnalysis, videoUrl: e.target.value })}
                  className="border-gold/20"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  placeholder="Notes sur la séance, points à observer..."
                  value={newAnalysis.description || ""}
                  onChange={(e) => setNewAnalysis({ ...newAnalysis, description: e.target.value })}
                  className="border-gold/20"
                />
              </div>

              <Button
                onClick={handleCreateAnalysis}
                disabled={createMutation.isPending}
                className="w-full bg-gold hover:bg-gold/90 text-black"
              >
                {createMutation.isPending ? "Création..." : "Créer l'Analyse"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des analyses */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Analyses Vidéo ({analyses?.length || 0})</h2>

        {!analyses || analyses.length === 0 ? (
          <Card className="border-gold/20 bg-card/50">
            <CardContent className="py-12 text-center">
              <Video className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Aucune analyse vidéo pour le moment.
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gold hover:bg-gold/90 text-black"
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer ma première analyse
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map((analysis) => (
              <Card
                key={analysis.id}
                className="border-gold/20 bg-card hover:border-gold/40 transition-colors cursor-pointer"
                onClick={() => setSelectedAnalysisId(analysis.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-gold flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      {analysis.title}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAnalysis(analysis.id);
                      }}
                      className="hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {analysis.description || "Aucune description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <Badge
                      variant="outline"
                      className={
                        analysis.status === "completed"
                          ? "border-green-500/30 text-green-500"
                          : analysis.status === "in_progress"
                          ? "border-yellow-500/30 text-yellow-500"
                          : "border-gray-500/30"
                      }
                    >
                      {analysis.status === "completed"
                        ? "Terminée"
                        : analysis.status === "in_progress"
                        ? "En cours"
                        : "En attente"}
                    </Badge>
                    <span className="text-muted-foreground">
                      {analysis.createdAt ? new Date(analysis.createdAt).toLocaleDateString("fr-FR") : "Date inconnue"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Lecteur vidéo avec annotations */}
      {selectedAnalysisId && analysisDetails && (
        <Dialog open={!!selectedAnalysisId} onOpenChange={() => setSelectedAnalysisId(null)}>
          <DialogContent className="bg-card border-gold/20 max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gold flex items-center gap-2">
                <Video className="h-5 w-5" />
                {analysisDetails.title}
              </DialogTitle>
              <DialogDescription>
                {analysisDetails.description || "Aucune description"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <VideoPlayer
                videoUrl={analysisDetails.videoUrl}
                annotations={(analysisDetails.annotations || []) as any}
                markers={analysisDetails.markers || []}
                onAddAnnotation={(annotation) => {
                  addAnnotationMutation.mutate({
                    videoAnalysisId: selectedAnalysisId,
                    ...annotation,
                  });
                }}
                onAddMarker={(marker) => {
                  addMarkerMutation.mutate({
                    videoAnalysisId: selectedAnalysisId,
                    timestamp: marker.timestamp,
                    title: marker.title,
                    description: marker.description || undefined,
                    color: marker.color || "#FFD700",
                  });
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-gold/20 bg-card/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Annotations ({analysisDetails.annotations?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!analysisDetails.annotations || analysisDetails.annotations.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucune annotation</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {analysisDetails.annotations.map((ann) => (
                          <div key={ann.id} className="text-sm p-2 bg-muted/30 rounded">
                            <span className="font-semibold">{Math.floor(ann.timestamp)}s</span> - {ann.type}
                            {ann.notes && <p className="text-muted-foreground mt-1">{ann.notes}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-gold/20 bg-card/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Marqueurs ({analysisDetails.markers?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!analysisDetails.markers || analysisDetails.markers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucun marqueur</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {analysisDetails.markers.map((marker) => (
                          <div key={marker.id} className="text-sm p-2 bg-muted/30 rounded">
                            <span className="font-semibold">{Math.floor(marker.timestamp)}s</span> - {marker.title}
                            {marker.description && <p className="text-muted-foreground mt-1">{marker.description}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
