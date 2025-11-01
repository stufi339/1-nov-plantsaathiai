import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

const languageOptions = [
  { value: 'en', label: 'English', flag: '🇺🇸', display: 'English' },
  { value: 'hi', label: 'हिंदी', flag: '🇮🇳', display: 'हिंदी' },
  { value: 'pa', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳', display: 'ਪੰਜਾਬੀ' },
  { value: 'ta', label: 'தமிழ்', flag: '🇮🇳', display: 'தமிழ்' },
  { value: 'te', label: 'తెలుగు', flag: '🇮🇳', display: 'తెలుగు' },
  { value: 'bn', label: 'বাংলা', flag: '🇮🇳', display: 'বাংলা' },
  { value: 'mr', label: 'मराठी', flag: '🇮🇳', display: 'मराठी' },
  { value: 'ha', label: 'हरियाणवी', flag: '🇮🇳', display: 'हरियाणवी' },
];

export const LanguageSelector = () => {
  const { i18n, t } = useTranslation();

  const currentLanguage = languageOptions.find(option => option.value === i18n.language);

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-foreground hover:bg-accent"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{t('select_language')}</span>
          <span className="text-lg">{currentLanguage?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languageOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleLanguageChange(option.value)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-base">{option.flag}</span>
            <span>{option.display}</span>
            {i18n.language === option.value && (
              <span className="ml-auto text-green-500">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
