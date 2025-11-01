import React from "react";
import { DiseaseResultCard } from "./DiseaseResultCard";
import { mockDiseaseResult, mockImageUrl } from "./mockDiseaseData";

export const DiseaseResultDemo: React.FC = () => {
  const handleRetake = () => {
    console.log("Retake photo clicked");
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Disease Detection Result Demo</h1>
        <DiseaseResultCard 
          result={mockDiseaseResult}
          imageUrl={mockImageUrl}
          onRetake={handleRetake}
        />
      </div>
    </div>
  );
};