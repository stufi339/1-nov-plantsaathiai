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
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            {t("today_weather") || "Today's Weather"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {weatherData.location}, {weatherData.country}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">{current.temp}°C</div>
          <p className="text-sm text-muted-foreground capitalize">{current.description}</p>
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
          <Droplets className="h-4 w-4 text-blue-600" />
          <div>
            <p className="text-xs text-muted-foreground">{t("humidity") || "Humidity"}</p>
            <p className="text-sm font-semibold">{current.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
          <Wind className="h-4 w-4 text-cyan-600" />
          <div>
            <p className="text-xs text-muted-foreground">{t("wind") || "Wind"}</p>
            <p className="text-sm font-semibold">{current.wind_speed} km/h</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
          <Cloud className="h-4 w-4 text-gray-600" />
          <div>
            <p className="text-xs text-muted-foreground">{t("clouds") || "Clouds"}</p>
            <p className="text-sm font-semibold">{current.clouds}%</p>
          </div>
        </div>
      </div>

      {/* Today's Irrigation */}
      {todayIrrigation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-green-900 flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              {t("irrigation_today") || "Irrigation Today"}
            </h3>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {todayIrrigation.confidence}% {t("confidence") || "Confidence"}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-green-700" />
              <span className="font-medium">{todayIrrigation.time}</span>
            </div>
            <div className="text-muted-foreground">
              {todayIrrigation.duration}h • {todayIrrigation.waterAmount}L/h
            </div>
          </div>
          <p className="text-xs text-green-700 mt-2">{todayIrrigation.reason}</p>
        </div>
      )}

      {/* 3-Day Forecast */}
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          {t("forecast") || "3-Day Forecast"}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {forecast.slice(0, 3).map((day: any, index: number) => (
            <div key={index} className="bg-white/60 rounded-lg p-2 text-center">
              <p className="text-xs font-medium text-gray-700">{day.day}</p>
              <img
                src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                alt={day.description}
                className="w-8 h-8 mx-auto"
              />
              <p className="text-sm font-semibold">{day.temp_max}°/{day.temp_min}°</p>
              <p className="text-xs text-blue-600">{day.precipitation}%</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
