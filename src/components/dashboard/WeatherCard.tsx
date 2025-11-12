import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Cloud, Droplets, Wind, Thermometer, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WeatherCardProps {
  weatherData: any;
  irrigationData: any;
}

export const WeatherCard = ({ weatherData, irrigationData }: WeatherCardProps) => {
  const { t } = useTranslation();

  if (!weatherData) {
    return null;
  }

  const { current, forecast } = weatherData;
  const todayIrrigation = irrigationData?.schedule?.find((s: any) => {
    const today = new Date().toISOString().split('T')[0];
    return s.date === today && !s.isSkipped;
  });

  return (
    <Card className="p-5 bg-transparent border-0 shadow-none">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-blue-900 mb-1">
            {t("today_weather") || "Today's Weather"}
          </h2>
          <p className="text-sm text-blue-700/80">
            {weatherData.location}, {weatherData.country}
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-blue-900">{current.temp}°C</div>
          <p className="text-sm text-blue-700/80 capitalize">{current.description}</p>
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-blue-100">
          <Droplets className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-xs text-blue-700/70">{t("humidity") || "Humidity"}</p>
            <p className="text-sm font-bold text-blue-900">{current.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-blue-100">
          <Wind className="h-5 w-5 text-cyan-600" />
          <div>
            <p className="text-xs text-blue-700/70">{t("wind") || "Wind"}</p>
            <p className="text-sm font-bold text-blue-900">{current.wind_speed} km/h</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-blue-100">
          <Cloud className="h-5 w-5 text-gray-600" />
          <div>
            <p className="text-xs text-blue-700/70">{t("clouds") || "Clouds"}</p>
            <p className="text-sm font-bold text-blue-900">{current.clouds}%</p>
          </div>
        </div>
      </div>

      {/* Today's Irrigation */}
      {todayIrrigation && (
        <div className="bg-white/70 backdrop-blur-sm border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-green-900 flex items-center gap-2">
              <Droplets className="h-5 w-5 text-green-600" />
              {t("irrigation_today") || "Irrigation Today"}
            </h3>
            <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50 font-medium">
              {todayIrrigation.confidence}% {t("confidence") || "Confidence"}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-green-700" />
              <span className="font-semibold text-green-900">{todayIrrigation.time}</span>
            </div>
            <div className="text-green-700/80">
              {todayIrrigation.duration}h • {todayIrrigation.waterAmount}L/h
            </div>
          </div>
          <p className="text-xs text-green-700 mt-2 leading-relaxed">{todayIrrigation.reason}</p>
        </div>
      )}

      {/* 3-Day Forecast */}
      <div>
        <h3 className="text-sm font-bold text-blue-900 mb-3">
          {t("forecast") || "3-Day Forecast"}
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {forecast.slice(0, 3).map((day: any, index: number) => (
            <div key={index} className="bg-white/70 backdrop-blur-sm border border-blue-100 rounded-lg p-3 text-center hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold text-blue-900 mb-1">{day.day}</p>
              <img
                src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                alt={day.description}
                className="w-10 h-10 mx-auto"
              />
              <p className="text-sm font-bold text-blue-900">{day.temp_max}°/{day.temp_min}°</p>
              <p className="text-xs text-blue-600 font-medium mt-1">💧 {day.precipitation}%</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
