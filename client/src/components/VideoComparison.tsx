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
  ArrowLeftRight,
} from "lucide-react";

interface VideoComparisonProps {
  videoUrl1: string;
  videoUrl2: string;
  title1?: string;
  title2?: string;
}

export default function VideoComparison({
  videoUrl1,
  videoUrl2,
  title1 = "Vidéo 1",
  title2 = "Vidéo 2",
}: VideoComparisonProps) {
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [splitRatio, setSplitRatio] = useState(50); // Pourcentage pour le split (50 = 50/50)

  // Synchronisation des vidéos
  useEffect(() => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;
    if (!video1 || !video2) return;

    const handleTimeUpdate = () => {
      // Utiliser la vidéo 1 comme référence
      setCurrentTime(video1.currentTime);

      // Synchroniser la vidéo 2 si elle dérive de plus de 0.3s
      if (Math.abs(video2.currentTime - video1.currentTime) > 0.3) {
        video2.currentTime = video1.currentTime;
      }
    };

    const handleLoadedMetadata = () => {
      // Utiliser la durée la plus longue
      setDuration(Math.max(video1.duration, video2.duration));
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video1.addEventListener("timeupdate", handleTimeUpdate);
    video1.addEventListener("loadedmetadata", handleLoadedMetadata);
    video1.addEventListener("play", handlePlay);
    video1.addEventListener("pause", handlePause);

    video2.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video1.removeEventListener("timeupdate", handleTimeUpdate);
      video1.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video1.removeEventListener("play", handlePlay);
      video1.removeEventListener("pause", handlePause);
      video2.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;
    if (!video1 || !video2) return;

    if (isPlaying) {
      video1.pause();
      video2.pause();
    } else {
      // Synchroniser avant de lancer
      video2.currentTime = video1.currentTime;
      video1.play();
      video2.play();
    }
  };

  const handleSeek = (value: number[]) => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;
    if (!video1 || !video2) return;

    video1.currentTime = value[0];
    video2.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;
    if (!video1 || !video2) return;

    video1.volume = value[0];
    video2.volume = value[0];
    setVolume(value[0]);
    setIsMuted(value[0] === 0);
  };

  const toggleMute = () => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;
    if (!video1 || !video2) return;

    video1.muted = !isMuted;
    video2.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const skipTime = (seconds: number) => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;
    if (!video1 || !video2) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    video1.currentTime = newTime;
    video2.currentTime = newTime;
  };

  const changePlaybackRate = (rate: number) => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;
    if (!video1 || !video2) return;

    video1.playbackRate = rate;
    video2.playbackRate = rate;
    setPlaybackRate(rate);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="border-gold/20 bg-card">
      <CardContent className="p-6">
        <div ref={containerRef} className="relative">
          {/* Split View Controls */}
          <div className="mb-4 flex items-center gap-4">
            <span className="text-sm font-semibold text-gold flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              Ratio d'affichage:
            </span>
            <div className="flex gap-2">
              {[
                { label: "40/60", value: 40 },
                { label: "50/50", value: 50 },
                { label: "60/40", value: 60 },
              ].map((ratio) => (
                <Button
                  key={ratio.value}
                  size="sm"
                  variant={splitRatio === ratio.value ? "default" : "outline"}
                  onClick={() => setSplitRatio(ratio.value)}
                  className={splitRatio === ratio.value ? "bg-gold text-black" : ""}
                >
                  {ratio.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Video Split View */}
          <div className="relative bg-black rounded-lg overflow-hidden mb-4 flex">
            {/* Vidéo 1 */}
            <div
              className="relative"
              style={{ width: `${splitRatio}%`, borderRight: "2px solid #FFD700" }}
            >
              <div className="absolute top-2 left-2 z-10 bg-black/70 px-3 py-1 rounded text-gold text-sm font-semibold">
                {title1}
              </div>
              <video
                ref={video1Ref}
                src={videoUrl1}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Vidéo 2 */}
            <div className="relative" style={{ width: `${100 - splitRatio}%` }}>
              <div className="absolute top-2 left-2 z-10 bg-black/70 px-3 py-1 rounded text-gold text-sm font-semibold">
                {title2}
              </div>
              <video
                ref={video2Ref}
                src={videoUrl2}
                className="w-full h-full object-cover"
              />
            </div>
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
                <Button
                  size="icon"
                  variant="outline"
                  onClick={togglePlay}
                  className="bg-gold hover:bg-gold/90 text-black"
                >
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

            {/* Info */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Lecture synchronisée :</strong> Les deux vidéos sont automatiquement
                synchronisées. Utilisez les contrôles pour comparer la technique en temps réel.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
