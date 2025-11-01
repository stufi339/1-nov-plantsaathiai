import { useState, useEffect } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Video {
  id: string;
  title: string;
  titleHi: string;
  titleBn: string;
  description: string;
  descriptionHi: string;
  descriptionBn: string;
  youtubeId: string;
  duration?: string;
  category: string;
  views?: number;
  addedAt: string;
}

export const VideoManager = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    titleHi: "",
    titleBn: "",
    description: "",
    descriptionHi: "",
    descriptionBn: "",
    youtubeId: "",
    duration: "",
    category: "farming-tips"
  });

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = () => {
    try {
      const stored = localStorage.getItem('educational_videos');
      if (stored) {
        setVideos(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load videos:", error);
    }
  };

  const saveVideos = (updatedVideos: Video[]) => {
    localStorage.setItem('educational_videos', JSON.stringify(updatedVideos));
    setVideos(updatedVideos);
  };

  const extractYoutubeId = (url: string): string => {
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return url;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const videoId = extractYoutubeId(formData.youtubeId);
    
    if (editingId) {
      const updated = videos.map(v => 
        v.id === editingId 
          ? { ...v, ...formData, youtubeId: videoId }
          : v
      );
      saveVideos(updated);
      setEditingId(null);
    } else {
      const newVideo: Video = {
        id: Date.now().toString(),
        ...formData,
        youtubeId: videoId,
        views: 0,
        addedAt: new Date().toISOString()
      };
      saveVideos([...videos, newVideo]);
    }
    
    resetForm();
    setIsAdding(false);
  };

  const handleEdit = (video: Video) => {
    setFormData({
      title: video.title,
      titleHi: video.titleHi,
      titleBn: video.titleBn,
      description: video.description,
      descriptionHi: video.descriptionHi,
      descriptionBn: video.descriptionBn,
      youtubeId: video.youtubeId,
      duration: video.duration || "",
      category: video.category
    });
    setEditingId(video.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this video?")) {
      saveVideos(videos.filter(v => v.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      titleHi: "",
      titleBn: "",
      description: "",
      descriptionHi: "",
      descriptionBn: "",
      youtubeId: "",
      duration: "",
      category: "farming-tips"
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Educational Videos ({videos.length})</h3>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Video
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Title (English)</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="How to grow rice"
                />
              </div>
              <div>
                <Label>Title (Hindi)</Label>
                <Input
                  value={formData.titleHi}
                  onChange={(e) => setFormData({...formData, titleHi: e.target.value})}
                  placeholder="धान कैसे उगाएं"
                />
              </div>
              <div>
                <Label>Title (Bengali)</Label>
                <Input
                  value={formData.titleBn}
                  onChange={(e) => setFormData({...formData, titleBn: e.target.value})}
                  placeholder="ধান কীভাবে চাষ করবেন"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Description (English)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Learn the best practices..."
                />
              </div>
              <div>
                <Label>Description (Hindi)</Label>
                <Textarea
                  value={formData.descriptionHi}
                  onChange={(e) => setFormData({...formData, descriptionHi: e.target.value})}
                  placeholder="सर्वोत्तम प्रथाओं को जानें..."
                />
              </div>
              <div>
                <Label>Description (Bengali)</Label>
                <Textarea
                  value={formData.descriptionBn}
                  onChange={(e) => setFormData({...formData, descriptionBn: e.target.value})}
                  placeholder="সেরা অনুশীলন শিখুন..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>YouTube URL or ID</Label>
                <Input
                  required
                  value={formData.youtubeId}
                  onChange={(e) => setFormData({...formData, youtubeId: e.target.value})}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <Label>Duration (optional)</Label>
                <Input
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  placeholder="10:30"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="farming-tips"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">{editingId ? "Update" : "Add"} Video</Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <div className="aspect-video bg-muted">
              <img
                src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h4 className="font-semibold mb-1">{video.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {video.description}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(video)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(video.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
