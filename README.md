# weather_forecast_app

  > A dynamic weather forecasting web application built with HTML, CSS, JavaScript, Node.js, and Express, powered by real-time weather APIs.

## Features

  - Search weather by city name
  - Detect location and show local weather
  - Display current temperature, condition, wind, humidity, etc.
  - Show date, time, and sunrise/sunset
  - Switch background according to day/night
  - Save and manage favorite cities
  - Display location on an interactive map (Google Maps integration)
  - Responsive design across devices

## Tech Stack

  - **Frontend**  : HTML, CSS, JavaScript
  - **Backend**   : Node.js, Express
  - **API**       : OpenWeatherMap, Google Maps JS API
  - **Deployment**: Vercel

## Installation

1. **Clone the repository**

        bash
                git clone https://github.com/your-username/weather_forecast_app.git
                cd weather_forecast_app
2. **Install dependencies**

        bash
                npm install
3. **Configure API keys**

-Create a .env file in the root and add:

        ini
              WEATHER_API_KEY=your_openweather_api_key
              GOOGLE_MAPS_API_KEY=your_google_maps_api_key
4. **Start the server**

        bash
              node index.js
   Then go to http://localhost:8000 in your browser.
