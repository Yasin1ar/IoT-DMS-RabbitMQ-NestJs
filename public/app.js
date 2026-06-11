const MAX_ROWS = 50;
const API_URL = '/signals?page=1&limit=50';

const signalsBody = document.getElementById('signals-body');
const emptyRow = document.getElementById('empty-row');
const totalCountEl = document.getElementById('total-count');
const rowCountEl = document.getElementById('row-count');
const lastUpdateEl = document.getElementById('last-update');
const connectionStatusEl = document.getElementById('connection-status');
const themeToggleBtn = document.getElementById('theme-toggle');

let rowCount = 0;

function initTheme() {
  const savedTheme = localStorage.getItem('dashboard-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    updateToggleButton('light');
  } else if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateToggleButton('dark');
  } else {
    const themeToUse = prefersDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeToUse);
    updateToggleButton(themeToUse);
  }
}

function updateToggleButton(theme) {
  if (!themeToggleBtn) return;
  const iconSpan = themeToggleBtn.querySelector('.toggle-icon');
  const textSpan = themeToggleBtn.querySelector('.toggle-text');
  
  if (theme === 'dark') {
    iconSpan.textContent = '🌙';
    textSpan.textContent = 'Dark';
  } else {
    iconSpan.textContent = '☀️';
    textSpan.textContent = 'Light';
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  let newTheme = 'dark';
  
  if (currentTheme === 'dark') {
    newTheme = 'light';
  } else {
    newTheme = 'dark';
  }
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('dashboard-theme', newTheme);
  updateToggleButton(newTheme);
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', toggleTheme);
}

function formatTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}

function formatVolume(value) {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  if (typeof value === 'string' && !isNaN(parseFloat(value))) {
    return parseFloat(value).toFixed(2);
  }
  return '—';
}

function updateLastUpdate() {
  lastUpdateEl.textContent = new Date().toLocaleTimeString();
}

function updateRowCount() {
  rowCountEl.textContent = String(rowCount);
}

function setConnectionStatus(connected) {
  connectionStatusEl.textContent = connected ? '🟢 Live' : '🔴 Disconnected';
  connectionStatusEl.className = `status-badge ${connected ? 'connected' : 'disconnected'}`;
}

function createRow(signal, isNew = false) {
  const row = document.createElement('tr');
  if (isNew) {
    row.classList.add('new-row');
    setTimeout(() => {
      row.classList.remove('new-row');
    }, 1000);
  }

  const deviceId = signal.deviceId ?? signal.device_id ?? '—';
  const timeRaw = signal.time ?? signal.timestamp ?? signal.createdAt ?? null;
  const dataLength = signal.dataLength ?? signal.data_length ?? signal.payloadLength ?? '—';
  let dataVolume = signal.dataVolume ?? signal.data_volume ?? signal.volume ?? null;
  
  row.innerHTML = `
    <td class="device-id">${escapeHtml(String(deviceId))}</td>
    <td>${formatTime(timeRaw)}</td>
    <td>${dataLength}</td>
    <td>${formatVolume(dataVolume)} Kb</td>
  `;
  
  return row;
}

function escapeHtml(str) {
  if (!str) return '—';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function prependSignal(signal, isNew = false) {
  if (emptyRow && emptyRow.parentElement) {
    emptyRow.remove();
  }

  const newRow = createRow(signal, isNew);
  signalsBody.prepend(newRow);
  rowCount += 1;

  while (signalsBody.children.length > MAX_ROWS) {
    const lastChild = signalsBody.lastElementChild;
    if (lastChild) lastChild.remove();
  }

  updateRowCount();
  updateLastUpdate();
}

async function loadInitialSignals() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Failed to load signals (${response.status})`);
    }

    const result = await response.json();
    let data = [];
    let total = 0;
    
    if (Array.isArray(result)) {
      data = result;
      total = result.length;
    } else if (result.data && Array.isArray(result.data)) {
      data = result.data;
      total = result.total ?? result.data.length;
    } else if (result.items && Array.isArray(result.items)) {
      data = result.items;
      total = result.total ?? result.items.length;
    } else {
      data = [];
      total = 0;
    }
    
    totalCountEl.textContent = String(total ?? 0);

    if (!data.length) {
      return;
    }

    if (emptyRow && emptyRow.parentElement) {
      emptyRow.remove();
    }
    
    const reversedData = [...data].reverse();
    reversedData.forEach((signal) => {
      signalsBody.appendChild(createRow(signal, false));
    });
    
    rowCount = data.length;
    updateRowCount();
    updateLastUpdate();
  } catch (error) {
    console.error('Initial load error:', error);
    totalCountEl.textContent = 'Error';
    if (emptyRow) {
      emptyRow.innerHTML = '<td colspan="4" class="empty-message">⚠️ Failed to load initial data. Check connection.</td>';
    }
  }
}

function connectWebSocket() {
  if (typeof io === 'undefined') {
    console.warn('Socket.IO not loaded yet, retrying in 500ms');
    setTimeout(connectWebSocket, 500);
    return;
  }
  
  const socket = io({
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    setConnectionStatus(true);
    console.log('WebSocket connected');
  });
  
  socket.on('disconnect', (reason) => {
    setConnectionStatus(false);
    console.log('WebSocket disconnected:', reason);
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    setConnectionStatus(false);
  });

  socket.on('signal.created', (signal) => {
    if (signal) {
      prependSignal(signal, true);
      const currentTotal = parseInt(totalCountEl.textContent, 10);
      if (!isNaN(currentTotal)) {
        totalCountEl.textContent = String(currentTotal + 1);
      } else {
        if (totalCountEl.textContent === '—' || totalCountEl.textContent === 'Error') {
          totalCountEl.textContent = '1';
        } else {
          totalCountEl.textContent = String(currentTotal + 1);
        }
      }
    }
  });
  
  socket.on('new_signal', (signal) => {
    if (signal) prependSignal(signal, true);
  });
  
  socket.on('signal:created', (signal) => {
    if (signal) prependSignal(signal, true);
  });
  
  socket.on('pong', () => {});
}

function startHeartbeatMonitor() {
  setInterval(() => {}, 30000);
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadInitialSignals();
  connectWebSocket();
  startHeartbeatMonitor();
  
  const refreshStatHint = () => {
    const visibleRows = signalsBody.querySelectorAll('tr:not(#empty-row)').length;
    if (visibleRows !== rowCount && !emptyRow.parentElement) {
      rowCount = visibleRows;
      updateRowCount();
    }
  };
  setInterval(refreshStatHint, 2000);
});