import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  ArrowRight,
  Circle,
  Square,
  Type,
  Minus,
  Trash2,
  Bookmark,
} from "lucide-react";

interface Annotation {
  id?: number;
  timestamp: number;
  type: "arrow" | "circle" | "rectangle" | "text" | "line";
  data: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    text?: string;
    color: string;
    strokeWidth: number;
  };
  notes?: string;
}

interface Marker {
  id?: number;
  timestamp: number;
  title: string;
  description?: string | null;
  color: string | null;
}

interface VideoPlayerProps {
  videoUrl: string;
  annotations?: Annotation[];
  markers?: Marker[];
  onAddAnnotation?: (annotation: Omit<Annotation, "id">) => void;
  onDeleteAnnotation?: (id: number) => void;
  onAddMarker?: (marker: Omit<Marker, "id">) => void;
  onDeleteMarker?: (id: number) => void;
  readOnly?: boolean;
}

export default function VideoPlayer({
  videoUrl,
  annotations = [],
  markers = [],
  onAddAnnotation,
  onDeleteAnnotation,
  onAddMarker,
  onDeleteMarker,
  readOnly = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Annotation state
  const [selectedTool, setSelectedTool] = useState<"arrow" | "circle" | "rectangle" | "text" | "line" | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentAnnotations, setCurrentAnnotations] = useState<Annotation[]>(annotations);

  // Update annotations when prop changes
  useEffect(() => {
    setCurrentAnnotations(annotations);
  }, [annotations]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  // Draw annotations on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw annotations at current timestamp (±0.5s tolerance)
    const relevantAnnotations = currentAnnotations.filter(
      (ann) => Math.abs(ann.timestamp - currentTime) < 0.5
    );

    relevantAnnotations.forEach((ann) => {
      ctx.strokeStyle = ann.data.color;
      ctx.lineWidth = ann.data.strokeWidth;
      ctx.fillStyle = ann.data.color;

      switch (ann.type) {
        case "arrow":
          drawArrow(ctx, ann.data.x, ann.data.y, ann.data.x + 50, ann.data.y + 50);
          break;
        case "circle":
          ctx.beginPath();
          ctx.arc(ann.data.x, ann.data.y, ann.data.width || 50, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        case "rectangle":
          ctx.strokeRect(ann.data.x, ann.data.y, ann.data.width || 100, ann.data.height || 100);
          break;
        case "line":
          ctx.beginPath();
          ctx.moveTo(ann.data.x, ann.data.y);
          ctx.lineTo(ann.data.x + (ann.data.width || 100), ann.data.y + (ann.data.height || 0));
          ctx.stroke();
          break;
        case "text":
          ctx.font = "20px Arial";
          ctx.fillText(ann.data.text || "", ann.data.x, ann.data.y);
          break;
      }
    });
  }, [currentTime, currentAnnotations]);

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
    const headLength = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.volume = value[0];
      setVolume(value[0]);
      setIsMuted(value[0] === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly || !selectedTool) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!isDrawing) {
      setIsDrawing(true);
      setDrawStart({ x, y });
    } else {
      setIsDrawing(false);

      if (drawStart && onAddAnnotation) {
        const annotation: Omit<Annotation, "id"> = {
          timestamp: currentTime,
          type: selectedTool,
          data: {
            x: drawStart.x,
            y: drawStart.y,
            width: selectedTool === "circle" ? Math.abs(x - drawStart.x) : x - drawStart.x,
            height: y - drawStart.y,
            color: "#FFD700",
            strokeWidth: 3,
            text: selectedTool === "text" ? prompt("Entrez le texte :") || "" : undefined,
          },
        };

        onAddAnnotation(annotation);
        setCurrentAnnotations([...currentAnnotations, { ...annotation, id: Date.now() }]);
      }

      setDrawStart(null);
      setSelectedTool(null);
    }
  };

  const handleAddMarker = () => {
    const title = prompt("Titre du marqueur :");
    if (title && onAddMarker) {
      onAddMarker({
        timestamp: currentTime,
        title,
        description: "",
        color: "#FFD700",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="border-gold/20 bg-card">
      <CardContent className="p-6">
        <div ref={containerRef} className="relative">
          {/* Video and Canvas */}
          <div className="relative bg-black rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full"
              onLoadedMetadata={() => {
                const canvas = canvasRef.current;
                const video = videoRef.current;
                if (canvas && video) {
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;
                }
              }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full cursor-crosshair"
              onClick={handleCanvasClick}
            />
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Timeline */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{formatTime(currentTime)}</span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">{formatTime(duration)}</span>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={() => skipTime(-10)}>
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={togglePlay} className="bg-gold hover:bg-gold/90 text-black">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="outline" onClick={() => skipTime(10)}>
                  <SkipForward className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 ml-4">
                  <Button size="icon" variant="ghost" onClick={toggleMute}>
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="w-24"
                  />
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-muted-foreground">Vitesse:</span>
                  {[0.5, 1, 1.5, 2].map((rate) => (
                    <Button
                      key={rate}
                      size="sm"
                      variant={playbackRate === rate ? "default" : "outline"}
                      onClick={() => changePlaybackRate(rate)}
                      className={playbackRate === rate ? "bg-gold text-black" : ""}
                    >
                      {rate}x
                    </Button>
                  ))}
                </div>
              </div>

              <Button size="icon" variant="outline" onClick={toggleFullscreen}>
                <Maximize className="h-4 w-4" />
              </Button>
            </div>

            {/* Annotation Tools */}
            {!readOnly && (
              <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                <span className="text-sm font-semibold text-gold">Outils d'annotation:</span>
                <Button
                  size="sm"
                  variant={selectedTool === "arrow" ? "default" : "outline"}
                  onClick={() => setSelectedTool(selectedTool === "arrow" ? null : "arrow")}
                  className={selectedTool === "arrow" ? "bg-gold text-black" : ""}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Flèche
                </Button>
                <Button
                  size="sm"
                  variant={selectedTool === "circle" ? "default" : "outline"}
                  onClick={() => setSelectedTool(selectedTool === "circle" ? null : "circle")}
                  className={selectedTool === "circle" ? "bg-gold text-black" : ""}
                >
                  <Circle className="h-4 w-4 mr-2" />
                  Cercle
                </Button>
                <Button
                  size="sm"
                  variant={selectedTool === "rectangle" ? "default" : "outline"}
                  onClick={() => setSelectedTool(selectedTool === "rectangle" ? null : "rectangle")}
                  className={selectedTool === "rectangle" ? "bg-gold text-black" : ""}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Rectangle
                </Button>
                <Button
                  size="sm"
                  variant={selectedTool === "line" ? "default" : "outline"}
                  onClick={() => setSelectedTool(selectedTool === "line" ? null : "line")}
                  className={selectedTool === "line" ? "bg-gold text-black" : ""}
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Ligne
                </Button>
                <Button
                  size="sm"
                  variant={selectedTool === "text" ? "default" : "outline"}
                  onClick={() => setSelectedTool(selectedTool === "text" ? null : "text")}
                  className={selectedTool === "text" ? "bg-gold text-black" : ""}
                >
                  <Type className="h-4 w-4 mr-2" />
                  Texte
                </Button>
                <div className="h-6 w-px bg-border mx-2" />
                <Button size="sm" variant="outline" onClick={handleAddMarker}>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Marqueur
                </Button>
              </div>
            )}

            {/* Markers Timeline */}
            {markers.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-semibold text-gold">Marqueurs temporels:</span>
                <div className="flex flex-wrap gap-2">
                  {markers.map((marker) => (
                    <Button
                      key={marker.id}
                      size="sm"
                      variant="outline"
                      onClick={() => handleSeek([marker.timestamp])}
                      className="border-gold/30"
                      style={{ borderLeftColor: marker.color || "#FFD700", borderLeftWidth: 4 }}
                    >
                      {formatTime(marker.timestamp)} - {marker.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
