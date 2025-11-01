import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { seedDemoContent } from "@/lib/demoContentSeeder";

export const DemoContentButton = () => {
  const [seeded, setSeeded] = useState(false);

  const handleSeed = () => {
    const result = seedDemoContent();
    setSeeded(true);
    
    // Show success message
    alert(`✅ Demo content added!\n\n📹 Videos: ${result.videos}\n🏆 Stories: ${result.stories}\n🖼️ Gallery: ${result.gallery}\n\nRefresh the page to see the content!`);
    
    // Refresh after 2 seconds
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  // Only show in development
  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50">
      <Button
        onClick={handleSeed}
        disabled={seeded}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {seeded ? "Content Added!" : "Add Demo Content"}
      </Button>
    </div>
  );
};
