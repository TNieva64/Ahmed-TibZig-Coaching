import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Video, Clock, MessageSquare, CheckCircle, AlertCircle, Play } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function FormAnalysis() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: videos, isLoading, refetch } = trpc.formVideo.getUserVideos.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const uploadVideoMutation = trpc.formVideo.uploadVideo.useMutation({
    onSuccess: () => {
      toast.success("Vidéo uploadée avec succès !");
      refetch();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast.error("Veuillez sélectionner un fichier vidéo.");
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("La vidéo est trop volumineuse. Taille maximale : 100MB.");
      return;
    }

    setIsUploading(true);

    try {
      // In a real implementation, you would upload to S3 first
      // For now, we'll create a placeholder URL
      const videoUrl = `https://storage.example.com/videos/${Date.now()}-${file.name}`;
      
      uploadVideoMutation.mutate({
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        videoUrl,
        description: "",
      });
    } catch (error) {
      toast.error("Erreur lors de l'upload de la vidéo.");
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">En attente</Badge>;
      case "reviewed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Analysée</Badge>;
      case "needs_revision":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">À revoir</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">{status}</Badge>;
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-900 border-gold/20 max-w-md">
          <CardHeader>
            <CardTitle className="text-gold">Connexion requise</CardTitle>
            <CardDescription>Vous devez être connecté pour accéder à l'analyse vidéo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setLocation("/api/oauth/login")} 
              className="w-full bg-gold text-black hover:bg-gold/90"
            >
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl font-bold text-gold mb-4">Analyse Vidéo de Forme</h1>
          <p className="text-gray-400 text-lg">Uploadez vos vidéos d'exercices pour recevoir un feedback personnalisé d'Ahmed</p>
        </div>

        {/* Upload Section */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-gold flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Uploader une vidéo
            </CardTitle>
            <CardDescription>Formats acceptés : MP4, MOV, AVI (max 100MB)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="video-upload" className="text-white">Sélectionner une vidéo</Label>
                <Input
                  id="video-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="bg-gray-800 border-gray-700 text-white mt-2"
                />
              </div>

              {isUploading && (
                <div className="flex items-center gap-2 text-gold">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold"></div>
                  <span>Upload en cours...</span>
                </div>
              )}

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-gold" />
                  Conseils pour une bonne vidéo
                </h4>
                <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                  <li>Filmez de profil ou de face selon l'exercice</li>
                  <li>Assurez-vous que tout votre corps est visible</li>
                  <li>Utilisez un bon éclairage</li>
                  <li>Évitez les arrière-plans encombrés</li>
                  <li>Filmez plusieurs répétitions de l'exercice</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Videos List */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Mes vidéos</h2>

          {videos && videos.length === 0 ? (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="py-12 text-center">
                <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Aucune vidéo uploadée.</p>
                <p className="text-gray-500 text-sm mt-2">Commencez par uploader votre première vidéo pour recevoir un feedback personnalisé.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos?.map((video) => (
                <Card 
                  key={video.id} 
                  className="bg-gray-900 border-gray-800 hover:border-gold/50 transition-all cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg">{video.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {new Date(video.uploadedAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </CardDescription>
                      </div>
                      {getStatusBadge(video.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {video.description && (
                        <div className="text-sm text-gray-400 line-clamp-2">
                          {video.description}
                        </div>
                      )}

                      {video.coachFeedback && (
                        <div className="bg-gold/10 border border-gold/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-gold text-sm font-semibold mb-1">
                            <MessageSquare className="w-4 h-4" />
                            Feedback d'Ahmed
                          </div>
                          <p className="text-sm text-gray-300 line-clamp-3">{video.coachFeedback}</p>
                        </div>
                      )}

                      <Button className="w-full bg-gold text-black hover:bg-gold/90 flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Voir la vidéo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Detail Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl">
          {selectedVideo && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-gold flex items-center justify-between">
                  <span>{selectedVideo.title}</span>
                  {getStatusBadge(selectedVideo.status)}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Video Player */}
                <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                  <div className="text-center">
                    <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Lecteur vidéo (à implémenter avec URL S3)</p>
                  </div>
                </div>

                {/* Video Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Date d'upload</p>
                    <p className="text-white font-medium">
                      {new Date(selectedVideo.uploadedAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {selectedVideo.reviewedAt && (
                    <div>
                      <p className="text-sm text-gray-400">Date d'analyse</p>
                      <p className="text-white font-medium">
                        {new Date(selectedVideo.reviewedAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedVideo.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gold mb-2">Vos notes</h3>
                    <p className="text-gray-300">{selectedVideo.description}</p>
                  </div>
                )}

                {/* Coach Feedback */}
                {selectedVideo.coachFeedback ? (
                  <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gold mb-2 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Feedback d'Ahmed
                    </h3>
                    <p className="text-gray-300 whitespace-pre-line">{selectedVideo.coachFeedback}</p>
                  </div>
                ) : (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                    <Clock className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">En attente de l'analyse d'Ahmed</p>
                    <p className="text-sm text-gray-500 mt-1">Vous recevrez une notification dès que le feedback sera disponible.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
