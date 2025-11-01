import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Play,
  BookOpen,
  Lightbulb,
  HelpCircle
} from "lucide-react";

interface EducationalResourcesProps {
  faqs: Array<{ question: string; answer: string }>;
  tips: string[];
  recommendedVideos: string[];
  playingAudio: string | null;
  onAudioPlay: (text: string, id: string) => void;
}

export const EducationalResources: React.FC<EducationalResourcesProps> = ({
  faqs,
  tips,
  recommendedVideos,
  playingAudio,
  onAudioPlay
}) => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [showAllTips, setShowAllTips] = useState(false);

  const handleVideoSearch = (query: string) => {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(searchUrl, '_blank');
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {/* FAQ Section */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAudioPlay(
                `Here are frequently asked questions about this disease to help you understand it better.`,
                "faq-intro"
              )}
              className="p-1 h-6 w-6"
            >
              {playingAudio === "faq-intro" ? (
                <VolumeX className="h-3 w-3" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {faqs && faqs.length > 0 ? (
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="border rounded-lg">
                  <Button
                    variant="ghost"
                    onClick={() => toggleFAQ(index)}
                    className="w-full justify-between p-4 h-auto text-left"
                  >
                    <span className="font-medium text-sm">{faq.question}</span>
                    {expandedFAQ === index ? (
                      <ChevronUp className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    )}
                  </Button>
                  
                  {expandedFAQ === index && (
                    <div className="px-4 pb-4">
                      <div className="flex items-start gap-2">
                        <p className="text-sm text-muted-foreground flex-1">{faq.answer}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAudioPlay(
                            `Question: ${faq.question}. Answer: ${faq.answer}`,
                            `faq-${index}`
                          )}
                          className="p-1 h-6 w-6 flex-shrink-0"
                        >
                          {playingAudio === `faq-${index}` ? (
                            <VolumeX className="h-3 w-3" />
                          ) : (
                            <Volume2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <HelpCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No specific FAQs available for this disease.</p>
              <p className="text-sm mt-1">Consider consulting agricultural extension services for more information.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prevention Tips Section */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Prevention Tips
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAudioPlay(
                `Here are prevention tips to help avoid this disease in the future: ${tips.slice(0, 3).join('. ')}`,
                "tips-intro"
              )}
              className="p-1 h-6 w-6"
            >
              {playingAudio === "tips-intro" ? (
                <VolumeX className="h-3 w-3" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {tips && tips.length > 0 ? (
            <div className="space-y-3">
              {tips.slice(0, showAllTips ? undefined : 4).map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mt-0.5 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 flex items-start justify-between">
                    <span className="text-sm text-green-800">{tip}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAudioPlay(tip, `tip-${index}`)}
                      className="p-1 h-6 w-6 flex-shrink-0 ml-2"
                    >
                      {playingAudio === `tip-${index}` ? (
                        <VolumeX className="h-3 w-3" />
                      ) : (
                        <Volume2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
              
              {tips.length > 4 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllTips(!showAllTips)}
                  className="w-full"
                >
                  {showAllTips ? (
                    <>Show Less <ChevronUp className="h-4 w-4 ml-1" /></>
                  ) : (
                    <>Show {tips.length - 4} More Tips <ChevronDown className="h-4 w-4 ml-1" /></>
                  )}
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No specific prevention tips available.</p>
              <p className="text-sm mt-1">Follow general good agricultural practices for disease prevention.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Tutorials Section */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Video Tutorials
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAudioPlay(
                `Video tutorials are available to help you learn more about this disease and its management.`,
                "videos-intro"
              )}
              className="p-1 h-6 w-6"
            >
              {playingAudio === "videos-intro" ? (
                <VolumeX className="h-3 w-3" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {recommendedVideos && recommendedVideos.length > 0 ? (
            <div className="space-y-3">
              {recommendedVideos.map((video, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-500 text-white rounded p-2">
                      <Play className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{video}</p>
                      <p className="text-xs text-muted-foreground">YouTube Tutorial</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVideoSearch(video)}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Watch
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No specific video tutorials available.</p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => handleVideoSearch("plant disease management agricultural tutorial")}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Search General Tutorials
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Additional Resources
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-sm text-blue-800 mb-1">📞 Expert Consultation</h4>
              <p className="text-xs text-blue-700">
                For complex cases, consider consulting with local agricultural extension officers or plant pathologists.
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-sm text-purple-800 mb-1">🔬 Laboratory Testing</h4>
              <p className="text-xs text-purple-700">
                If symptoms persist or worsen, consider sending samples to agricultural laboratories for detailed analysis.
              </p>
            </div>
            
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-medium text-sm text-orange-800 mb-1">📱 Follow-up Monitoring</h4>
              <p className="text-xs text-orange-700">
                Continue monitoring your crops and use Plant Saathi AI for regular health assessments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};