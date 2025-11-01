import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Image as ImageIcon, Heart, MessageCircle, Share2, X } from "lucide-react";
import { Card } from "@/components/ui/card";

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

export const CommunityGallery = () => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<GalleryPost | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPosts();
    loadLikedPosts();
  }, []);

  const loadPosts = () => {
    try {
      const stored = localStorage.getItem('community_gallery');
      if (stored) {
        const parsed = JSON.parse(stored);
        const sorted = parsed.sort((a: GalleryPost, b: GalleryPost) => 
          new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );
        setPosts(sorted.slice(0, 9)); // Show top 9 in 3x3 grid
      }
    } catch (error) {
      console.error("Failed to load gallery:", error);
    }
  };

  const loadLikedPosts = () => {
    try {
      const stored = localStorage.getItem('liked_posts');
      if (stored) {
        setLikedPosts(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error("Failed to load liked posts:", error);
    }
  };

  const toggleLike = (postId: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
    localStorage.setItem('liked_posts', JSON.stringify([...newLiked]));
  };

  const getLocalizedCaption = (post: GalleryPost) => {
    if (i18n.language === 'hi') return post.captionHi || post.caption;
    if (i18n.language === 'bn') return post.captionBn || post.caption;
    return post.caption;
  };

  if (posts.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-pink-600" />
          <h2 className="text-xl font-bold">{t("communityGallery") || "किसान समुदाय"}</h2>
        </div>
        <span className="text-sm text-muted-foreground">{posts.length} posts</span>
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div 
            className="w-full max-w-5xl bg-background rounded-lg overflow-hidden flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="md:w-2/3 bg-black flex items-center justify-center">
              <img
                src={selectedPost.imageUrl}
                alt={getLocalizedCaption(selectedPost)}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            
            {/* Details */}
            <div className="md:w-1/3 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Post Details</h3>
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="p-1 hover:bg-muted rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <p className="text-sm mb-4">{getLocalizedCaption(selectedPost)}</p>
              
              {selectedPost.location && (
                <p className="text-xs text-muted-foreground mb-4">
                  📍 {selectedPost.location}
                </p>
              )}
              
              <div className="flex items-center gap-4 pt-4 border-t">
                <button 
                  onClick={() => toggleLike(selectedPost.id)}
                  className="flex items-center gap-1 hover:text-red-600 transition-colors"
                >
                  <Heart 
                    className={`h-5 w-5 ${likedPosts.has(selectedPost.id) ? 'fill-red-600 text-red-600' : ''}`}
                  />
                  <span className="text-sm">{selectedPost.likes + (likedPosts.has(selectedPost.id) ? 1 : 0)}</span>
                </button>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm">{selectedPost.comments}</span>
                </div>
                <button className="ml-auto">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mt-4 text-xs text-muted-foreground">
                {new Date(selectedPost.addedAt).toLocaleDateString(i18n.language)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instagram-style Grid */}
      <div className="grid grid-cols-3 gap-1 md:gap-2">
        {posts.map((post) => (
          <div
            key={post.id}
            className="aspect-square cursor-pointer relative group overflow-hidden rounded-sm"
            onClick={() => setSelectedPost(post)}
          >
            <img
              src={post.imageUrl}
              alt={getLocalizedCaption(post)}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
              <div className="flex items-center gap-1">
                <Heart className="h-5 w-5" fill="white" />
                <span className="font-semibold">{post.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-5 w-5" fill="white" />
                <span className="font-semibold">{post.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
