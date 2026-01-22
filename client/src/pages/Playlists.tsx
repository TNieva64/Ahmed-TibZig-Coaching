import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Eye, Lock, Globe } from "lucide-react";


export default function Playlists() {
  const toast = ({ title, description, variant }: { title: string; description?: string; variant?: string }) => {
    alert(title + (description ? `\n${description}` : ""));
  };
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<number | null>(null);
  const [newPlaylist, setNewPlaylist] = useState({
    name: "",
    description: "",
    isPublic: false,
  });

  // Queries
  const { data: myPlaylists, refetch: refetchMine } = trpc.playlist.listMine.useQuery();
  const { data: publicPlaylists } = trpc.playlist.listPublic.useQuery();
  const { data: playlistDetails } = trpc.playlist.getById.useQuery(
    { id: selectedPlaylist! },
    { enabled: !!selectedPlaylist }
  );

  // Mutations
  const createMutation = trpc.playlist.create.useMutation({
    onSuccess: () => {
      toast({ title: "✅ Playlist créée avec succès !" });
      refetchMine();
      setIsCreateDialogOpen(false);
      setNewPlaylist({ name: "", description: "", isPublic: false });
    },
    onError: (error) => {
      toast({ title: "❌ Erreur", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = trpc.playlist.delete.useMutation({
    onSuccess: () => {
      toast({ title: "✅ Playlist supprimée" });
      refetchMine();
      setSelectedPlaylist(null);
    },
    onError: (error) => {
      toast({ title: "❌ Erreur", description: error.message, variant: "destructive" });
    },
  });

  const handleCreatePlaylist = () => {
    if (!newPlaylist.name.trim()) {
      toast({ title: "⚠️ Le nom est requis", variant: "destructive" });
      return;
    }
    createMutation.mutate(newPlaylist);
  };

  const handleDeletePlaylist = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette playlist ?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gold">Mes Playlists d'Exercices</h1>
          <p className="text-muted-foreground mt-2">
            Créez des collections d'exercices pour vos routines d'échauffement ou circuits personnalisés
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold/90 text-black">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Playlist
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-gold/20">
            <DialogHeader>
              <DialogTitle className="text-gold">Créer une Playlist</DialogTitle>
              <DialogDescription>
                Donnez un nom à votre collection d'exercices
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de la playlist *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Échauffement matinal, Circuit HIIT, Étirements..."
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                  className="border-gold/20"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez l'objectif de cette playlist..."
                  value={newPlaylist.description || ""}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                  className="border-gold/20"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newPlaylist.isPublic}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, isPublic: e.target.checked })}
                  className="rounded border-gold/20"
                />
                <Label htmlFor="isPublic" className="cursor-pointer">
                  Rendre publique (visible par tous les utilisateurs)
                </Label>
              </div>

              <Button
                onClick={handleCreatePlaylist}
                disabled={createMutation.isPending}
                className="w-full bg-gold hover:bg-gold/90 text-black"
              >
                {createMutation.isPending ? "Création..." : "Créer la Playlist"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mes Playlists */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Mes Playlists ({myPlaylists?.length || 0})</h2>
        
        {!myPlaylists || myPlaylists.length === 0 ? (
          <Card className="border-gold/20 bg-card/50">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Vous n'avez pas encore créé de playlist.
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gold hover:bg-gold/90 text-black"
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer ma première playlist
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPlaylists.map((playlist) => (
              <Card
                key={playlist.id}
                className="border-gold/20 bg-card hover:border-gold/40 transition-colors cursor-pointer"
                onClick={() => setSelectedPlaylist(playlist.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-gold flex items-center gap-2">
                      {playlist.name}
                      {playlist.isPublic ? (
                        <Globe className="h-4 w-4 text-green-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(playlist.id);
                      }}
                      className="hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {playlist.description || "Aucune description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {playlist.createdAt ? new Date(playlist.createdAt).toLocaleDateString("fr-FR") : "Date inconnue"}
                    </span>
                    <Badge variant="outline" className="border-gold/30">
                      {playlist.isPublic ? "Publique" : "Privée"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Playlists Publiques */}
      {publicPlaylists && publicPlaylists.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Playlists Publiques ({publicPlaylists.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicPlaylists.map((playlist) => (
              <Card
                key={playlist.id}
                className="border-gold/20 bg-card/50 hover:border-gold/40 transition-colors cursor-pointer"
                onClick={() => setSelectedPlaylist(playlist.id)}
              >
                <CardHeader>
                  <CardTitle className="text-gold flex items-center gap-2">
                    {playlist.name}
                    <Globe className="h-4 w-4 text-green-500" />
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {playlist.description || "Aucune description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {playlist.createdAt ? new Date(playlist.createdAt).toLocaleDateString("fr-FR") : "Date inconnue"}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Détails de la Playlist Sélectionnée */}
      {selectedPlaylist && playlistDetails && (
        <Dialog open={!!selectedPlaylist} onOpenChange={() => setSelectedPlaylist(null)}>
          <DialogContent className="bg-card border-gold/20 max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gold flex items-center gap-2">
                {playlistDetails.name}
                {playlistDetails.isPublic ? (
                  <Globe className="h-5 w-5 text-green-500" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
              </DialogTitle>
              <DialogDescription>
                {playlistDetails.description || "Aucune description"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Exercices ({playlistDetails.exercises?.length || 0})
                </h3>
                <Button
                  size="sm"
                  className="bg-gold hover:bg-gold/90 text-black"
                  onClick={() => {
                    toast({
                      title: "🚧 Fonctionnalité à venir",
                      description: "L'ajout d'exercices sera disponible prochainement",
                    });
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un exercice
                </Button>
              </div>

              {!playlistDetails.exercises || playlistDetails.exercises.length === 0 ? (
                <Card className="border-gold/20 bg-card/50">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Cette playlist est vide. Ajoutez des exercices pour commencer.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {playlistDetails.exercises.map((item, index) => (
                    <Card key={item.id} className="border-gold/20 bg-card/30">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gold/20 text-gold font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold">{item.exercise?.name || "Exercice inconnu"}</h4>
                              <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                                {item.sets && <span>{item.sets} séries</span>}
                                {item.reps && <span>{item.reps} reps</span>}
                                {item.duration && <span>{item.duration}s</span>}
                              </div>
                              {item.notes && (
                                <p className="text-sm text-muted-foreground mt-2">{item.notes}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-red-500/10 hover:text-red-500"
                            onClick={() => {
                              toast({
                                title: "🚧 Fonctionnalité à venir",
                                description: "La suppression d'exercices sera disponible prochainement",
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
