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
        'User-Agent': 'solar-time-app/1.0 (upasaka.ananda@tuta.io)' // Personaliza este campo
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
        Current time: <strong>${nowLocal.toLocaleTimeString("en-GB", { hour12: false })}</strong><br />
        Solar offset: <strong>${formatOffsetMinutes(timeDiffMin)}</strong><br />
        True solar time: <strong>${solarTime.toLocaleTimeString("en-GB", { hour12: false })}</strong><br />
      `;

      drawAnalogClock(solarTime);
    }, 1000);
  } catch (err) {
    console.error(err);
    resultDiv.textContent = "Error calculating solar time.";
  }
}

function drawAnalogClock(date) {
  const canvas = document.getElementById("solarClock");
  const ctx = canvas.getContext("2d");
  const radius = canvas.height / 2;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(radius, radius);

  ctx.beginPath();
  ctx.arc(0, 0, radius - 5, 0, 2 * Math.PI);
  ctx.fillStyle = "#BB691D";
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 4;
  ctx.stroke();

  for (let i = 0; i < 60; i++) {
    let angle = (Math.PI / 30) * i;
    let outer = radius - 5;
    let inner = i % 5 === 0 ? radius - 15 : radius - 10;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
    ctx.lineTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
    ctx.lineWidth = i % 5 === 0 ? 2 : 1;
    ctx.strokeStyle = "#000";
    ctx.stroke();
  }

  ctx.font = radius * 0.15 + "px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let num = 1; num <= 12; num++) {
    const angle = (num * Math.PI) / 6;
    const x = Math.cos(angle - Math.PI / 2) * (radius * 0.75);
    const y = Math.sin(angle - Math.PI / 2) * (radius * 0.75);
    ctx.fillStyle = "#000";
    ctx.fillText(num.toString(), x, y);
  }

  const hour = date.getHours() % 12;
  const minute = date.getMinutes();
  const second = date.getSeconds();

  drawHand(ctx, (hour + minute / 60) * 30, radius * 0.5, 6);
  drawHand(ctx, (minute + second / 60) * 6, radius * 0.8, 4);
  drawHand(ctx, second * 6, radius * 0.9, 2, "red");

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawHand(ctx, angleDeg, length, width, color = "black") {
  const angleRad = (Math.PI / 180) * angleDeg - Math.PI / 2;
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(angleRad) * length, Math.sin(angleRad) * length);
  ctx.stroke();
}

window.onload = function () {
  const savedCity = localStorage.getItem('lastCity');
  if (savedCity) {
    document.getElementById('cityInput').value = savedCity;
    getSolarTime();
  }
};

