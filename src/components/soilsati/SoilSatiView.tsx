import { MyFieldsList } from "./MyFieldsList";
import { LanguageSelector } from "../layout/LanguageSelector";
import { useTranslation } from "react-i18next";

export const SoilSatiView = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-hero pb-24">
      {/* Header */}
      <header className="px-6 pt-8 pb-6 bg-gradient-primary text-white">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>

        <h1 className="text-3xl font-bold mb-2">{t('soil_sati_title')}</h1>
        <p className="text-sm opacity-90">{t('satellite_powered_field_intelligence')}</p>
      </header>

      {/* My Fields List */}
      <div className="px-6 py-4">
        <MyFieldsList />
      </div>
    </div>
  );
};
