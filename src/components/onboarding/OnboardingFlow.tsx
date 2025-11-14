import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf, Globe, MapPin, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabaseFieldService } from '@/lib/supabaseFieldService';
import { supabaseAuthService } from '@/lib/supabaseAuthService';
import { useToast } from '@/hooks/use-toast';

const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
];

const CROP_TYPES = [
    'Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Pulses', 
    'Vegetables', 'Fruits', 'Other'
];

export default function OnboardingFlow() {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 2: Language selection
    const [selectedLanguage, setSelectedLanguage] = useState('en');

    // Step 3: Field details
    const [fieldName, setFieldName] = useState('');
    const [location, setLocation] = useState('');
    const [cropType, setCropType] = useState('');
    const [area, setArea] = useState('');

    const handleLanguageSelect = async () => {
        // Change language using i18next
        await i18n.changeLanguage(selectedLanguage);
        
        // Save language preference to profile
        await supabaseAuthService.updateProfile({ language: selectedLanguage });
        
        toast({
            title: 'Language Updated',
            description: 'Your language preference has been saved.',
        });
        
        setStep(3);
    };

    const handleFieldSetup = async () => {
        setLoading(true);
        
        try {
            await supabaseFieldService.createField({
                name: fieldName,
                location: location,
                crop_type: cropType,
                area: parseFloat(area),
                coordinates: null
            });

            toast({
                title: 'Field Created!',
                description: 'Your field has been registered successfully.',
            });

            // Mark onboarding as complete in Supabase
            const { supabase } = await import('@/lib/supabase');
            await supabase.auth.updateUser({
                data: { onboarding_complete: true }
            });
            
            // Force navigation and reload to ensure state updates
            navigate('/dashboard', { replace: true });
            window.location.reload();
        } catch (error) {
            console.error('Error creating field:', error);
            toast({
                title: 'Error',
                description: 'Failed to create field. You can add it later.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = async () => {
        // Mark onboarding as complete in Supabase
        const { supabase } = await import('@/lib/supabase');
        await supabase.auth.updateUser({
            data: { onboarding_complete: true }
        });
        
        toast({
            title: 'Skipped',
            description: 'You can add fields later from the dashboard.',
        });
        
        // Force navigation and reload to ensure state updates
        navigate('/dashboard', { replace: true });
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
            <Card className="w-full max-w-md">
                {/* Step 1: Welcome */}
                {step === 1 && (
                    <>
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="bg-green-100 p-4 rounded-full">
                                    <Leaf className="h-12 w-12 text-green-600" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl">Welcome to Plant Saathi AI!</CardTitle>
                            <CardDescription>
                                Your intelligent farming companion. Let's get you started in just 2 quick steps.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                    <Globe className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="font-medium">Choose Your Language</p>
                                        <p className="text-sm text-gray-600">Select your preferred language</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                    <MapPin className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium">Add Your Field (Optional)</p>
                                        <p className="text-sm text-gray-600">Register your farm field</p>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={() => setStep(2)} className="w-full" size="lg">
                                Get Started
                            </Button>
                        </CardContent>
                    </>
                )}

                {/* Step 2: Language Selection */}
                {step === 2 && (
                    <>
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <Globe className="h-8 w-8 text-blue-600" />
                                </div>
                            </div>
                            <CardTitle>Choose Your Language</CardTitle>
                            <CardDescription>
                                Select the language you're most comfortable with
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                {LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setSelectedLanguage(lang.code)}
                                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                                            selectedLanguage === lang.code
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200 hover:border-green-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{lang.flag}</span>
                                                <span className="font-medium">{lang.name}</span>
                                            </div>
                                            {selectedLanguage === lang.code && (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                                    Back
                                </Button>
                                <Button onClick={handleLanguageSelect} className="flex-1">
                                    Continue
                                </Button>
                            </div>
                        </CardContent>
                    </>
                )}

                {/* Step 3: Field Setup (Optional) */}
                {step === 3 && (
                    <>
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <MapPin className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <CardTitle>Add Your Field</CardTitle>
                            <CardDescription>
                                Register your farm field to get personalized insights (Optional - you can skip this)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="fieldName">Field Name</Label>
                                    <Input
                                        id="fieldName"
                                        placeholder="e.g., North Field"
                                        value={fieldName}
                                        onChange={(e) => setFieldName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        placeholder="e.g., Punjab, India"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cropType">Crop Type</Label>
                                    <Select value={cropType} onValueChange={setCropType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select crop type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CROP_TYPES.map((crop) => (
                                                <SelectItem key={crop} value={crop.toLowerCase()}>
                                                    {crop}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="area">Area (in acres)</Label>
                                    <Input
                                        id="area"
                                        type="number"
                                        placeholder="e.g., 5.5"
                                        value={area}
                                        onChange={(e) => setArea(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={handleSkip} 
                                    className="flex-1"
                                >
                                    Skip for Now
                                </Button>
                                <Button 
                                    onClick={handleFieldSetup} 
                                    className="flex-1"
                                    disabled={!fieldName || !location || !cropType || !area || loading}
                                >
                                    {loading ? 'Creating...' : 'Create Field'}
                                </Button>
                            </div>
                            <p className="text-xs text-center text-gray-500">
                                Don't worry, you can add more fields later from the dashboard
                            </p>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}
