export * from './constants.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function handleResponseError(res, defaultMessage) {
  let errMsg = defaultMessage;
  try {
    const errorData = await res.json();
    errMsg = errorData.error || errorData.message || errMsg;
  } catch (jsonErr) {
    try {
      const textData = await res.text();
      if (textData) {
        errMsg = textData.substring(0, 150);
      }
    } catch (_) {}
  }
  return new Error(errMsg);
}

export async function getVehicles(page = 1, limit = 25) {
  const res = await fetch(`${API_BASE_URL}/api/vehicles?page=${page}&limit=${limit}`, { credentials: 'include' });
  if (!res.ok) {
    throw await handleResponseError(res, 'Failed to fetch vehicle records');
  }
  const vehicles = await res.json();
  const totalCount = parseInt(res.headers.get('X-Total-Count'), 10) || vehicles.length;
  return { vehicles, totalCount };
}

export async function saveVehicle(updatedVehicle, changedByRole, remarks, originalChassisNumber) {
  const targetChassis = originalChassisNumber || updatedVehicle.chassisNumber;
  const res = await fetch(`${API_BASE_URL}/api/vehicles/${targetChassis}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Role': changedByRole,
      'X-Remarks': remarks
    },
    body: JSON.stringify(updatedVehicle)
  });

  if (!res.ok) {
    throw await handleResponseError(res, 'Failed to save vehicle details');
  }

  const { auditEntries } = await res.json();
  return auditEntries || [];
}

export async function createVehicle(newVehicle, changedByRole) {
  const res = await fetch(`${API_BASE_URL}/api/vehicles`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Role': changedByRole
    },
    body: JSON.stringify(newVehicle)
  });

  if (!res.ok) {
    throw await handleResponseError(res, 'Failed to create new booking');
  }

  return await res.json();
}

export async function deleteVehicle(chassisNumber, changedByRole) {
  const res = await fetch(`${API_BASE_URL}/api/vehicles/${chassisNumber}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'X-Role': changedByRole }
  });

  if (!res.ok) {
    throw await handleResponseError(res, 'Failed to remove booking record');
  }
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE_URL}/api/reset`, { method: 'POST', credentials: 'include' });
  if (!res.ok) {
    throw await handleResponseError(res, 'Failed to run backend seed operation');
  }
  return await getVehicles();
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    throw await handleResponseError(res, 'Login verification failed');
  }
  return await res.json();
}

export async function getSessionUser() {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
  if (!res.ok) return null;
  return await res.json();
}

export async function logoutUser() {
  const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  if (!res.ok) {
    throw await handleResponseError(res, 'Logout failed');
  }
}

export async function getUsers(activeRole, page = 1, limit = 15) {
  const res = await fetch(`${API_BASE_URL}/api/users?page=${page}&limit=${limit}`, {
    credentials: 'include',
    headers: { 'X-Role': activeRole }
  });
  if (!res.ok) {
    throw await handleResponseError(res, 'Failed to retrieve users');
  }
  const users = await res.json();
  const totalCount = parseInt(res.headers.get('X-Total-Count'), 10) || users.length;
  return { users, totalCount };
}

export async function createUser(userData, activeRole) {
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-Role': activeRole },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    throw await handleResponseError(res, 'Failed to create user');
  }
}

export async function updateUser(username, userData, activeRole) {
  const res = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(username)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-Role': activeRole },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    throw await handleResponseError(res, 'Failed to update user');
  }
  return await res.json();
}

export async function deleteUser(username, activeRole) {
  const res = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(username)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'X-Role': activeRole }
  });
  if (!res.ok) {
    throw await handleResponseError(res, 'Failed to remove user');
  }
}

export async function getBackendSettings() {
  const res = await fetch(`${API_BASE_URL}/api/settings`, { credentials: 'include' });
  if (!res.ok) {
    throw await handleResponseError(res, 'Failed to fetch settings from server');
  }
  return await res.json();
}

export async function saveBackendSettings(settingsData) {
  const res = await fetch(`${API_BASE_URL}/api/settings`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settingsData)
  });
  if (!res.ok) {
    throw await handleResponseError(res, 'Failed to save settings on server');
  }
  return await res.json();
}
