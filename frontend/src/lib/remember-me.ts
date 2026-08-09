const REMEMBER_KEY = 'itam-remember-me';

export function getRememberMe(): boolean {
  return localStorage.getItem(REMEMBER_KEY) !== 'false';
}

export function setRememberMe(remember: boolean): void {
  localStorage.setItem(REMEMBER_KEY, String(remember));
}

export function authStorage(): Storage {
  return getRememberMe() ? localStorage : sessionStorage;
}
