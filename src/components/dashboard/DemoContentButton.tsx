import { useState } from "react";
import { Sparkles, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { seedDemoContent } from "@/lib/demoContentSeeder";
import { seedDemoFields } from "@/lib/demoFieldSeeder";

export const DemoContentButton = () => {
  const [seeded, setSeeded] = useState(false);
  const [fieldsSeeded, setFieldsSeeded] = useState(false);

  const handleSeedContent = () => {
    const result = seedDemoContent();
    setSeeded(true);

    // Show success message
    alert(`✅ Demo content added!\n\n📹 Videos: ${result.videos}\n🏆 Stories: ${result.stories}\n🖼️ Gallery: ${result.gallery}\n\nRefresh the page to see the content!`);

    // Refresh after 2 seconds
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleSeedFields = () => {
    const result = seedDemoFields();
    setFieldsSeeded(true);

    // Show success message
    alert(`✅ Demo fields added!\n\n🌾 Fields: ${result.fields}\n📍 Field 1: ${result.field1.health.status} (NDVI: ${result.field1.satelliteData.ndvi})\n📍 Field 2: ${result.field2.health.status} (NDVI: ${result.field2.satelliteData.ndvi})\n\nRefresh the page to see the field information!`);

    // Refresh after 2 seconds
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  // Only show in development
  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2">
      <Button
        onClick={handleSeedFields}
        disabled={fieldsSeeded}
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
      >
        <Sprout className="h-4 w-4 mr-2" />
        {fieldsSeeded ? "Fields Added!" : "Add Demo Fields"}
      </Button>
      <Button
        onClick={handleSeedContent}
        disabled={seeded}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {seeded ? "Content Added!" : "Add Demo Content"}
      </Button>
    </div>
  );
};
