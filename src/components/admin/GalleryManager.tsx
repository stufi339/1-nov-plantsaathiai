import { useState, useEffect } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface GalleryPost {
  id: string;
  imageUrl: string;
  caption: string;
  captionHi: string;
  captionBn: string;
  category: string;
  likes: number;
  comments: number;
  addedAt: string;
  location?: string;
}

export const GalleryManager = () => {
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    imageUrl: "",
    caption: "",
    captionHi: "",
    captionBn: "",
    category: "farming",
    location: ""
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    try {
      const stored = localStorage.getItem('community_gallery');
      if (stored) {
        setPosts(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load gallery:", error);
    }
  };

  const savePosts = (updatedPosts: GalleryPost[]) => {
    localStorage.setItem('community_gallery', JSON.stringify(updatedPosts));
    setPosts(updatedPosts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      const updated = posts.map(p => 
        p.id === editingId 
          ? { ...p, ...formData }
          : p
      );
      savePosts(updated);
      setEditingId(null);
    } else {
      const newPost: GalleryPost = {
        id: Date.now().toString(),
        ...formData,
        likes: 0,
        comments: 0,
        addedAt: new Date().toISOString()
      };
      savePosts([...posts, newPost]);
    }
    
    resetForm();
    setIsAdding(false);
  };

  const handleEdit = (post: GalleryPost) => {
    setFormData({
      imageUrl: post.imageUrl,
      caption: post.caption,
      captionHi: post.captionHi,
      captionBn: post.captionBn,
      category: post.category,
      location: post.location || ""
    });
    setEditingId(post.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      savePosts(posts.filter(p => p.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      imageUrl: "",
      caption: "",
      captionHi: "",
      captionBn: "",
      category: "farming",
      location: ""
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Community Gallery ({posts.length})</h3>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Post
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Image URL</Label>
              <Input
                required
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Caption (English)</Label>
                <Textarea
                  required
                  value={formData.caption}
                  onChange={(e) => setFormData({...formData, caption: e.target.value})}
                  placeholder="Beautiful harvest season..."
                />
              </div>
              <div>
                <Label>Caption (Hindi)</Label>
                <Textarea
                  value={formData.captionHi}
                  onChange={(e) => setFormData({...formData, captionHi: e.target.value})}
                  placeholder="सुंदर फसल का मौसम..."
                />
              </div>
              <div>
                <Label>Caption (Bengali)</Label>
                <Textarea
                  value={formData.captionBn}
                  onChange={(e) => setFormData({...formData, captionBn: e.target.value})}
                  placeholder="সুন্দর ফসল কাটার মৌসুম..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="farming, harvest, etc."
                />
              </div>
              <div>
                <Label>Location (optional)</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Punjab, India"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">{editingId ? "Update" : "Add"} Post</Button>
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <div className="aspect-square bg-muted">
              <img
                src={post.imageUrl}
                alt={post.caption}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <p className="text-sm line-clamp-2 mb-2">{post.caption}</p>
              <div className="text-xs text-muted-foreground mb-2">
                ❤️ {post.likes} 💬 {post.comments}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(post)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(post.id)}>
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
