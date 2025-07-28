let intervalId;

function getEquationOfTime(dayOfYear) {
  const B = (360 / 365) * (dayOfYear - 81) * Math.PI / 180;
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
}

function formatOffsetMinutes(minutes) {
  const sign = minutes < 0 ? "-" : "+";
  const absMin = Math.abs(minutes);
  const hrs = Math.floor(absMin / 60);
  const min = Math.round(absMin % 60);
  return `${sign}${hrs} h ${min} min`;
}

async function getSolarTime() {
  const city = document.getElementById('cityInput').value.trim();
  const resultDiv = document.getElementById('result');

  if (!city) {
    resultDiv.textContent = "Please enter a city.";
    return;
  }

  localStorage.setItem('lastCity', city);
  resultDiv.textContent = "Calculating...";

  try {
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`, {
      headers: {
        'User-Agent': 'solar-time-app/1.0 (upasaka.ananda@tuta.io)'
      }
    });
    const geoData = await geoRes.json();

    if (!geoData.length) {
      resultDiv.textContent = "City not found.";
      return;
    }

    const lat = parseFloat(geoData[0].lat);
    const lng = parseFloat(geoData[0].lon);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offsetHours = -new Date().getTimezoneOffset() / 60;

    clearInterval(intervalId);

    intervalId = setInterval(() => {
      const nowUTC = new Date();
      const nowLocal = new Date(nowUTC.toLocaleString("en-US", { timeZone: timezone }));

      const startOfYear = new Date(Date.UTC(nowLocal.getFullYear(), 0, 0));
      const diff = nowLocal - startOfYear;
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);

      const eot = getEquationOfTime(dayOfYear);
      const standardMeridian = offsetHours * 15;
      const longitudeCorrection = 4 * (standardMeridian - lng);
      const totalCorrectionMinutes = eot + longitudeCorrection;

      const solarTime = new Date(nowLocal.getTime() - totalCorrectionMinutes * 60 * 1000);
      const timeDiffMin = Math.round((nowLocal - solarTime) / (1000 * 60));

      resultDiv.innerHTML = `
        <strong>${city}</strong><br />
        Device time: <strong>${nowLocal.toLocaleTimeString("en-GB", { hour12: false })}</strong><br />
        Solar offset: <strong>${formatOffsetMinutes(timeDiffMin)}</strong><br />
        True solar time: <strong>${solarTime.toLocaleTimeString("en-GB", { hour12: false })}</strong><br />
      `;

      drawSundialClock(solarTime);
    }, 1000);
  } catch (err) {
    console.error(err);
    resultDiv.textContent = "Connection with OSM not established.";
  }
}

function drawSundialClock(date) {
  const canvas = document.getElementById("solarClock");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const radius = width / 2;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height * 0.2;


// Fondo oscuro fuera de horas solares
const hour = date.getHours() + date.getMinutes() / 60;
if (hour < 6 || hour > 18) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#EEE8D5"; // color claro tipo pergamino
  ctx.font = "14px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Sundial visible between 6h and 18h", centerX, height / 2);
  
  return;
}




  // Semicírculo inferior
//  ctx.beginPath();
//  ctx.arc(centerX, centerY, radius - 10, 0, Math.PI, true);
//  ctx.fillStyle = "#BB691D";
//  ctx.fill();
//  ctx.lineWidth = 4;
//  ctx.strokeStyle = "#000";
//  ctx.stroke();

  // Gnomon
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX, centerY - 30);
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#5C2C06";
  ctx.stroke();

  // Horas en números romanos de VI a XVIII
  ctx.font = `${radius * 0.10}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#BB691D";
  const hourLabels = [
    "VI", "VII", "VIII", "IX", "X", "XI",
    "🔆", "I", "II", "III", "IV", "V",
    "VI"
  ];

  for (let i = 0; i < hourLabels.length; i++) {
    const angle = Math.PI * (i / (hourLabels.length - 1));
    const x = centerX + Math.cos(angle) * (radius - 30);
    const y = centerY + Math.sin(angle) * (radius - 30);
    ctx.fillText(hourLabels[i], x, y);
  }

  // Sombra (aguja solar)
  const sunHour = date.getHours() + date.getMinutes() / 60;
  const t = (sunHour - 6) / (18 - 6); // Normalizar entre 0 y 1
  const angle = Math.PI * t;
  const shadowLength = radius - 40;

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + Math.cos(angle) * shadowLength,
    centerY + Math.sin(angle) * shadowLength
  );
  ctx.strokeStyle = "#303030";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.stroke();
}

window.onload = function () {
  const savedCity = localStorage.getItem('lastCity');
  if (savedCity) {
    document.getElementById('cityInput').value = savedCity;
    getSolarTime();
  }
};

