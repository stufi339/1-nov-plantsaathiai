import { useState, useEffect } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

export const StoriesManager = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    farmerName: "",
    location: "",
    achievement: "",
    achievementHi: "",
    achievementBn: "",
    imageUrl: "",
    yieldIncrease: "",
    cropType: ""
  });

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = () => {
    try {
      const stored = localStorage.getItem('farmer_stories');
      if (stored) {
        setStories(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load stories:", error);
    }
  };

  const saveStories = (updatedStories: Story[]) => {
    localStorage.setItem('farmer_stories', JSON.stringify(updatedStories));
    setStories(updatedStories);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      const updated = stories.map(s => 
        s.id === editingId 
          ? { 
              ...s, 
              ...formData,
              yieldIncrease: formData.yieldIncrease ? parseFloat(formData.yieldIncrease) : undefined
            }
          : s
      );
      saveStories(updated);
      setEditingId(null);
    } else {
      const newStory: Story = {
        id: Date.now().toString(),
        farmerName: formData.farmerName,
        location: formData.location,
        achievement: formData.achievement,
        achievementHi: formData.achievementHi,
        achievementBn: formData.achievementBn,
        imageUrl: formData.imageUrl || undefined,
        yieldIncrease: formData.yieldIncrease ? parseFloat(formData.yieldIncrease) : undefined,
        cropType: formData.cropType || undefined,
        addedAt: new Date().toISOString()
      };
      saveStories([...stories, newStory]);
    }
    
    resetForm();
    setIsAdding(false);
  };

  const handleEdit = (story: Story) => {
    setFormData({
      farmerName: story.farmerName,
      location: story.location,
      achievement: story.achievement,
      achievementHi: story.achievementHi,
      achievementBn: story.achievementBn,
      imageUrl: story.imageUrl || "",
      yieldIncrease: story.yieldIncrease?.toString() || "",
      cropType: story.cropType || ""
    });
    setEditingId(story.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this story?")) {
      saveStories(stories.filter(s => s.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      farmerName: "",
      location: "",
      achievement: "",
      achievementHi: "",
      achievementBn: "",
      imageUrl: "",
      yieldIncrease: "",
      cropType: ""
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Success Stories ({stories.length})</h3>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Story
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Farmer Name</Label>
                <Input
                  required
                  value={formData.farmerName}
                  onChange={(e) => setFormData({...formData, farmerName: e.target.value})}
                  placeholder="Ramesh Kumar"
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Punjab, India"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Achievement (English)</Label>
                <Textarea
                  required
                  value={formData.achievement}
                  onChange={(e) => setFormData({...formData, achievement: e.target.value})}
                  placeholder="Increased yield by using modern techniques..."
                />
              </div>
              <div>
                <Label>Achievement (Hindi)</Label>
                <Textarea
                  value={formData.achievementHi}
                  onChange={(e) => setFormData({...formData, achievementHi: e.target.value})}
                  placeholder="आधुनिक तकनीकों का उपयोग करके उपज में वृद्धि..."
                />
              </div>
              <div>
                <Label>Achievement (Bengali)</Label>
                <Textarea
                  value={formData.achievementBn}
                  onChange={(e) => setFormData({...formData, achievementBn: e.target.value})}
                  placeholder="আধুনিক কৌশল ব্যবহার করে ফলন বৃদ্ধি..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Image URL (optional)</Label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="https://example.com/farmer.jpg"
                />
              </div>
              <div>
                <Label>Yield Increase % (optional)</Label>
                <Input
                  type="number"
                  value={formData.yieldIncrease}
                  onChange={(e) => setFormData({...formData, yieldIncrease: e.target.value})}
                  placeholder="25"
                />
              </div>
              <div>
                <Label>Crop Type (optional)</Label>
                <Input
                  value={formData.cropType}
                  onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                  placeholder="Rice, Wheat, etc."
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">{editingId ? "Update" : "Add"} Story</Button>
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
        {stories.map((story) => (
          <Card key={story.id} className="overflow-hidden">
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
                  <h4 className="font-semibold">{story.farmerName}</h4>
                  <p className="text-xs text-muted-foreground">📍 {story.location}</p>
                </div>
                {story.yieldIncrease && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    +{story.yieldIncrease}%
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                {story.achievement}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(story)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(story.id)}>
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
