const todayBox = document.getElementById("today");
const grid = document.getElementById("grid");
const loading = document.getElementById("loading");
grid.innerHTML = "2 Sek, Snakker lige med vejrstationen...";

function getWeatherIcon(code) {
    if (code === 0) return "☀️";
    if (code === 1) return "🌤️";
    if (code === 2) return "🌥️";
    if (code <= 42) return "☁️";
    if (code <= 50) return "😶‍🌫️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    if (code <= 82) return "🌦️";
    if (code <= 94) return "🌧️";
    if (code >= 95) return "⛈️";
    return "🚫";
}

function getTempIcon(temp) {
    if (temp <= 0) return "🧥";
    if (temp < 12) return "👖";
    if (temp <= 18) return "🩳";
    if (temp <= 25) return "🔥";
    return "💀";
}

fetch("https://api.open-meteo.com/v1/forecast?latitude=55.78&longitude=11.66&daily=weather_code&hourly=apparent_temperature&current=apparent_temperature,weather_code&past_days=1&forecast_days=16")
    .then(response => response.json())
    .then(data => {
        const times = data.daily.time;
        const codes = data.daily.weather_code;
        const hourlyTimes = data.hourly.time;
        const hourlyTemps = data.hourly.apparent_temperature;

// Gennemsnitlig temperatur hver dag (08:00-20:00)
        const dailyAverages = {};

    for (let i = 0; i < hourlyTimes.length; i++) {

        const time = new Date(hourlyTimes[i]);
        const hour = time.getHours();
        const dateStr = hourlyTimes[i].split("T")[0];

    if (hour >= 8 && hour <= 20) {

        if (!dailyAverages[dateStr]) {
            dailyAverages[dateStr] = {
                sum: 0,
                count: 0
            };
        }
        dailyAverages[dateStr].sum += hourlyTemps[i];
        dailyAverages[dateStr].count++;
    }
}

// Convert sums into averages
    for (const date in dailyAverages) {
        dailyAverages[date] =
            dailyAverages[date].sum /
            dailyAverages[date].count;
    }
        const todayStr = new Date().toISOString().split("T")[0];
        const todayIndex = times.indexOf(todayStr);
        const currentTemp = data.current.apparent_temperature;
        grid.innerHTML = "";
        loading.style.display = "none";


        // I Dag (REAL-TID)
        if (todayIndex !== -1) {

            const date = new Date(times[todayIndex]);
            const day = date.toLocaleDateString("da-DK", { weekday: "long" });
            const capitalisedDay = day.charAt(0).toUpperCase() + day.slice(1);
            const icon = getWeatherIcon(data.current.weather_code);
            const tempIcon = getTempIcon(currentTemp);
            const tempDisplay = `${tempIcon} ${Math.round(temp)}°C`;

            todayBox.innerHTML = `
                <div class="tile today">
                    ${icon}<br>
                    I dag<br>
                    ${capitalisedDay}<br>
                    ${tempDisplay}
                </div>`;
        }

        // GRID (Udsigt)
        for (let i = 0; i < times.length; i++) {
            if (i === todayIndex) continue;
            const date = new Date(times[i]);
            const day = date.toLocaleDateString("da-DK", { weekday: "short" });
            const capitalisedDay = day.charAt(0).toUpperCase() + day.slice(1);
            const dayNum = date.getDate();
            const month = date.getMonth() + 1;
            const avgTemp = dailyAverages[times[i]];
            const tempIcon = getTempIcon(avgTemp);
            const icon = getWeatherIcon(codes[i]);
            let label = `${capitalisedDay} (${dayNum}/${month})`;

            if (codes[i] >= 40) {
            label = "";
            
            }
            let className = "tile";
            if (codes[i] < 40) className += " sunny";
            grid.innerHTML += `<div class="${className}">${icon}<br>${label}</div>`;
        }
    })
    .catch(error => {
        console.error("Weather fetch failed:", error);
        loading.innerHTML = "Kunne ikke hente vejret 😢";
    });