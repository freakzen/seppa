<<<<<<< HEAD
# NASA TEMPO Air Quality Forecast App

*Real-time air quality monitoring powered by NASA TEMPO satellite data*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/freakzens-projects/v0-air-quality-forecast-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/W2kRR8pCmJj)

## Overview

A comprehensive air quality monitoring and forecasting application that integrates multiple data sources:

- **NASA TEMPO Satellite Data** - Tropospheric pollution measurements
- **EPA AirNow API** - Real-time ground sensor data across North America
- **OpenWeatherMap API** - Weather data for enhanced forecasting
- **Machine Learning Forecasting** - AI-powered air quality predictions

## Features

- 🛰️ Real-time NASA TEMPO satellite integration
- 📊 Interactive air quality dashboard with live maps
- 🔮 AI-powered forecasting (6h, 24h, 48h predictions)
- 🚨 Health alerts and personalized recommendations
- 📱 Push notifications and email alerts
- 📈 Historical trends and pollutant analysis
- 🌤️ Weather impact analysis on air quality

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`env
# EPA AirNow API (Required for real ground sensor data)
EPA_AIRNOW_API_KEY=your_epa_airnow_api_key_here
EPA_AIRNOW_BASE_URL=https://www.airnowapi.org

# OpenWeather API (Required for weather data)
OPENWEATHER_API_KEY=your_openweather_api_key_here

# NASA TEMPO API (Optional - uses simulated data if not available)
TEMPO_API_KEY=your_tempo_api_key_here
TEMPO_BASE_URL=https://api.nasa.gov/tempo

# Base URL for internal API calls
NEXT_PUBLIC_BASE_URL=http://localhost:3000
\`\`\`

### 2. Getting API Keys

#### EPA AirNow API (Free)
1. Visit [AirNow API Documentation](https://docs.airnowapi.org/)
2. Sign up for a free account
3. Get your API key from the dashboard

#### OpenWeatherMap API (Free tier available)
1. Visit [OpenWeatherMap API](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier includes 1,000 calls/day

#### NASA TEMPO API (Optional)
1. Visit [NASA API Portal](https://api.nasa.gov/)
2. Sign up for a free NASA API key
3. Note: TEMPO-specific endpoints may require additional access

### 3. Installation

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
\`\`\`

### 4. Deployment

The app is configured for easy deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel Project Settings
3. Deploy automatically on push to main branch

## Data Sources & Fallbacks

The application uses a robust fallback system:

1. **Primary**: EPA AirNow + NASA TEMPO + OpenWeather (real data)
2. **Fallback 1**: EPA AirNow + OpenWeather (if TEMPO unavailable)
3. **Fallback 2**: OpenWeather Air Pollution API only
4. **Fallback 3**: Simulated data (for development/demo)

## API Endpoints

- `/api/air-quality` - Current air quality data
- `/api/tempo` - NASA TEMPO satellite data
- `/api/forecast` - AI-powered forecasting
- `/api/health-alerts` - Health recommendations
- `/api/notifications/*` - Notification services

## Development

Continue building your app on:

**[https://v0.app/chat/projects/W2kRR8pCmJj](https://v0.app/chat/projects/W2kRR8pCmJj)**

## Deployment

Your project is live at:

**[https://vercel.com/freakzens-projects/v0-air-quality-forecast-app](https://vercel.com/freakzens-projects/v0-air-quality-forecast-app)**

## Contributing

This project uses NASA's TEMPO mission data to help improve public health decisions through better air quality monitoring and forecasting.
=======
# seppa
A github repo-for a web application which is inspired by nasa's tempo data to give users a friendly understanding about the aqi and weather info around them.
>>>>>>> 13f65c12c4f6aa3cbacbae09d750b3c55e7f077c
