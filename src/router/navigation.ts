export function navigateTo(path: string, replace = false): void {
  if (replace) {
    window.history.replaceState({}, '', path)
  } else {
    window.history.pushState({}, '', path)
  }

  window.dispatchEvent(new Event('app:navigate'))
}
