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
    // Auto-seed if empty
    if (stories.length === 0) {
      seedDefaultStories();
    }
  }, []);

  const seedDefaultStories = () => {
    const defaultStories: Story[] = [
      {
        id: "1",
        farmerName: "Ramesh Kumar",
        location: "Punjab, India",
        achievement: "Increased rice yield by 40% using satellite monitoring and smart irrigation",
        achievementHi: "उपग्रह निगरानी और स्मार्ट सिंचाई का उपयोग करके धान की उपज में 40% की वृद्धि",
        achievementBn: "স্যাটেলাইট মনিটরিং এবং স্মার্ট সেচ ব্যবহার করে ধানের ফলন 40% বৃদ্ধি",
        imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
        yieldIncrease: 40,
        cropType: "Rice",
        addedAt: new Date().toISOString()
      },
      {
        id: "2",
        farmerName: "Sunita Devi",
        location: "Haryana, India",
        achievement: "Reduced water usage by 30% while maintaining crop health using Jal Saathi",
        achievementHi: "जल साथी का उपयोग करके फसल स्वास्थ्य बनाए रखते हुए पानी के उपयोग में 30% की कमी",
        achievementBn: "জল সাথী ব্যবহার করে ফসলের স্বাস্থ্য বজায় রেখে জলের ব্যবহার 30% হ্রাস",
        imageUrl: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=800",
        yieldIncrease: 25,
        cropType: "Wheat",
        addedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: "3",
        farmerName: "Vijay Singh",
        location: "Uttar Pradesh, India",
        achievement: "Early disease detection saved entire crop, preventing ₹2 lakh loss",
        achievementHi: "शीघ्र रोग पहचान ने पूरी फसल बचाई, ₹2 लाख के नुकसान को रोका",
        achievementBn: "প্রাথমিক রোগ সনাক্তকরণ সম্পূর্ণ ফসল বাঁচিয়েছে, ₹2 লক্ষ ক্ষতি প্রতিরোধ করেছে",
        imageUrl: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
        yieldIncrease: 35,
        cropType: "Sugarcane",
        addedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    
    localStorage.setItem('farmer_stories', JSON.stringify(defaultStories));
    setStories(defaultStories);
  };

  const loadStories = () => {
    try {
      const stored = localStorage.getItem('farmer_stories');
      if (stored) {
        const parsed = JSON.parse(stored);
        const sorted = parsed.sort((a: Story, b: Story) => 
          new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );
        setStories(sorted.slice(0, 3)); // Show top 3
      } else {
        seedDefaultStories();
      }
    } catch (error) {
      console.error("Failed to load stories:", error);
      seedDefaultStories();
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
