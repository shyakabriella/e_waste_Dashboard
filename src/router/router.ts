import { getAuthUser, isAuthenticated, logout } from '../auth/auth.service'
import { renderAccessDeniedPage } from '../pages/errors/AccessDeniedPage'
import { renderNotFoundPage } from '../pages/errors/NotFoundPage'
import { navigateTo } from './navigation'
import { routes } from './routes'

function getAppElement(): HTMLDivElement {
  const app = document.querySelector<HTMLDivElement>('#app')

  if (!app) {
    throw new Error('App element not found.')
  }

  return app
}

export function initRouter(): void {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null

    if (!target) {
      return
    }

    const link = target.closest<HTMLAnchorElement>('[data-link]')

    if (!link) {
      return
    }

    event.preventDefault()

    const href = link.getAttribute('href') || '/dashboard'
    navigateTo(href)
  })

  window.addEventListener('popstate', renderRoute)
  window.addEventListener('app:navigate', renderRoute)

  renderRoute()
}

function renderRoute(): void {
  const app = getAppElement()
  const path = window.location.pathname

  if (path === '/') {
    navigateTo(isAuthenticated() ? '/dashboard' : '/login', true)
    return
  }

  const route = routes.find((item) => item.path === path)

  if (!route) {
    document.title = '404 | E-Waste Dashboard'
    app.innerHTML = renderNotFoundPage()
    return
  }

  if (route.guest && isAuthenticated()) {
    navigateTo('/dashboard', true)
    return
  }

  if (route.auth && !isAuthenticated()) {
    navigateTo('/login', true)
    return
  }

  if (route.roles?.length) {
    const user = getAuthUser()

    if (!user || !route.roles.includes(user.role)) {
      document.title = 'Access Denied | E-Waste Dashboard'
      app.innerHTML = renderAccessDeniedPage()
      bindLogout()
      return
    }
  }

  document.title = `${route.title} | E-Waste Dashboard`
  app.innerHTML = route.render()

  bindLogout()

  if (route.afterRender) {
    route.afterRender()
  }
}

function bindLogout(): void {
  const logoutButton = document.querySelector<HTMLButtonElement>('#logoutButton')

  if (!logoutButton) {
    return
  }

  logoutButton.addEventListener('click', () => {
    logout()
    navigateTo('/login', true)
  })
}
