/**
 * WeatherService - OpenWeather API integration for agricultural weather forecasting
 */

const OPENWEATHER_API_KEY = '623822e31715b644264f0f606c4a9952';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface CurrentWeather {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  description: string;
  icon: string;
  wind_speed: number;
  wind_deg: number;
  clouds: number;
  visibility: number;
  dt: number;
}

export interface ForecastDay {
  date: string;
  day: string;
  temp_max: number;
  temp_min: number;
  description: string;
  icon: string;
  precipitation: number;
  humidity: number;
  wind_speed: number;
}

export interface WeatherData {
  location: string;
  country: string;
  current: CurrentWeather;
  forecast: ForecastDay[];
  farmingAdvice: string[];
}

export class WeatherService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = OPENWEATHER_API_KEY;
    this.baseUrl = OPENWEATHER_BASE_URL;
  }

  /**
   * Get current weather and forecast by city name
   */
  async getWeatherByCity(city: string): Promise<WeatherData> {
    try {
      // Get current weather
      const currentResponse = await fetch(
        `${this.baseUrl}/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`
      );

      if (!currentResponse.ok) {
        throw new Error(`Weather API error: ${currentResponse.status}`);
      }

      const currentData = await currentResponse.json();

      // Get 5-day forecast
      const forecastResponse = await fetch(
        `${this.baseUrl}/forecast?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`
      );

      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
      }

      const forecastData = await forecastResponse.json();

      return this.formatWeatherData(currentData, forecastData);
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      throw error;
    }
  }

  /**
   * Get weather by coordinates
   */
  async getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    try {
      // Get current weather
      const currentResponse = await fetch(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      );

      if (!currentResponse.ok) {
        throw new Error(`Weather API error: ${currentResponse.status}`);
      }

      const currentData = await currentResponse.json();

      // Get 5-day forecast
      const forecastResponse = await fetch(
        `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      );

      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
      }

      const forecastData = await forecastResponse.json();

      return this.formatWeatherData(currentData, forecastData);
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      throw error;
    }
  }

  /**
   * Format API response to our data structure
   */
  private formatWeatherData(currentData: any, forecastData: any): WeatherData {
    const current: CurrentWeather = {
      temp: Math.round(currentData.main.temp),
      feels_like: Math.round(currentData.main.feels_like),
      temp_min: Math.round(currentData.main.temp_min),
      temp_max: Math.round(currentData.main.temp_max),
      humidity: currentData.main.humidity,
      pressure: currentData.main.pressure,
      description: currentData.weather[0].description,
      icon: currentData.weather[0].icon,
      wind_speed: currentData.wind.speed,
      wind_deg: currentData.wind.deg,
      clouds: currentData.clouds.all,
      visibility: currentData.visibility,
      dt: currentData.dt,
    };

    // Process 5-day forecast (group by day)
    const forecastByDay = this.groupForecastByDay(forecastData.list);

    const forecast: ForecastDay[] = forecastByDay.slice(0, 5);

    // Generate farming advice based on weather
    const farmingAdvice = this.generateFarmingAdvice(current, forecast);

    return {
      location: currentData.name,
      country: currentData.sys.country,
      current,
      forecast,
      farmingAdvice,
    };
  }

  /**
   * Group forecast data by day
   */
  private groupForecastByDay(forecastList: any[]): ForecastDay[] {
    const days: { [key: string]: any[] } = {};

    forecastList.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];

      if (!days[dateKey]) {
        days[dateKey] = [];
      }
      days[dateKey].push(item);
    });

    return Object.entries(days).map(([dateKey, items]) => {
      const temps = items.map((i) => i.main.temp);
      const date = new Date(dateKey);
      const dayName = this.getDayName(date);

      // Calculate precipitation probability
      const precipProb = Math.max(...items.map((i) => (i.pop || 0) * 100));

      // Get most common weather condition
      const weatherCounts: { [key: string]: number } = {};
      items.forEach((i) => {
        const desc = i.weather[0].main;
        weatherCounts[desc] = (weatherCounts[desc] || 0) + 1;
      });
      const mostCommon = Object.entries(weatherCounts).sort((a, b) => b[1] - a[1])[0][0];
      const icon = items.find((i) => i.weather[0].main === mostCommon)?.weather[0].icon || items[0].weather[0].icon;

      return {
        date: dateKey,
        day: dayName,
        temp_max: Math.round(Math.max(...temps)),
        temp_min: Math.round(Math.min(...temps)),
        description: mostCommon,
        icon,
        precipitation: Math.round(precipProb),
        humidity: Math.round(items.reduce((sum, i) => sum + i.main.humidity, 0) / items.length),
        wind_speed: Math.round(items.reduce((sum, i) => sum + i.wind.speed, 0) / items.length),
      };
    });
  }

  /**
   * Get day name from date
   */
  private getDayName(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
  }

  /**
   * Generate actionable farming advice based on weather conditions
   */
  private generateFarmingAdvice(current: CurrentWeather, forecast: ForecastDay[]): string[] {
    const advice: string[] = [];

    // Critical temperature alerts with specific actions
    if (current.temp > 38) {
      advice.push('🔥 HEAT ALERT: Temperature above 38°C! Irrigate NOW if soil is dry. Apply light irrigation in evening (6-7 PM) to cool plants. Cover young seedlings with shade net.');
    } else if (current.temp > 35) {
      advice.push('☀️ Hot weather: Irrigate early morning (5-6 AM) or evening (6-7 PM). Avoid midday irrigation - 50% water will evaporate. Apply mulch to reduce soil temperature.');
    } else if (current.temp < 10) {
      advice.push('❄️ COLD ALERT: Frost risk! Cover crops with plastic sheets or straw before sunset. Smoke in field early morning to prevent frost damage. Delay irrigation until temperature rises.');
    } else if (current.temp < 15) {
      advice.push('🌡️ Cool weather: Good for wheat, mustard, peas. Reduce irrigation frequency. Apply light nitrogen dose for better growth. Watch for aphids in mustard.');
    }

    // Humidity-based disease prevention
    if (current.humidity > 85) {
      advice.push('💧 Very high humidity (>85%): HIGH RISK of fungal diseases! Spray Mancozeb (2g/L) or Copper Oxychloride (3g/L) preventively. Ensure good air circulation. Remove infected leaves immediately.');
    } else if (current.humidity > 75) {
      advice.push('🌫️ High humidity: Watch for leaf spot, blight, and powdery mildew. Spray Carbendazim (1g/L) if you see white patches. Avoid overhead irrigation. Space plants properly.');
    } else if (current.humidity < 30) {
      advice.push('🏜️ Very low humidity: Plants losing water fast! Increase irrigation by 20%. Spray water on leaves in evening. Apply Kaolin clay spray to reduce water loss.');
    } else if (current.humidity < 40) {
      advice.push('☀️ Low humidity: Check soil moisture daily. Irrigate when top 2 inches are dry. Mulch with straw or dry grass to retain moisture. Avoid fertilizer application.');
    }

    // Rainfall-based actionable advice
    const heavyRain = forecast.slice(0, 3).some((day) => day.precipitation > 70);
    const moderateRain = forecast.slice(0, 3).some((day) => day.precipitation > 40);
    const upcomingRain = forecast.slice(0, 2).some((day) => day.precipitation > 30);
    
    if (heavyRain) {
      advice.push('🌧️ HEAVY RAIN ALERT (>70%): Clear drainage channels NOW! Harvest ripe vegetables today. Don\'t irrigate for next 3 days. Apply fungicide after rain stops. Check for waterlogging.');
    } else if (moderateRain) {
      advice.push('🌦️ Rain expected (40-70%): Postpone pesticide/fertilizer application. Harvest ready crops. Skip irrigation. Prepare drainage. Apply Bordeaux mixture after rain to prevent fungal attack.');
    } else if (upcomingRain) {
      advice.push('☁️ Light rain possible: Hold fertilizer application. If you must spray, do it early morning. Rain will wash away chemicals. Wait 24 hours after rain for any spray.');
    } else if (forecast.every((day) => day.precipitation < 10)) {
      advice.push('☀️ No rain for 5+ days: Plan irrigation schedule. Apply fertilizer with irrigation. Good time for pesticide application. Mulch to conserve moisture. Check drip system for blockages.');
    }

    // Wind-based practical advice
    if (current.wind_speed > 25) {
      advice.push('💨 STRONG WIND (>25 km/h): Don\'t spray pesticides - waste of money! Stake tall plants (tomato, brinjal). Cover nursery beds. Check for lodging in wheat/paddy. Postpone drone spraying.');
    } else if (current.wind_speed > 15) {
      advice.push('🌬️ Windy conditions: Reduce spray pressure. Use coarse nozzles. Add sticker (Triton) to spray solution. Best time to spray: early morning when wind is calm.');
    } else if (current.wind_speed < 5) {
      advice.push('🎯 Calm weather: Perfect for pesticide application! Spray between 6-10 AM or 4-6 PM. Use recommended dose. Add surfactant for better coverage. Check spray equipment.');
    }

    // Combined conditions - critical farming windows
    if (current.temp >= 25 && current.temp <= 32 && current.humidity >= 50 && current.humidity <= 70 && current.wind_speed < 10) {
      advice.push('✅ PERFECT FARMING WEATHER: Ideal for all operations! Apply fertilizers, spray pesticides, transplant seedlings, harvest crops. Make most of this window!');
    }

    // Pest and disease alerts based on weather
    if (current.temp > 30 && current.humidity < 50) {
      advice.push('🐛 Pest Alert: Hot & dry weather favors aphids, whiteflies, and mites. Check undersides of leaves. Spray Imidacloprid (0.3ml/L) or Neem oil (5ml/L) in evening.');
    }

    if (current.temp >= 20 && current.temp <= 28 && current.humidity > 70) {
      advice.push('🦠 Disease Alert: Perfect conditions for fungal diseases! Inspect crops daily. Remove infected parts. Spray Propiconazole (1ml/L) preventively. Improve drainage.');
    }

    // Irrigation timing advice
    if (current.temp > 32) {
      advice.push('⏰ Irrigation Timing: Water between 5-7 AM (best) or 6-8 PM. Never irrigate 10 AM-4 PM in hot weather. Use drip/sprinkler to save 40% water. Check soil before watering.');
    }

    // Fertilizer application advice
    const goodForFertilizer = current.temp >= 20 && current.temp <= 35 && !upcomingRain && current.wind_speed < 15;
    if (goodForFertilizer) {
      advice.push('🌱 Fertilizer Window: Good time to apply fertilizers! Apply with irrigation. Use split doses. For vegetables: 19:19:19 (5g/L). For cereals: Urea (10kg/acre). Water immediately after application.');
    }

    // Harvest timing
    if (current.humidity < 60 && !upcomingRain && current.wind_speed < 15) {
      advice.push('🌾 Harvest Window: Good conditions for harvesting! Low humidity means faster drying. Harvest grains at 20-22% moisture. Dry immediately. Store in moisture-proof bags.');
    }

    // Specific crop advice based on season and weather
    const month = new Date().getMonth(); // 0-11
    if (month >= 9 || month <= 2) { // Oct-Feb (Rabi season)
      if (current.temp >= 15 && current.temp <= 25) {
        advice.push('🌾 Rabi Season: Perfect for wheat, mustard, chickpea, peas. First irrigation at 20-25 days. Apply Urea (50kg/acre) at tillering stage. Watch for aphids in mustard.');
      }
    } else if (month >= 5 && month <= 8) { // Jun-Sep (Kharif season)
      if (current.temp >= 25 && current.temp <= 35) {
        advice.push('🌾 Kharif Season: Good for rice, cotton, maize, soybean. Maintain 2-3 inch water in paddy. Apply Potash at flowering. Watch for stem borer in rice, bollworm in cotton.');
      }
    }

    // Water conservation tips
    if (forecast.every((day) => day.precipitation < 20) && current.temp > 30) {
      advice.push('💧 Water Conservation: Use drip irrigation (saves 50% water). Mulch with crop residue. Do basin irrigation for trees. Irrigate alternate furrows. Check for leaks in pipes.');
    }

    return advice;
  }

  /**
   * Get user's current location
   */
  async getCurrentLocation(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
}

// Create singleton instance
export const weatherService = new WeatherService();
