// FootprintIQ — Built by Lamiya Zainab
// Carbon Footprint Calculator
const GEMINI_API_KEY = "";

function select(btn, groupId) {
  const group = document.getElementById(groupId);
  group.querySelectorAll('.opt').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function getSelected(groupId) {
  const group = document.getElementById(groupId);
  const active = group.querySelector('.opt.active');
  return active ? active.dataset.val : null;
}

function calculateCarbon(inputs) {
  const { transportMode, km, diet, meals, electricity, ac, energySource } = inputs;
  const transportFactors = { walking: 0, public: 0.04, car: 0.21, flight: 0.9 };
  const transportCO2 = (transportFactors[transportMode] || 0.1) * km;
  const dietFactors = { vegan: 1.5, vegetarian: 2.5, omnivore: 4.5, 'heavy-meat': 7.5 };
  const homeMealFactor = meals / 21;
  const foodCO2 = (dietFactors[diet] || 4) * (1 - homeMealFactor * 0.1);
  const sourceFactors = { solar: 0.02, grid: 0.5, generator: 0.8 };
  const acBonus = ac === 'yes' ? 2 : ac === 'sometimes' ? 0.8 : 0;
  const energyCO2 = (sourceFactors[energySource] || 0.5) * electricity + acBonus;
  const total = transportCO2 + foodCO2 + energyCO2;
  return {
    total: Math.round(total * 10) / 10,
    transport: Math.round(transportCO2 * 10) / 10,
    food: Math.round(foodCO2 * 10) / 10,
    energy: Math.round(energyCO2 * 10) / 10
  };
}

function getLevel(total) {
  if (total <= 5) return { label: "Low Impact", class: "low", percent: 20 };
  if (total <= 10) return { label: "Moderate Impact", class: "medium", percent: 50 };
  if (total <= 20) return { label: "High Impact", class: "high", percent: 75 };
  return { label: "Critical Impact", class: "high", percent: 95 };
}

function getActionPlan(carbon, inputs) {
  const highest = Object.entries({
    transport: carbon.transport,
    food: carbon.food,
    energy: carbon.energy
  }).sort((a, b) => b[1] - a[1])[0][0];

  const plans = {
    transport: {
      intro: 'Your biggest carbon culprit is <strong>how you travel</strong>. Small shifts in your daily commute can make a massive difference.',
      days: [
        'Walk or cycle for any trip under 2km instead of taking a vehicle',
        'Try public transport for your main commute today',
        'Carpool with someone going the same direction',
        'Plan all your errands in one trip instead of multiple small ones',
        'Work from home if possible — zero commute, zero emissions',
        'Research the nearest metro or bus route to your most frequent destination',
        'Calculate how much CO2 you saved this week and share it with someone'
      ]
    },
    food: {
      intro: 'Your biggest carbon culprit is <strong>your diet</strong>. Food choices are one of the most powerful levers you have.',
      days: [
        'Replace one meat meal today with a plant-based alternative',
        'Cook at home instead of ordering — home cooking uses 30% less energy',
        'Buy local produce from a nearby market instead of packaged supermarket food',
        'Try a fully vegetarian day — even one day a week matters',
        'Reduce food waste by planning your meals before grocery shopping',
        'Swap beef for chicken or fish — it cuts food emissions by nearly half',
        'Share your plant-based meal experiment with someone and inspire them'
      ]
    },
    energy: {
      intro: 'Your biggest carbon culprit is <strong>your home energy use</strong>. Simple habit changes at home add up faster than you think.',
      days: [
        'Turn off all lights and fans when leaving a room — every single time',
        'Set your AC 2 degrees higher than usual and use a fan instead',
        'Unplug chargers and devices you are not actively using',
        'Do laundry with cold water — it uses 90% less energy than hot',
        'Cook multiple meals at once to minimize oven and stove use',
        'Switch off your geyser 10 minutes early — the water stays hot enough',
        'Do an energy audit — walk around your home and note every device left on standby'
      ]
    }
  };

  const plan = plans[highest];

  document.getElementById('action-content').innerHTML =
    '<p class="action-intro">' + plan.intro + '</p>' +
    '<div class="action-days">' +
    plan.days.map((task, i) =>
      '<div class="action-day">' +
        '<span class="day-number">Day ' + (i + 1) + '</span>' +
        '<span class="day-task">' + task + '</span>' +
      '</div>'
    ).join('') +
    '</div>';
}

function getCarbonEquivalents(total) {
  return [
    { icon: '🚗', text: 'Driving <strong>' + Math.round(total / 0.21) + ' km</strong> by car' },
    { icon: '🌳', text: 'You need <strong>' + Math.round(total / 0.06) + ' trees</strong> to offset this daily' },
    { icon: '💡', text: 'Powering <strong>' + Math.round(total / 0.005) + ' LED bulbs</strong> for a day' },
    { icon: '📱', text: 'Charging your phone <strong>' + Math.round(total / 0.008) + ' times</strong>' }
  ];
}

function renderChart(userTotal) {
  const maxVal = Math.max(userTotal, 12, 2.5);
  const bars = [
    { label: 'You', value: userTotal, class: 'you' },
    { label: 'India Avg', value: 4.5, class: 'india' },
    { label: 'Global Avg', value: 12, class: 'global' },
    { label: 'Paris Target', value: 2.5, class: 'paris' }
  ];
  document.getElementById('comparison-chart').innerHTML = bars.map(bar =>
    '<div class="chart-bar-group">' +
      '<div class="chart-value">' + bar.value + '</div>' +
      '<div class="chart-bar ' + bar.class + '" style="height:' + Math.round((bar.value / maxVal) * 150) + 'px"></div>' +
      '<div class="chart-label">' + bar.label + '</div>' +
    '</div>'
  ).join('');
}

function updateShareCard(carbon, level) {
  const avg = 4.5;
  const diff = Math.abs(carbon.total - avg);
  const direction = carbon.total > avg ? 'higher' : 'lower';
  const percent = Math.round((diff / avg) * 100);
  document.getElementById('share-score-big').textContent = carbon.total + ' kg CO2/day';
  document.getElementById('share-level').textContent = level.label;
  document.getElementById('share-compare').textContent = 'Your footprint is ' + percent + '% ' + direction + ' than the average Indian (4.5 kg CO2/day)';
}

function shareCard() {
  const text = 'My carbon footprint is ' + document.getElementById('share-score-big').textContent + ' — calculated with FootprintIQ. Know yours at footprint-iq.vercel.app';
  if (navigator.share) {
    navigator.share({ title: 'My Carbon Footprint — FootprintIQ', text: text });
  } else {
    navigator.clipboard.writeText(text).then(() => {
      alert('Score copied to clipboard! Paste it anywhere to share.');
    });
  }
}

async function calculate() {
  const inputs = {
    transportMode: getSelected('transport-mode'),
    km: parseInt(document.getElementById('km-range').value),
    diet: getSelected('diet-type'),
    meals: parseInt(document.getElementById('meals-range').value),
    electricity: parseInt(document.getElementById('elec-range').value),
    ac: getSelected('ac-use'),
    energySource: getSelected('energy-source')
  };

  if (!inputs.transportMode || !inputs.diet || !inputs.ac || !inputs.energySource) {
    alert('Please select all options before calculating.');
    return;
  }

  const carbon = calculateCarbon(inputs);
  const level = getLevel(carbon.total);

  document.getElementById('results').classList.remove('hidden');
  document.getElementById('results').scrollIntoView({ behavior: 'smooth' });

  const scoreEl = document.getElementById('score-display');
  const ring = document.getElementById('score-ring');
  let current = 0;
  const target = carbon.total;
  const step = target / 40;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    scoreEl.textContent = Math.round(current * 10) / 10;
    if (current >= target) clearInterval(timer);
  }, 30);

  ring.className = 'score-ring ' + (level.class !== 'low' ? level.class : '');
  document.getElementById('score-label').textContent = level.label;
  updateShareCard(carbon, level);

  setTimeout(() => {
    document.getElementById('meter-fill').style.width = level.percent + '%';
  }, 100);

  document.getElementById('breakdown').innerHTML =
    '<div class="breakdown-item"><div class="bi-label">Transport</div><div class="bi-value">' + carbon.transport + '</div><div class="bi-unit">kg CO2/day</div></div>' +
    '<div class="breakdown-item"><div class="bi-label">Food</div><div class="bi-value">' + carbon.food + '</div><div class="bi-unit">kg CO2/day</div></div>' +
    '<div class="breakdown-item"><div class="bi-label">Energy</div><div class="bi-value">' + carbon.energy + '</div><div class="bi-unit">kg CO2/day</div></div>';

  renderChart(carbon.total);
  getActionPlan(carbon, inputs);

  document.getElementById('equivalents').innerHTML = getCarbonEquivalents(carbon.total).map(e =>
    '<div class="equiv-item"><span class="equiv-icon">' + e.icon + '</span><span class="equiv-text">' + e.text + '</span></div>'
  ).join('');
}

function reset() {
  document.getElementById('results').classList.add('hidden');
  document.querySelectorAll('.opt').forEach(b => b.classList.remove('active'));
  document.getElementById('km-range').value = 10;
  document.getElementById('km-val').textContent = 10;
  document.getElementById('meals-range').value = 14;
  document.getElementById('meals-val').textContent = 14;
  document.getElementById('elec-range').value = 4;
  document.getElementById('elec-val').textContent = 4;
  document.getElementById('meter-fill').style.width = '0%';
  document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' });
}