import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Award, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Story {
  id: string;
  farmerName: string;
  location: string;
  achievement: string;
  achievementHi: string;
  achievementBn: string;
  imageUrl?: string;
  yieldIncrease?: number;
  cropType?: string;
  addedAt: string;
}

export const FarmerStories = () => {
  const { t, i18n } = useTranslation();
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = () => {
    try {
      const stored = localStorage.getItem('farmer_stories');
      if (stored) {
        const parsed = JSON.parse(stored);
        const sorted = parsed.sort((a: Story, b: Story) => 
          new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );
        setStories(sorted.slice(0, 3)); // Show top 3
      }
    } catch (error) {
      console.error("Failed to load stories:", error);
    }
  };

  const getLocalizedAchievement = (story: Story) => {
    if (i18n.language === 'hi') return story.achievementHi || story.achievement;
    if (i18n.language === 'bn') return story.achievementBn || story.achievement;
    return story.achievement;
  };

  if (stories.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5 text-yellow-600" />
        <h2 className="text-xl font-bold">{t("successStories") || "सफलता की कहानियां"}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stories.map((story) => (
          <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {story.imageUrl && (
              <div className="aspect-video bg-muted">
                <img
                  src={story.imageUrl}
                  alt={story.farmerName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{story.farmerName}</h3>
                  <p className="text-xs text-muted-foreground">📍 {story.location}</p>
                </div>
                {story.yieldIncrease && (
                  <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-xs font-semibold">+{story.yieldIncrease}%</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {getLocalizedAchievement(story)}
              </p>
              {story.cropType && (
                <div className="mt-2 inline-block text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {story.cropType}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
