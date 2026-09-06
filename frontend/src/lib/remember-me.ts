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

/** The storage NOT currently selected by the remember-me flag — used to clear stale copies of
    auth state left behind after switching, so a "don't remember me" choice doesn't leave tokens
    sitting in localStorage from an earlier session. */
export function otherAuthStorage(): Storage {
  return getRememberMe() ? sessionStorage : localStorage;
}
