const input = document.getElementById('location-input');
const button = document.getElementById('fetch-weather');
const result = document.getElementById('result');
const error = document.getElementById('error');
const loading = document.getElementById('loading');

function getWeatherEmoji(condition) {
    if (!condition) return '🌈';
    condition = condition.toLowerCase();
    if (condition.includes('sun') || condition.includes('clear')) return '☀️';
    if (condition.includes('cloud') || condition.includes('overcast')) return '☁️';
    if (condition.includes('rain') || condition.includes('drizzle')) return '🌧️';
    if (condition.includes('thunder') || condition.includes('storm')) return '⛈️';
    if (condition.includes('snow') || condition.includes('ice')) return '❄️';
    if (condition.includes('fog') || condition.includes('mist') || condition.includes('haze')) return '🌫️';
    return '🌈';
}

async function fetchWeather(location) {
    // Reset UI
    result.hidden = true;
    result.innerHTML = '';
    error.hidden = true;
    error.textContent = '';

    const encodedLoc = encodeURIComponent(location.trim());
    if (!encodedLoc) {
        showError('Please enter a location.');
        return;
    }

    // Show loading state
    if (loading) loading.hidden = false;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

    // Using wttr.in JSON format
    const url = `https://wttr.in/${encodedLoc}?format=j1`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Location not found or service unavailable');

        const data = await response.json();

        if (!data.current_condition || data.current_condition.length === 0) {
            throw new Error('Weather data unavailable for this location.');
        }

        renderWeather(data, location);

    } catch (e) {
        showError(e.message || 'Failed to fetch weather data. Please try again.');
    } finally {
        if (loading) loading.hidden = true;
        button.disabled = false;
        button.innerHTML = 'Get Weather';
    }
}

function renderWeather(data, originalLocation) {
    const current = data.current_condition[0];
    const nearest = data.nearest_area && data.nearest_area[0];

    const area = nearest && nearest.areaName[0].value ? nearest.areaName[0].value : originalLocation;
    const region = nearest && nearest.region[0].value ? nearest.region[0].value : '';
    const country = nearest && nearest.country[0].value ? nearest.country[0].value : '';

    const weatherDesc = current.weatherDesc[0].value;
    const emoji = getWeatherEmoji(weatherDesc);

    let html = `
        <div class="weather-card animate-fade-in">
            <div class="location-header">
                <h2><i class="fas fa-map-marker-alt"></i> ${area}</h2>
                <p>${region ? region + ', ' : ''}${country}</p>
            </div>
            
            <div class="main-weather">
                <div class="weather-icon">${emoji}</div>
                <div class="temp-container">
                    <span class="temp">${current.temp_C}°</span>
                    <span class="unit">C</span>
                </div>
                <div class="condition">${weatherDesc}</div>
            </div>
            
            <div class="details-grid">
                <div class="detail-item">
                    <i class="fas fa-tint"></i>
                    <span>Humidity</span>
                    <strong>${current.humidity}%</strong>
                </div>
                <div class="detail-item">
                    <i class="fas fa-wind"></i>
                    <span>Wind</span>
                    <strong>${current.windspeedKmph} km/h</strong>
                </div>
                <div class="detail-item">
                    <i class="fas fa-thermometer-half"></i>
                    <span>Feels Like</span>
                    <strong>${current.FeelsLikeC}°C</strong>
                </div>
                 <div class="detail-item">
                    <i class="fas fa-eye"></i>
                    <span>Visibility</span>
                    <strong>${current.visibility} km</strong>
                </div>
            </div>
        </div>
        
        <div class="forecast-section animate-fade-in" style="animation-delay: 0.2s;">
            <h3><i class="fas fa-calendar-alt"></i> 3-Day Forecast</h3>
            <div class="forecast-container">
    `;

    // Forecast
    const forecastDays = data.weather.slice(0, 3);
    forecastDays.forEach(day => {
        const dateObj = new Date(day.date);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const dayDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

        const maxTemp = day.maxtempC;
        const minTemp = day.mintempC;

        // Find noon condition for icon approx
        // hourly[4] is roughly noon (1200) in wttr.in (3hr intervals: 0, 300, 600, 900, 1200...)
        // Actually wttr.in usually returns 3-hour intervals: 0, 3, 6, 9, 12, 15, 18, 21. Index 4 is 12:00.
        const hourlyData = day.hourly && day.hourly.length > 4 ? day.hourly[4] : day.hourly[0];
        const description = hourlyData.weatherDesc[0].value;
        const forecastEmoji = getWeatherEmoji(description);

        html += `
            <div class="forecast-card">
                <div class="forecast-date">
                    <span class="day">${dayName}</span>
                    <span class="date">${dayDate}</span>
                </div>
                <div class="forecast-icon">${forecastEmoji}</div>
                <div class="forecast-temp">
                    <span class="max">${maxTemp}°</span>
                    <span class="min">${minTemp}°</span>
                </div>
                <div class="forecast-desc">${description}</div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    result.innerHTML = html;
    result.hidden = false;
}

function showError(msg) {
    error.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${msg}`;
    error.hidden = false;
    // Auto hide after 5 seconds
    setTimeout(() => {
        error.classList.add('fade-out');
        setTimeout(() => {
            error.hidden = true;
            error.classList.remove('fade-out');
        }, 500);
    }, 5000);
}

button.addEventListener('click', () => {
    fetchWeather(input.value);
});

input.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        fetchWeather(input.value);
    }
});
