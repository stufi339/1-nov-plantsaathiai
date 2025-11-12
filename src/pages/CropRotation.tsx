import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CropRotationView } from '@/components/rotation/CropRotationView';
import { useTranslation } from 'react-i18next';

export default function CropRotation() {
  const navigate = useNavigate();
  const { fieldId } = useParams();
  const { t } = useTranslation();
  const [fieldData, setFieldData] = useState<any>(null);

  useEffect(() => {
    if (fieldId) {
      try {
        const storedField = localStorage.getItem(`field_${fieldId}_data`);
        if (storedField) {
          setFieldData(JSON.parse(storedField));
        } else {
          navigate('/soilsati');
        }
      } catch (error) {
        console.error('Error loading field:', error);
        navigate('/soilsati');
      }
    }
  }, [fieldId, navigate]);

  if (!fieldData) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading_field_data')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero pb-24">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 bg-gradient-primary text-white">
        <Button
          onClick={() => navigate(`/field/${fieldId}`)}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Field Details
        </Button>
        <div>
          <h1 className="text-2xl font-bold mb-1">Crop Rotation Planner</h1>
          <p className="text-sm opacity-90">{fieldData.name} - {fieldData.cropType}</p>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 py-6">
        <CropRotationView fieldId={fieldId || ''} fieldName={fieldData.name} />
      </div>
    </div>
  );
}
