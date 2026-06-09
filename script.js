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

    grid.innerHTML = "";
    loading.style.display = "none";

    // ----------------------------
    // DAILY AVERAGE (08–20)
    // ----------------------------
    const dailyAverages = {};

    for (let i = 0; i < hourlyTimes.length; i++) {

        const dateKey = hourlyTimes[i].split("T")[0];
        const hour = new Date(hourlyTimes[i]).getHours();

        if (hour >= 8 && hour <= 20) {

            if (!dailyAverages[dateKey]) {
                dailyAverages[dateKey] = { sum: 0, count: 0 };
            }

            dailyAverages[dateKey].sum += hourlyTemps[i];
            dailyAverages[dateKey].count++;
        }
    }

    for (const key in dailyAverages) {
        dailyAverages[key] =
            dailyAverages[key].sum / dailyAverages[key].count;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const todayIndex = times.indexOf(todayStr);

    // ----------------------------
    // TODAY (CURRENT WEATHER)
    // ----------------------------
    if (todayIndex !== -1) {

        const date = new Date(times[todayIndex]);
        const day = date.toLocaleDateString("da-DK", { weekday: "long" });
        const capitalisedDay = day.charAt(0).toUpperCase() + day.slice(1);
        const icon = getWeatherIcon(data.current.weather_code);
        const currentTemp = data.current.apparent_temperature;
        const tempIcon = getTempIcon(currentTemp);
        const tempDisplay = `${tempIcon} ${Math.round(currentTemp)}°C`;

        todayBox.innerHTML = `
            <div class="tile today">
                ${icon}<br>
                I dag<br>
                ${capitalisedDay}<br>
                ${tempDisplay}
            </div>`;
    }

    // ----------------------------
    // GRID (FORECAST + AVERAGE TEMP)
    // ----------------------------
    for (let i = 0; i < times.length; i++) {

        if (i === todayIndex) continue;
        const date = new Date(times[i]);
        const day = date.toLocaleDateString("da-DK", { weekday: "short" });
        const capitalisedDay = day.charAt(0).toUpperCase() + day.slice(1);
        const dayNum = date.getDate();
        const month = date.getMonth() + 1;
        const dateKey = times[i].split("T")[0];
        const icon = getWeatherIcon(codes[i]);
        const avgTemp = dailyAverages[dateKey] ?? 15;
        const tempIcon = getTempIcon(avgTemp);
        let label = `${capitalisedDay} (${dayNum}/${month})`;
        if (codes[i] >= 40) {
            label = "";
        }
        let className = "tile";
        if (codes[i] < 40) className += " sunny";
        grid.innerHTML += `
            <div class="${className}">
                ${tempIcon}${icon}<br>
                ${label}
            </div>`;
    }

})
.catch(error => {
    console.error("Weather fetch failed:", error);
    loading.innerHTML = "Kunne ikke hente vejret 😢";
});