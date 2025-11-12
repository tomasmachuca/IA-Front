// Router simple para manejar la navegación
class Router {
  constructor() {
    this.routes = {}
    this.currentRoute = ''
    this.appContainer = document.getElementById('app')
  }

  registerRoute(path, component) {
    this.routes[path] = component
  }

  navigate(path) {
    if (this.routes[path]) {
      this.currentRoute = path
      history.pushState({ path }, '', path === '/' ? '/' : `#${path}`)
      this.render()
    }
  }

  render() {
    if (this.routes[this.currentRoute]) {
      this.appContainer.innerHTML = ''
      const component = this.routes[this.currentRoute]
      if (typeof component === 'function') {
        component()
      } else if (component && component.render) {
        component.render(this.appContainer)
      }
    }
  }

  init() {
    // Manejar navegación inicial
    window.addEventListener('load', () => {
      const hash = window.location.hash.slice(1) || '/'
      this.currentRoute = hash
      this.render()
    })

    // Manejar cambios en el hash
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1) || '/'
      this.currentRoute = hash
      this.render()
    })

    // Manejar botones de retroceso/avance
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.path) {
        this.currentRoute = e.state.path
        this.render()
      }
    })

    // Renderizar ruta inicial
    const hash = window.location.hash.slice(1) || '/'
    this.currentRoute = hash
    this.render()
  }
}

export default Router



