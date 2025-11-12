// Landing Page Component
export function renderLanding() {
  console.log('Rendering landing page...')
  const app = document.getElementById('app')
  if (!app) {
    console.error('No se encontró el elemento #app')
    return
  }
  
  app.innerHTML = `
    <!-- Navbar -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-indigo-100 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <div class="flex items-center space-x-2 cursor-pointer group" onclick="window.router.navigate('/')">
            <span class="text-3xl animate-float">🍽️</span>
            <span class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              RestoFinder
            </span>
          </div>
          <div class="hidden md:flex items-center space-x-3">
            <a href="#features" class="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-indigo-50">Características</a>
            <a href="#about" class="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-indigo-50">Acerca de</a>
            <a href="#team" class="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 font-bold transition-all px-6 py-2.5 rounded-full hover:shadow-xl hover:scale-110 text-sm">
              👥 Quiénes somos
            </a>
            <button onclick="window.router.navigate('/recommender')" 
                    class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all">
              Empezar
            </button>
          </div>
          <div class="md:hidden flex items-center gap-3">
            <button onclick="window.router.navigate('/recommender')" 
                    class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full font-semibold text-sm">
              Empezar
            </button>
            <button id="mobileMenuToggle" class="p-2 text-gray-700 hover:text-indigo-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
        <!-- Mobile Menu -->
        <div id="mobileMenu" class="hidden md:hidden absolute top-20 left-0 right-0 bg-white border-b border-indigo-100 shadow-lg">
          <div class="px-4 py-4 space-y-3">
            <a href="#features" class="block text-gray-700 hover:text-indigo-600 font-medium py-2 px-3 rounded-lg hover:bg-indigo-50 transition-colors">Características</a>
            <a href="#about" class="block text-gray-700 hover:text-indigo-600 font-medium py-2 px-3 rounded-lg hover:bg-indigo-50 transition-colors">Acerca de</a>
            <a href="#team" class="block bg-indigo-100 text-indigo-700 font-semibold py-2 px-3 rounded-lg hover:bg-indigo-200 transition-colors">
              👥 Quiénes somos
            </a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <!-- Background decorations -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div class="absolute top-0 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style="animation-delay: 2s;"></div>
        <div class="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style="animation-delay: 4s;"></div>
      </div>
      
      <div class="max-w-7xl mx-auto relative z-10">
        <div class="text-center">
          <h1 class="text-5xl md:text-7xl font-extrabold mb-6">
            <span class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Encuentra tu restaurante
            </span>
            <br>
            <span class="text-gray-800">perfecto en segundos</span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Nuestro sistema inteligente utiliza IA y sistemas expertos para recomendarte
            el mejor lugar según tus preferencias, presupuesto y ubicación.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onclick="window.router.navigate('/recommender')" 
                    class="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all transform">
              <span class="flex items-center space-x-2">
                <span>Buscar Restaurante</span>
                <span class="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </button>
            <a href="#features" 
               class="bg-white text-indigo-600 px-8 py-4 rounded-full text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition-all">
              Conocer más
            </a>
          </div>
        </div>

        <!-- Feature Cards -->
        <div class="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border border-indigo-100">
            <div class="text-5xl mb-4">🤖</div>
            <h3 class="text-2xl font-bold text-gray-800 mb-3">IA Avanzada</h3>
            <p class="text-gray-600">Sistemas expertos y redes neuronales trabajando juntos para darte las mejores recomendaciones.</p>
          </div>
          <div class="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border border-purple-100">
            <div class="text-5xl mb-4">⚡</div>
            <h3 class="text-2xl font-bold text-gray-800 mb-3">Resultados Instantáneos</h3>
            <p class="text-gray-600">Obtén recomendaciones personalizadas en cuestión de segundos con nuestro motor de búsqueda.</p>
          </div>
          <div class="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border border-pink-100">
            <div class="text-5xl mb-4">🎯</div>
            <h3 class="text-2xl font-bold text-gray-800 mb-3">Personalizado</h3>
            <p class="text-gray-600">Cada recomendación se adapta a tus gustos, presupuesto y restricciones alimentarias.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-4xl font-bold text-center mb-16 text-gray-800">
          Por qué elegir <span class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">RestoFinder</span>
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center p-6">
            <div class="text-4xl mb-4">⭐</div>
            <h3 class="font-bold text-lg mb-2">Top Rating</h3>
            <p class="text-gray-600 text-sm">Solo los mejores restaurantes</p>
          </div>
          <div class="text-center p-6">
            <div class="text-4xl mb-4">📍</div>
            <h3 class="font-bold text-lg mb-2">Cerca de ti</h3>
            <p class="text-gray-600 text-sm">Basado en tu ubicación</p>
          </div>
          <div class="text-center p-6">
            <div class="text-4xl mb-4">💰</div>
            <h3 class="font-bold text-lg mb-2">Mejor precio</h3>
            <p class="text-gray-600 text-sm">Dentro de tu presupuesto</p>
          </div>
          <div class="text-center p-6">
            <div class="text-4xl mb-4">🔒</div>
            <h3 class="font-bold text-lg mb-2">Seguro</h3>
            <p class="text-gray-600 text-sm">Datos protegidos</p>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-bold mb-8 text-gray-800">Acerca de RestoFinder</h2>
        <p class="text-xl text-gray-600 mb-12 leading-relaxed">
          RestoFinder es un sistema experto basado en CLIPS que utiliza inteligencia artificial
          para recomendarte los mejores restaurantes según tus preferencias. Combina sistemas expertos
          y redes neuronales para ofrecer recomendaciones precisas y personalizadas.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div class="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
            <div class="font-bold text-indigo-600 mb-2">FastAPI & Uvicorn</div>
            <div class="text-sm text-gray-600">Backend robusto</div>
          </div>
          <div class="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
            <div class="font-bold text-purple-600 mb-2">CLIPS Expert System</div>
            <div class="text-sm text-gray-600">Motor de reglas</div>
          </div>
          <div class="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
            <div class="font-bold text-pink-600 mb-2">Neural Networks</div>
            <div class="text-sm text-gray-600">Aprendizaje continuo</div>
          </div>
        </div>
        <button onclick="window.router.navigate('/recommender')" 
                class="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all">
          Probar ahora →
        </button>
      </div>
    </section>

    <!-- Team Section -->
    <section id="team" class="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-4xl font-bold text-center mb-4 text-gray-800">
          <span class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Quiénes somos
          </span>
        </h2>
        <p class="text-center text-gray-600 mb-12 text-lg">
          Este proyecto fue desarrollado por nuestro equipo de desarrollo
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Desarrollador 1 -->
          <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border border-indigo-100">
            <div class="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
              TM
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Tomas Machuca</h3>
            <p class="text-indigo-600 font-semibold mb-4">Desarrollador</p>
            <div class="flex justify-center space-x-4">
              <div class="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
              <div class="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style="animation-delay: 0.2s;"></div>
              <div class="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style="animation-delay: 0.4s;"></div>
            </div>
          </div>
          
          <!-- Desarrollador 2 -->
          <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border border-purple-100">
            <div class="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
              GPG
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Gonzalo Perez Grunau</h3>
            <p class="text-purple-600 font-semibold mb-4">Desarrollador</p>
            <div class="flex justify-center space-x-4">
              <div class="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <div class="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style="animation-delay: 0.2s;"></div>
              <div class="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style="animation-delay: 0.4s;"></div>
            </div>
          </div>
          
          <!-- Desarrollador 3 -->
          <div class="bg-gradient-to-br from-pink-50 to-indigo-50 rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border border-pink-100">
            <div class="w-24 h-24 bg-gradient-to-br from-pink-400 to-indigo-500 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
              EK
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Eden Korniansky</h3>
            <p class="text-pink-600 font-semibold mb-4">Desarrollador</p>
            <div class="flex justify-center space-x-4">
              <div class="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
              <div class="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style="animation-delay: 0.2s;"></div>
              <div class="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style="animation-delay: 0.4s;"></div>
            </div>
          </div>
        </div>
        
        <div class="mt-12 text-center">
          <div class="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-2xl p-8 max-w-3xl mx-auto border-2 border-indigo-200">
            <p class="text-gray-700 text-lg leading-relaxed">
              <span class="font-bold text-indigo-700">Equipo de desarrollo</span> especializado en sistemas expertos,
              inteligencia artificial y desarrollo full-stack. Este proyecto académico combina
              tecnologías avanzadas para crear un sistema de recomendación inteligente.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto text-center">
        <div class="flex items-center justify-center space-x-2 mb-4">
          <span class="text-2xl">🍽️</span>
          <span class="text-xl font-bold">RestoFinder</span>
        </div>
        <p class="text-gray-400 mb-6">Sistema experto para recomendación de restaurantes</p>
        <div class="flex justify-center space-x-6 mb-6 flex-wrap gap-4">
          <a href="/" class="text-gray-400 hover:text-white transition-colors">Inicio</a>
          <a href="#features" class="text-gray-400 hover:text-white transition-colors">Características</a>
          <a href="#about" class="text-gray-400 hover:text-white transition-colors">Acerca de</a>
          <a href="#team" class="text-gray-400 hover:text-white transition-colors">Quiénes somos</a>
          <a href="admin.html" class="text-gray-400 hover:text-white transition-colors">Admin</a>
        </div>
        <p class="text-gray-500 text-sm">&copy; 2024 RestoFinder. Demo académico.</p>
        <p class="text-gray-600 text-xs mt-2">Desarrollado por Tomas Machuca, Gonzalo Perez Grunau y Eden Korniansky</p>
      </div>
    </footer>
  `
  
  // Toggle mobile menu
  const mobileMenuToggle = document.getElementById('mobileMenuToggle')
  const mobileMenu = document.getElementById('mobileMenu')
  
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden')
    })
    
    // Cerrar menú al hacer clic en un enlace
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden')
      })
    })
  }
  
  // Verificar que el botón y la sección se hayan renderizado
  setTimeout(() => {
    const teamButton = document.querySelector('a[href="#team"]')
    const teamSection = document.getElementById('team')
    
    if (teamButton) {
      console.log('✅ Botón "Quiénes somos" encontrado en la navbar:', teamButton.textContent)
      console.log('Botón visible:', window.getComputedStyle(teamButton).display !== 'none')
    } else {
      console.error('❌ No se encontró el botón "Quiénes somos" en la navbar')
      // Forzar renderizado del botón si no existe
      const nav = document.querySelector('nav .hidden.md\\:flex')
      if (nav) {
        const newButton = document.createElement('a')
        newButton.href = '#team'
        newButton.className = 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 font-bold transition-all px-6 py-2.5 rounded-full hover:shadow-xl hover:scale-110 text-sm'
        newButton.textContent = '👥 Quiénes somos'
        nav.insertBefore(newButton, nav.lastElementChild)
        console.log('✅ Botón "Quiénes somos" agregado manualmente')
      }
    }
    
    if (teamSection) {
      console.log('✅ Sección "Quiénes somos" renderizada correctamente')
    } else {
      console.error('❌ No se encontró la sección #team')
    }
  }, 500)
  
  // Smooth scroll para anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute('href'))
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        // Ajustar para el navbar fijo
        window.scrollBy(0, -80)
      }
    })
  })
}

