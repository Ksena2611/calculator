let currentInput = '0';
let previousInput = '';
let operator = null;
let shouldResetScreen = false;

const currentDisplay = document.getElementById('current');
const displayArea = document.getElementById('display-area');

function updateDisplay() {
  // Náhrada tečky za čárku pro zobrazení (podle české/iOS lokalizace)
  let formattedValue = currentInput.replace('.', ',');

  // Formátování velkých čísel (oddělovač tisíců)
  if (!currentInput.includes('.') && !isNaN(parseFloat(currentInput))) {
    formattedValue = parseFloat(currentInput).toLocaleString('cs-CZ');
  }

  currentDisplay.textContent = formattedValue;

  // Dynamická velikost písma v závislosti na délce čísla
  const length = formattedValue.length;
  if (length > 6 && length <= 8) {
    currentDisplay.style.fontSize = '4rem';
  } else if (length > 8) {
    currentDisplay.style.fontSize = '2.8rem';
  } else {
    currentDisplay.style.fontSize = '5.5rem';
  }
}

function appendNumber(number) {
  if (shouldResetScreen) {
    currentInput = '';
    shouldResetScreen = false;
  }
  
  // Omezení iOS: maximálně 9 číslic na displeji
  if (currentInput.replace(/[.-]/g, '').length >= 9) return;

  if (currentInput === '0') {
    currentInput = number;
  } else {
    currentInput += number;
  }
  
  clearActiveOperators();
  updateDisplay();
}

function appendDecimal() {
  if (shouldResetScreen) {
    currentInput = '0';
    shouldResetScreen = false;
  }
  if (!currentInput.includes('.')) {
    currentInput += '.';
  }
  updateDisplay();
}

function toggleSign() {
  if (currentInput === '0') return;
  currentInput = (parseFloat(currentInput) * -1).toString();
  updateDisplay();
}

function appendPercent() {
  currentInput = (parseFloat(currentInput) / 100).toString();
  updateDisplay();
}

function appendOperator(op) {
  if (operator !== null && !shouldResetScreen) {
    calculate();
  }
  previousInput = currentInput;
  operator = op;
  shouldResetScreen = true;
  
  // Zvýraznění tlačítka operátoru
  clearActiveOperators();
  const btn = document.querySelector(`.op-btn[data-op="${op}"]`);
  if (btn) btn.classList.add('active');
}

function calculate() {
  if (operator === null || shouldResetScreen) return;

  let computation;
  const prev = parseFloat(previousInput);
  const current = parseFloat(currentInput);

  if (isNaN(prev) || isNaN(current)) return;

  switch (operator) {
    case '+': computation = prev + current; break;
    case '-': computation = prev - current; break;
    case '*': computation = prev * current; break;
    case '/': computation = current === 0 ? 'Chyba' : prev / current; break;
    case '%': computation = prev % current; break;
    default: return;
  }

  // Prevence příliš dlouhých desetinných míst
  if (typeof computation === 'number') {
    computation = parseFloat(computation.toFixed(8));
  }

  currentInput = computation.toString();
  operator = null;
  shouldResetScreen = true;
  clearActiveOperators();
  updateDisplay();
}

function clearAll() {
  currentInput = '0';
  previousInput = '';
  operator = null;
  shouldResetScreen = false;
  clearActiveOperators();
  updateDisplay();
}

function clearActiveOperators() {
  document.querySelectorAll('.op-btn').forEach(btn => btn.classList.remove('active'));
}

function deleteLast() {
  if (shouldResetScreen || currentInput === '0') return;
  
  currentInput = currentInput.slice(0, -1);
  if (currentInput === '' || currentInput === '-') {
    currentInput = '0';
  }
  updateDisplay();
}

// --- Gesto swipe po displeji pro smazání poslední číslice ---
let touchStartX = 0;
displayArea.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

displayArea.addEventListener('touchend', (e) => {
  let touchEndX = e.changedTouches[0].screenX;
  if (Math.abs(touchEndX - touchStartX) > 30) {
    deleteLast();
  }
}, { passive: true });

// Podpora klávesnice
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
  if (e.key === '.' || e.key === ',') appendDecimal();
  if (e.key === '+' || e.key === '-') appendOperator(e.key);
  if (e.key === '*') appendOperator('*');
  if (e.key === '/') appendOperator('/');
  if (e.key === 'Enter' || e.key === '=') calculate();
  if (e.key === 'Backspace') deleteLast();
  if (e.key === 'Escape') clearAll();
});

updateDisplay();