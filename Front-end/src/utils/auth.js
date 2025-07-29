export function getToken() {
  return localStorage.getItem('token');
}

export function getRole() {
  return localStorage.getItem('role');
}

export function isAuthenticated() {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
} 