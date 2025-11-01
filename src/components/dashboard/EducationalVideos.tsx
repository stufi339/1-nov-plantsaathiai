import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Play, Clock, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Video {
  id: string;
  title: string;
  titleHi: string;
  titleBn: string;
  description: string;
  descriptionHi: string;
  descriptionBn: string;
  youtubeId: string;
  thumbnail?: string;
  duration?: string;
  category: string;
  views?: number;
  addedAt: string;
}

export const EducationalVideos = () => {
  const { t, i18n } = useTranslation();
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = () => {
    try {
      const stored = localStorage.getItem('educational_videos');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Sort by date, newest first
        const sorted = parsed.sort((a: Video, b: Video) => 
          new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );
        setVideos(sorted.slice(0, 6)); // Show top 6
      }
    } catch (error) {
      console.error("Failed to load videos:", error);
    }
  };

  const getLocalizedTitle = (video: Video) => {
    if (i18n.language === 'hi') return video.titleHi || video.title;
    if (i18n.language === 'bn') return video.titleBn || video.title;
    return video.title;
  };

  const getLocalizedDescription = (video: Video) => {
    if (i18n.language === 'hi') return video.descriptionHi || video.description;
    if (i18n.language === 'bn') return video.descriptionBn || video.description;
    return video.description;
  };

  const getThumbnail = (video: Video) => {
    return video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;
  };

  if (videos.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Play className="h-5 w-5 text-red-600" />
          <h2 className="text-xl font-bold">{t("educationalVideos") || "खेती की जानकारी"}</h2>
        </div>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="w-full max-w-4xl bg-background rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                title={getLocalizedTitle(selectedVideo)}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{getLocalizedTitle(selectedVideo)}</h3>
              <p className="text-sm text-muted-foreground">{getLocalizedDescription(selectedVideo)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <Card
            key={video.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
            onClick={() => setSelectedVideo(video)}
          >
            <div className="relative aspect-video bg-muted">
              <img
                src={getThumbnail(video)}
                alt={getLocalizedTitle(video)}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to default thumbnail
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                }}
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
                  <Play className="h-8 w-8 text-white ml-1" fill="white" />
                </div>
              </div>
              {video.duration && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                {getLocalizedTitle(video)}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {getLocalizedDescription(video)}
              </p>
              {video.views && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{video.views.toLocaleString()} views</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
