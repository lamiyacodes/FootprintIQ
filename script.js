// FootprintIQ — Built by Lamiya Zainab
// Carbon Footprint Calculator with Gemini AI Insights
// =====================
const GEMINI_API_KEY = ""; 
const GEMINI_MODEL = "gemini-2.0-flash";

// =====================
// OPTION SELECTOR
// =====================
function select(btn, groupId) {
  const group = document.getElementById(groupId);
  group.querySelectorAll('.opt').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// =====================
// GET SELECTED VALUE
// =====================
function getSelected(groupId) {
  const group = document.getElementById(groupId);
  const active = group.querySelector('.opt.active');
  return active ? active.dataset.val : null;
}

// =====================
// CARBON CALCULATION
// =====================
function calculateCarbon(inputs) {
  const { transportMode, km, diet, meals, electricity, ac, energySource } = inputs;

  // Transport CO2 (kg per day)
  const transportFactors = {
    walking: 0,
    public: 0.04,
    car: 0.21,
    flight: 0.9
  };
  const transportCO2 = (transportFactors[transportMode] || 0.1) * km;

  // Food CO2 (kg per day)
  const dietFactors = {
    vegan: 1.5,
    vegetarian: 2.5,
    omnivore: 4.5,
    'heavy-meat': 7.5
  };
  const homeMealFactor = meals / 21; // ratio of home cooking (reduces emissions slightly)
  const foodCO2 = (dietFactors[diet] || 4) * (1 - homeMealFactor * 0.1);

  // Energy CO2 (kg per day)
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

// =====================
// GET SCORE LEVEL
// =====================
function getLevel(total) {
  if (total <= 5) return { label: "Low Impact", class: "low", percent: 20 };
  if (total <= 10) return { label: "Moderate Impact", class: "medium", percent: 50 };
  if (total <= 20) return { label: "High Impact", class: "high", percent: 75 };
  return { label: "Critical Impact", class: "high", percent: 95 };
}

// =====================
// GEMINI API CALL
// =====================
async function getGeminiInsights(inputs, carbon) {
  const { transportMode, km, diet, meals, electricity, ac, energySource } = inputs;

  const prompt = `You are a friendly but direct climate advisor. A user has calculated their carbon footprint.

Their daily habits:
- Transport: ${transportMode} for ${km} km/day
- Diet: ${diet}, cooking ${meals} meals at home per week
- Electricity: ${electricity} hours of heavy appliance use daily
- AC usage: ${ac}
- Energy source: ${energySource}

Their carbon footprint:
- Total: ${carbon.total} kg CO₂/day
- Transport: ${carbon.transport} kg
- Food: ${carbon.food} kg  
- Energy: ${carbon.energy} kg

Give them a personalized action plan in this exact format:

**Your Carbon Story**
[2 sentences about their specific footprint in a warm, non-judgmental tone]

**Top 3 Actions You Can Take This Week**
1. [Specific action based on their highest emission area]
2. [Another specific action]
3. [Third action]

**If You Do This For 30 Days**
[1 sentence about the impact of these changes]

Keep it personal, specific to THEIR data, and under 200 words total. No generic advice.`;

  try {
    const response = await fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    return data.result || 'Unable to generate insights. Please try again.';
  } catch (error) {
    return 'Could not connect to the server. Please try again.';
  }
}

// =====================
// FORMAT AI RESPONSE
// =====================
function formatResponse(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

// =====================
// MAIN CALCULATE FUNCTION
// =====================
async function calculate() {
  // Gather inputs
  const inputs = {
    transportMode: getSelected('transport-mode'),
    km: parseInt(document.getElementById('km-range').value),
    diet: getSelected('diet-type'),
    meals: parseInt(document.getElementById('meals-range').value),
    electricity: parseInt(document.getElementById('elec-range').value),
    ac: getSelected('ac-use'),
    energySource: getSelected('energy-source')
  };

  // Validate
  if (!inputs.transportMode || !inputs.diet || !inputs.ac || !inputs.energySource) {
    alert('Please select all options before calculating.');
    return;
  }

  // Calculate
  const carbon = calculateCarbon(inputs);
  const level = getLevel(carbon.total);

  // Show results section
  document.getElementById('results').classList.remove('hidden');
  document.getElementById('results').scrollIntoView({ behavior: 'smooth' });

  // Animate score
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

  // Score ring color
  ring.className = 'score-ring ' + (level.class !== 'low' ? level.class : '');
  document.getElementById('score-label').textContent = level.label;
  updateShareCard(carbon, level);

  // Meter bar
  setTimeout(() => {
    document.getElementById('meter-fill').style.width = level.percent + '%';
  }, 100);

  function getCarbonEquivalents(total) {
  const daily = total;
  return [
    {
      icon: '🚗',
      text: `Driving <strong>${Math.round(daily / 0.21)} km</strong> by car`
    },
    {
      icon: '🌳',
      text: `You need <strong>${Math.round(daily / 0.06)} trees</strong> to offset this daily`
    },
    {
      icon: '💡',
      text: `Powering <strong>${Math.round(daily / 0.005)} LED bulbs</strong> for a day`
    },
    {
      icon: '📱',
      text: `Charging your phone <strong>${Math.round(daily / 0.008)} times</strong>`
    }
  ];
}

const equivalents = getCarbonEquivalents(carbon.total);
document.getElementById('equivalents').innerHTML = equivalents.map(e => `
  <div class="equiv-item">
    <span class="equiv-icon">${e.icon}</span>
    <span class="equiv-text">${e.text}</span>
  </div>
`).join('');

  // Breakdown cards
  document.getElementById('breakdown').innerHTML = `
    <div class="breakdown-item">
      <div class="bi-label">Transport</div>
      <div class="bi-value">${carbon.transport}</div>
      <div class="bi-unit">kg CO₂/day</div>
    </div>
    <div class="breakdown-item">
      <div class="bi-label">Food</div>
      <div class="bi-value">${carbon.food}</div>
      <div class="bi-unit">kg CO₂/day</div>
    </div>
    <div class="breakdown-item">
      <div class="bi-label">Energy</div>
      <div class="bi-value">${carbon.energy}</div>
      <div class="bi-unit">kg CO₂/day</div>
    </div>
  `;

  // Get Gemini insights
  document.getElementById('ai-loading').classList.remove('hidden');
  document.getElementById('ai-content').classList.add('hidden');

  const insights = await getGeminiInsights(inputs, carbon);

  document.getElementById('ai-loading').classList.add('hidden');
  document.getElementById('ai-content').classList.remove('hidden');
  document.getElementById('ai-content').innerHTML = formatResponse(insights);
}

// =====================
// SHARE CARD UPDATE
// =====================
function updateShareCard(carbon, level) {
  const avg = 4.5;
  const diff = Math.abs(carbon.total - avg);
  const direction = carbon.total > avg ? 'higher' : 'lower';
  const percent = Math.round((diff / avg) * 100);

  document.getElementById('share-score-big').textContent = carbon.total + ' kg CO₂/day';
  document.getElementById('share-level').textContent = level.label;
  document.getElementById('share-compare').textContent =
    `Your footprint is ${percent}% ${direction} than the average Indian (4.5 kg CO₂/day)`;
}

// =====================
// SHARE FUNCTION
// =====================
function shareCard() {
  const card = document.getElementById('share-card');
  const text = `My carbon footprint is ${document.getElementById('share-score-big').textContent} — calculated with FootprintIQ powered by Gemini AI. Know yours at footprintiq.vercel.app`;

  if (navigator.share) {
    navigator.share({
      title: 'My Carbon Footprint — FootprintIQ',
      text: text,
    });
  } else {
    navigator.clipboard.writeText(text).then(() => {
      alert('Score copied to clipboard! Paste it anywhere to share.');
    });
  }
}

// =====================
// RESET
// =====================
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