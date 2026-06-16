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
      intro: 'Your travel habits are doing the most damage here. The good news? <strong>Small shifts hit different</strong> when it comes to transport emissions.',
      days: [
        'Any trip under 2km ~ just walk it. Your legs work fine',
        'Take public transport today instead of your usual ride. One day, try it',
        'Find one person going your way and carpool. Split the guilt AND the fuel cost',
        'Batch your errands into one trip. Stop making five separate journeys',
        'Work from home today if you can. Zero commute = zero emissions',
        'Google the bus or metro route to your most frequent destination. Just know it exists',
        'Look back at this week. Did you actually change anything? Even one thing counts'
      ]
    },
    food: {
      intro: 'What you eat is quietly wrecking your carbon score. <strong>You do not have to go vegan</strong> — but a few real swaps actually matter.',
      days: [
        'Skip meat for just one meal today. One. That is it',
        'Cook at home instead of ordering. Home food hits different AND uses less energy',
        'Buy something from a local market this week instead of a supermarket chain',
        'Go fully vegetarian for one day. Just one. See how it feels',
        'Plan your meals before shopping. Food waste is a silent carbon killer',
        'If eating meat, choose chicken or fish over beef. Simple swap, big difference',
        'Tell one person what you tried this week. Accountability hits different when someone knows'
      ]
    },
    energy: {
      intro: 'Your home is quietly running up your carbon bill. <strong>You do not need solar panels</strong> — just some genuinely simple habit shifts.',
      days: [
        'Leave a room? Turn off the light. Every. Single. Time.',
        'Set your AC 2 degrees higher and use a fan. You will survive, promise',
        'Unplug chargers that are not charging anything. They still draw power just sitting there',
        'Wash your clothes in cold water today. Uses 90% less energy than hot',
        'Cook multiple things at once instead of heating the stove three separate times',
        'Turn your geyser off 10 minutes early. The water stays hot enough, trust',
        'Walk around your home and count how many things are on standby. Then turn them off'
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