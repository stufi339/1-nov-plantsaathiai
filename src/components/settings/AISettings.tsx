import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Sparkles, Eye, EyeOff, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { geminiAIService } from '@/lib/geminiAIService';
import { useToast } from '@/hooks/use-toast';

export const AISettings = () => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved API key
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
    // Note: A default shared API key is already configured in the app
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid API key',
        variant: 'destructive',
      });
      return;
    }

    // Save to localStorage
    localStorage.setItem('gemini_api_key', apiKey.trim());
    
    // Update service
    geminiAIService.setApiKey(apiKey.trim());

    toast({
      title: 'API Key Saved',
      description: 'Your Gemini API key has been saved successfully.',
    });

    setTestResult(null);
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an API key first',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Update service with current key
      geminiAIService.setApiKey(apiKey.trim());
      
      // Test with a simple message
      await geminiAIService.sendMessage('Hello, test connection');
      
      setTestResult('success');
      toast({
        title: 'Connection Successful',
        description: 'Your API key is working correctly!',
      });
    } catch (error: any) {
      setTestResult('error');
      toast({
        title: 'Connection Failed',
        description: error.message || 'Invalid API key or connection error',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    setApiKey('');
    localStorage.removeItem('gemini_api_key');
    setTestResult(null);
    toast({
      title: 'API Key Cleared',
      description: 'Your API key has been removed.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle>AI Assistant Settings</CardTitle>
        </div>
        <CardDescription>
          Configure your Gemini API key for the intelligent farming assistant
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Key Input */}
        <div className="space-y-2">
          <Label htmlFor="api-key">Gemini API Key</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Your API key is stored locally and never shared
          </p>
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              testResult === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {testResult === 'success' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">API key is valid and working!</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">API key test failed. Please check your key.</span>
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Save API Key
          </Button>
          <Button onClick={handleTest} variant="outline" disabled={isTesting}>
            {isTesting ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button onClick={handleClear} variant="ghost">
            Clear
          </Button>
        </div>

        {/* Default Key Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
          <p className="text-sm font-medium text-green-900">✅ AI Assistant Ready!</p>
          <p className="text-xs text-green-700">
            A shared API key is already configured. The AI assistant works out of the box!
          </p>
          <p className="text-xs text-green-600">
            You can optionally add your own API key below for higher quota.
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-semibold text-sm">Optional: Use your own API key</h4>
          <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
            <li>Visit Google AI Studio</li>
            <li>Sign in with your Google account</li>
            <li>Click "Create API Key"</li>
            <li>Copy and paste the key above</li>
          </ol>
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Get Your Own API Key from Google AI Studio
          </Button>
        </div>

        {/* Features Info */}
        <div className="space-y-2 pt-4 border-t">
          <h4 className="font-semibold text-sm">AI Assistant Features:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>✅ Knows all your field details and health status</li>
            <li>✅ Aware of current weather and forecast</li>
            <li>✅ Provides personalized farming advice</li>
            <li>✅ Multi-language support (Hindi, English, Bengali)</li>
            <li>✅ Voice input in your language</li>
            <li>✅ Context-aware conversations</li>
          </ul>
        </div>

        {/* Pricing Info */}
        <div className="bg-muted p-3 rounded-lg space-y-1">
          <p className="text-sm font-medium">💰 About API Usage</p>
          <p className="text-xs text-muted-foreground">
            <strong>Shared Key:</strong> Works for all users, shared quota
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Your Own Key:</strong> Personal quota (60 req/min, 1,500 req/day) - FREE!
          </p>
          <p className="text-xs text-muted-foreground">
            Both options are completely free and sufficient for farming needs.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
