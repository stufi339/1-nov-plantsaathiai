import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AISettings } from '@/components/settings/AISettings';

export const AISettingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gradient-accent border-b border-border/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">AI Assistant Settings</h1>
            <p className="text-xs text-white/80">Configure your intelligent farming assistant</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4">
        <AISettings />
      </div>
    </div>
  );
};
