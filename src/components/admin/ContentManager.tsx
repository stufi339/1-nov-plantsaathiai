import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoManager } from "./VideoManager";
import { GalleryManager } from "./GalleryManager";
import { StoriesManager } from "./StoriesManager";

export const ContentManager = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Content Management</h2>
        <p className="text-muted-foreground">Manage educational videos, gallery posts, and success stories</p>
      </div>

      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="videos">📹 Videos</TabsTrigger>
          <TabsTrigger value="gallery">🖼️ Gallery</TabsTrigger>
          <TabsTrigger value="stories">🏆 Stories</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-4">
          <VideoManager />
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <GalleryManager />
        </TabsContent>

        <TabsContent value="stories" className="space-y-4">
          <StoriesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
