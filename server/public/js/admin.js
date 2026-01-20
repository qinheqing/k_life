const API_BASE = '/api/admin';
let currentPage = 1;
let currentFilter = 'all';
let currentSearch = '';
const itemsPerPage = 20;

function getToken() {
  return localStorage.getItem('adminToken');
}

function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  }).then(async (response) => {
    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login.html';
      throw new Error('Unauthorized');
    }
    return response.json();
  });
}

async function loadStats() {
  try {
    const data = await apiRequest('/stats');
    document.getElementById('stat-total').textContent = data.total;
    document.getElementById('stat-used').textContent = data.used;
    document.getElementById('stat-unused').textContent = data.unused;
    document.getElementById('stat-rate').textContent = `${data.usageRate}%`;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadCodes() {
  try {
    const data = await apiRequest(
      `/codes?page=${currentPage}&limit=${itemsPerPage}&status=${currentFilter}&search=${currentSearch}`
    );

    const tbody = document.getElementById('codesTableBody');
    tbody.innerHTML = '';

    if (data.codes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="loading">No codes found</td></tr>';
      return;
    }

    data.codes.forEach((code) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${code.id}</td>
        <td><code>${code.code}</code></td>
        <td><span class="status-badge ${code.is_used ? 'used' : 'unused'}">${code.is_used ? 'Used' : 'Unused'}</span></td>
        <td>${formatDate(code.created_at)}</td>
        <td>${code.used_at ? formatDate(code.used_at) : '-'}</td>
        <td>${code.user_name || '-'}</td>
        <td class="action-buttons">
          <button class="action-btn copy" onclick="copyCode('${code.code}')">Copy</button>
          ${code.is_used ? `<button class="action-btn reset" onclick="resetCode(${code.id})">Reset</button>` : ''}
          <button class="action-btn delete" onclick="deleteCode(${code.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    updatePagination(data);
  } catch (error) {
    console.error('Error loading codes:', error);
    document.getElementById('codesTableBody').innerHTML = '<tr><td colspan="7" class="loading">Error loading codes</td></tr>';
  }
}

async function loadLogs() {
  try {
    const data = await apiRequest('/logs?limit=20');
    const container = document.getElementById('logsContainer');
    container.innerHTML = '';

    if (data.logs.length === 0) {
      container.innerHTML = '<div class="loading">No logs found</div>';
      return;
    }

    data.logs.forEach((log) => {
      const div = document.createElement('div');
      div.className = 'log-entry';
      div.innerHTML = `
        <div class="log-time">${formatDateTime(log.created_at)}</div>
        <div class="log-action">${log.action}</div>
        <div class="log-details">${log.details}</div>
      `;
      container.appendChild(div);
    });
  } catch (error) {
    console.error('Error loading logs:', error);
  }
}

function updatePagination(data) {
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');

  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= data.pages;
  pageInfo.textContent = `Page ${currentPage} of ${data.pages || 1}`;
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function formatDateTime(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.background = type === 'error' ? '#ef4444' : '#10b981';
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

function copyCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    showToast('Code copied to clipboard');
  }).catch(() => {
    showToast('Failed to copy code', 'error');
  });
}

async function resetCode(id) {
  if (!confirm('Are you sure you want to reset this code?')) return;

  try {
    await apiRequest(`/codes/${id}/reset`, { method: 'PUT' });
    showToast('Code reset successfully');
    loadCodes();
    loadStats();
  } catch (error) {
    showToast('Failed to reset code', 'error');
  }
}

async function deleteCode(id) {
  if (!confirm('Are you sure you want to delete this code?')) return;

  try {
    await apiRequest(`/codes/${id}`, { method: 'DELETE' });
    showToast('Code deleted successfully');
    loadCodes();
    loadStats();
  } catch (error) {
    showToast('Failed to delete code', 'error');
  }
}

async function generateCodes(count, length) {
  try {
    await apiRequest('/codes/generate', {
      method: 'POST',
      body: JSON.stringify({ count, length }),
    });
    showToast(`Successfully generated ${count} codes`);
    loadCodes();
    loadStats();
    loadLogs();
  } catch (error) {
    showToast('Failed to generate codes', 'error');
  }
}

async function exportCSV() {
  try {
    const data = await apiRequest(`/codes?page=1&limit=10000&status=${currentFilter}&search=${currentSearch}`);
    const codes = data.codes;

    if (codes.length === 0) {
      showToast('No codes to export', 'error');
      return;
    }

    const headers = ['ID', 'Code', 'Status', 'Created At', 'Used At', 'User Name', 'User IP'];
    const rows = codes.map(code => [
      code.id,
      code.code,
      code.is_used ? 'Used' : 'Unused',
      code.created_at,
      code.used_at || '',
      code.user_name || '',
      code.user_ip || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `access-codes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('CSV exported successfully');
  } catch (error) {
    showToast('Failed to export CSV', 'error');
  }
}

function openGenerateModal() {
  document.getElementById('generateModal').classList.remove('hidden');
}

function closeGenerateModal() {
  document.getElementById('generateModal').classList.add('hidden');
  document.getElementById('generateForm').reset();
}

document.getElementById('generateBtn').addEventListener('click', openGenerateModal);

document.getElementById('exportBtn').addEventListener('click', exportCSV);

document.getElementById('generateForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const count = parseInt(document.getElementById('genCount').value);
  const length = parseInt(document.getElementById('genLength').value);

  await generateCodes(count, length);
  closeGenerateModal();
});

document.querySelector('.modal-close').addEventListener('click', closeGenerateModal);
document.querySelector('.modal-cancel').addEventListener('click', closeGenerateModal);

document.getElementById('statusFilter').addEventListener('change', (e) => {
  currentFilter = e.target.value;
  currentPage = 1;
  loadCodes();
});

document.getElementById('searchInput').addEventListener('input', (e) => {
  currentSearch = e.target.value;
  currentPage = 1;
  loadCodes();
});

document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    loadCodes();
  }
});

document.getElementById('nextPage').addEventListener('click', () => {
  currentPage++;
  loadCodes();
});

 document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('adminToken');
  window.location.href = '/login.html';
});

document.getElementById('refreshLogsBtn').addEventListener('click', loadLogs);

window.copyCode = copyCode;
window.resetCode = resetCode;
window.deleteCode = deleteCode;

 document.addEventListener('DOMContentLoaded', () => {
  if (!getToken()) {
    window.location.href = '/login.html';
    return;
  }

  loadStats();
  loadCodes();
  loadLogs();
});

document.getElementById('generateModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('generateModal')) {
    closeGenerateModal();
  }
});
