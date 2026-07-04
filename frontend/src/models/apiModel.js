export * from './constants.js';

export async function getVehicles() {
  const res = await fetch('/api/vehicles', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch vehicle records');
  return await res.json();
}

export async function saveVehicle(updatedVehicle, changedByRole, remarks) {
  const res = await fetch(`/api/vehicles/${updatedVehicle.chassisNumber}`, {
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
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to save vehicle details');
  }

  const { auditEntries } = await res.json();
  return auditEntries || [];
}

export async function createVehicle(newVehicle, changedByRole) {
  const res = await fetch('/api/vehicles', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Role': changedByRole
    },
    body: JSON.stringify(newVehicle)
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to create new booking');
  }

  return await res.json();
}

export async function deleteVehicle(chassisNumber, changedByRole) {
  const res = await fetch(`/api/vehicles/${chassisNumber}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'X-Role': changedByRole }
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to remove booking record');
  }
}

export async function resetDatabase() {
  const res = await fetch('/api/reset', { method: 'POST', credentials: 'include' });
  if (!res.ok) throw new Error('Failed to run backend seed operation');
  return await getVehicles();
}

export async function loginUser(username, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Login verification failed');
  }
  return await res.json();
}

export async function getSessionUser() {
  const res = await fetch('/api/auth/me', { credentials: 'include' });
  if (!res.ok) return null;
  return await res.json();
}

export async function logoutUser() {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Logout failed');
}

export async function getUsers(activeRole) {
  const res = await fetch('/api/users', {
    credentials: 'include',
    headers: { 'X-Role': activeRole }
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to retrieve users');
  }
  return await res.json();
}

export async function createUser(userData, activeRole) {
  const res = await fetch('/api/users', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-Role': activeRole },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to create user');
  }
}

export async function updateUser(username, userData, activeRole) {
  const res = await fetch(`/api/users/${username}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-Role': activeRole },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to update user');
  }
}

export async function deleteUser(username, activeRole) {
  const res = await fetch(`/api/users/${username}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'X-Role': activeRole }
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to remove user');
  }
}

export async function getBackendSettings() {
  const res = await fetch('/api/settings', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch settings from server');
  return await res.json();
}

export async function saveBackendSettings(settingsData) {
  const res = await fetch('/api/settings', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settingsData)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to save settings on server');
  }
  return await res.json();
}
