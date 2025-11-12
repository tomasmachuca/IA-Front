// Componente del Recomendador de Restaurantes
import { obtenerUbicacion } from './utils.js'
import { renderResults } from './recommender-logic.js'

// Variables globales
let currentRecommendations = []
let currentUsuarioData = null
let selectedRestaurantForFeedback = null
let selectedRestaurantsRejected = []

export function renderRecommender() {
  const app = document.getElementById('app')
  
  app.innerHTML = `
    <!-- Navbar -->
    <nav class="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-indigo-100 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <button onclick="window.router.navigate('/')" class="flex items-center space-x-2 group">
            <span class="text-3xl animate-float">🍽️</span>
            <span class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              RestoFinder
            </span>
          </button>
          <div class="flex items-center space-x-4">
            <button onclick="window.router.navigate('/')" 
                    class="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
              Volver
            </button>
            <a href="admin.html" 
               class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Admin
            </a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">Busca tu restaurante perfecto</h1>
        <p class="text-gray-600">Completá tus preferencias y te recomendamos el mejor lugar</p>
      </div>

      <!-- Formulario de Preferencias -->
      <div id="preferences-form" class="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 mb-8 border border-indigo-100">
        <h2 class="text-2xl font-bold text-indigo-600 mb-6 flex items-center">
          <span class="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-3"></span>
          Tus preferencias
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Presupuesto -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Presupuesto por persona (ARS)
            </label>
            <input type="number" id="presupuesto" min="0" step="1" 
                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
          </div>

          <!-- Tiempo máximo -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Tiempo máximo hasta el lugar (min)
            </label>
            <input type="number" id="tmax" min="1" step="1" 
                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
          </div>

          <!-- Gustos -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Gustos (separados por espacio)
            </label>
            <input type="text" id="gustos" placeholder="ej: italiana pizza" 
                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
          </div>

          <!-- Restricciones -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Restricciones alimentarias
            </label>
            <input type="text" id="restricciones" placeholder="ej: sin_tacc vegano vegetariano" 
                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
            <p class="text-xs text-gray-500 mt-2">Opciones: sin_tacc, vegano, vegetariano, celiaco, intolerancia_lactosa, kosher, fit</p>
          </div>

          <!-- Movilidad -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              🚗 Movilidad
            </label>
            <select id="movilidad" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
              <option value="a_pie" selected>A pie</option>
              <option value="auto">Auto</option>
              <option value="moto">Moto</option>
              <option value="bicicleta">Bicicleta</option>
              <option value="transporte_publico">Transporte público</option>
            </select>
          </div>

          <!-- Movilidad reducida -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              ♿ Movilidad reducida
            </label>
            <select id="movilidad_reducida" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
              <option value="">No especificar</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>

          <!-- Rating mínimo -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              ⭐ Rating mínimo
            </label>
            <input type="number" id="rating_minimo" min="0" max="5" step="0.1" placeholder="0.0" 
                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
            <p class="text-xs text-gray-500 mt-2">Mínimo de estrellas requerido (0-5)</p>
          </div>

          <!-- Pet friendly -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              🐕 Pet friendly (quiero llevar mi mascota)
            </label>
            <select id="pet_friendly_usuario" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
              <option value="">No aplica</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>

          <!-- Requiere reserva -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              📋 Requiere reserva
            </label>
            <select id="requiere_reserva" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
              <option value="">No especificar</option>
              <option value="si">Sí (solo restaurantes con reserva)</option>
              <option value="no">No (solo restaurantes sin reserva)</option>
            </select>
          </div>

          <!-- Solo abiertos -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              🕐 Solo abiertos ahora
            </label>
            <select id="solo_abiertos" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
              <option value="">No especificar</option>
              <option value="si">Sí (solo restaurantes abiertos)</option>
              <option value="no">No (mostrar todos)</option>
            </select>
          </div>

          <!-- Tiempo espera -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              ⏱ Tiempo máximo de espera (min)
            </label>
            <input type="number" id="tiempo_espera_max" min="0" step="1" placeholder="ej: 20" 
                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
            <p class="text-xs text-gray-500 mt-2">Tiempo máximo de espera aceptable</p>
          </div>

          <!-- Tipo comida -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              🍽️ Tipo de comida
            </label>
            <select id="tipo_comida" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
              <option value="">No especificar</option>
              <option value="comida_rapida">Comida rápida</option>
              <option value="gourmet">Gourmet</option>
              <option value="fine_dining">Fine Dining</option>
              <option value="casual">Casual</option>
              <option value="bar">Bar</option>
              <option value="cafeteria">Cafetería</option>
            </select>
          </div>

          <!-- Estacionamiento -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              🅿️ Estacionamiento propio requerido
            </label>
            <select id="estacionamiento_requerido" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
              <option value="">No especificar</option>
              <option value="si">Sí (solo con estacionamiento)</option>
              <option value="no">No (sin estacionamiento)</option>
            </select>
          </div>

          <!-- Dirección -->
          <div class="md:col-span-2 lg:col-span-3">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              📍 Dirección (opcional)
            </label>
            <div class="flex gap-2">
              <input type="text" id="direccion" placeholder="ej: Av. Corrientes 1234, CABA" 
                     class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
              <button type="button" id="btnUbicacionAuto" 
                      class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all whitespace-nowrap">
                📍 Usar mi ubicación
              </button>
            </div>
            <p id="statusUbicacion" class="text-xs text-gray-500 mt-2 min-h-[1.2em]"></p>
            <input type="hidden" id="latitud">
            <input type="hidden" id="longitud">
          </div>
        </div>
      </div>

      <!-- Contexto -->
      <div class="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 mb-8 border border-indigo-100">
        <h2 class="text-2xl font-bold text-indigo-600 mb-6 flex items-center">
          <span class="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-3"></span>
          Contexto
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Clima</label>
            <select id="clima" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
              <option value="" selected disabled hidden>Selecciona una opción</option>
              <option value="templado">templado</option>
              <option value="lluvia">lluvia</option>
              <option value="frio">frio</option>
              <option value="calor">calor</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Franja</label>
            <select id="franja" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
              <option value="" selected disabled hidden>Selecciona una opción</option>
              <option>cena</option>
              <option>almuerzo</option>
              <option>desayuno</option>
              <option>merienda</option>
              <option>madrugada</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Botón de búsqueda -->
      <div class="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 mb-8 border border-indigo-100">
        <div class="flex flex-col items-center gap-6">
          <button id="btnRecomendar" 
                  class="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-12 py-4 rounded-full text-lg font-bold hover:shadow-2xl hover:scale-105 transition-all">
            Obtener recomendación
          </button>
          
          <label class="flex items-start gap-3 cursor-pointer group p-4 rounded-xl hover:bg-indigo-50 transition-colors">
            <input type="checkbox" id="usar_pesos_optimizados" checked 
                   class="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
            <div>
              <div class="flex items-center gap-2 font-semibold text-gray-800">
                <span class="text-xl">🧠</span>
                <span>Usar pesos optimizados por IA</span>
              </div>
              <p class="text-sm text-gray-600 mt-1">
                Aprende de feedbacks anteriores para mejorar las recomendaciones
              </p>
            </div>
          </label>
        </div>
      </div>

      <!-- Resultados -->
      <div id="resultado" class="hidden"></div>
    </main>
  `

  // Inicializar event listeners
  initializeRecommenderEvents()
}

function initializeRecommenderEvents() {
  // Botón de recomendación
  const btnRecomendar = document.getElementById('btnRecomendar')
  if (btnRecomendar) {
    btnRecomendar.addEventListener('click', handleRecomendar)
  }

  // Botón de ubicación
  const btnUbicacion = document.getElementById('btnUbicacionAuto')
  if (btnUbicacion) {
    btnUbicacion.addEventListener('click', obtenerUbicacion)
  }
}

// Función principal de recomendación
async function handleRecomendar() {
  // Obtener elementos del DOM
  const presupuestoEl = document.getElementById('presupuesto')
  const tmaxEl = document.getElementById('tmax')
  const climaEl = document.getElementById('clima')
  const franjaEl = document.getElementById('franja')
  const gustosEl = document.getElementById('gustos')
  const restriccionesEl = document.getElementById('restricciones')
  const movilidadEl = document.getElementById('movilidad')
  const movilidadReducidaEl = document.getElementById('movilidad_reducida')
  const ratingMinimoEl = document.getElementById('rating_minimo')
  const petFriendlyUsuarioEl = document.getElementById('pet_friendly_usuario')
  const requiereReservaEl = document.getElementById('requiere_reserva')
  const soloAbiertosEl = document.getElementById('solo_abiertos')
  const tiempoEsperaMaxEl = document.getElementById('tiempo_espera_max')
  const tipoComidaEl = document.getElementById('tipo_comida')
  const estacionamientoRequeridoEl = document.getElementById('estacionamiento_requerido')
  const direccionEl = document.getElementById('direccion')
  const latitudEl = document.getElementById('latitud')
  const longitudEl = document.getElementById('longitud')
  const usarPesosOptimizadosEl = document.getElementById('usar_pesos_optimizados')

  // Validar elementos requeridos
  if (!presupuestoEl || !tmaxEl || !climaEl || !franjaEl) {
    alert('Error: El formulario no está completo. Por favor, recargá la página.')
    return
  }

  // Validar campos
  const presupuesto = parseFloat(presupuestoEl.value || '0')
  const tmax = parseFloat(tmaxEl.value || '0')
  const clima = climaEl.value
  const franja = franjaEl.value

  if (!presupuesto || presupuesto <= 0) {
    alert('Por favor, ingresá un presupuesto válido.')
    return
  }

  if (!tmax || tmax <= 0) {
    alert('Por favor, ingresá un tiempo máximo válido.')
    return
  }

  if (!clima) {
    alert('Por favor, seleccioná el clima.')
    return
  }

  if (!franja) {
    alert('Por favor, seleccioná la franja horaria.')
    return
  }

  // Obtener otros campos
  const gustos = gustosEl.value.trim() ? gustosEl.value.trim().split(/\s+/).filter(Boolean) : []
  const restricciones = restriccionesEl.value.trim() ? restriccionesEl.value.trim().split(/\s+/).filter(Boolean) : []
  const movilidad = movilidadEl.value || 'a_pie'
  const movilidadReducida = movilidadReducidaEl.value || null
  const ratingMinimo = ratingMinimoEl.value ? parseFloat(ratingMinimoEl.value) : null
  const petFriendlyUsuario = petFriendlyUsuarioEl.value || null
  const requiereReserva = requiereReservaEl.value || null
  const soloAbiertos = soloAbiertosEl.value || null
  const tiempoEsperaMax = tiempoEsperaMaxEl.value ? parseFloat(tiempoEsperaMaxEl.value) : null
  const tipoComida = tipoComidaEl.value || null
  const estacionamientoRequerido = estacionamientoRequeridoEl.value || null
  const direccion = direccionEl.value.trim()
  const latitud = latitudEl.value ? parseFloat(latitudEl.value) : null
  const longitud = longitudEl.value ? parseFloat(longitudEl.value) : null
  const usar_pesos_optimizados = usarPesosOptimizadosEl ? usarPesosOptimizadosEl.checked : true

  if (petFriendlyUsuario === 'si') {
    restricciones.push('pet_friendly')
  }

  // Pesos por defecto
  const wg = 0.35
  const wp = 0.20
  const wd = 0.25
  const wq = 0.15
  const wa = 0.05

  // Obtener restaurantes
  let restaurantes = []
  try {
    const restaurantesResponse = await fetch('http://localhost:8000/api/restaurantes')
    restaurantes = await restaurantesResponse.json()
  } catch (e) {
    console.error('Error cargando restaurantes:', e)
    alert('Error al cargar restaurantes. Asegurate de que el backend esté corriendo.')
    return
  }

  if (!restaurantes || restaurantes.length === 0) {
    alert('No hay restaurantes disponibles. Usá la página de administración para agregar restaurantes.')
    return
  }

  // Mapear movilidad a modo de Google Maps API
  const modoMap = {
    'a_pie': 'walking',
    'auto': 'driving',
    'moto': 'driving',
    'bicicleta': 'bicycling',
    'transporte_publico': 'transit'
  }

  // Calcular tiempos si hay dirección
  if (direccion) {
    try {
      const modo = modoMap[movilidad] || 'walking'
      const calcularTiemposResponse = await fetch('http://localhost:8000/api/restaurantes/calcular-tiempos', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          usuario_direccion: direccion,
          modo: modo
        })
      })
      if (calcularTiemposResponse.ok) {
        restaurantes = await calcularTiemposResponse.json()
      }
    } catch (e) {
      console.error('Error calculando tiempos:', e)
    }
  }

  // Construir datos del usuario
  const usuarioData = {
    id: "u1",
    cocinas_favoritas: gustos.length > 0 ? gustos : [],
    picante: "bajo",
    presupuesto,
    tiempo_max: tmax,
    movilidad: movilidad,
    restricciones: restricciones.length > 0 ? restricciones : [],
    diversidad: "media",
    wg, wp, wd, wq, wa
  }

  // Agregar campos opcionales
  if (movilidadReducida) usuarioData.movilidad_reducida = movilidadReducida
  if (ratingMinimo !== null && !isNaN(ratingMinimo)) usuarioData.rating_minimo = ratingMinimo
  if (requiereReserva) usuarioData.requiere_reserva = requiereReserva
  if (soloAbiertos) usuarioData.solo_abiertos = soloAbiertos
  if (tiempoEsperaMax !== null && !isNaN(tiempoEsperaMax)) usuarioData.tiempo_espera_max = tiempoEsperaMax
  if (tipoComida) usuarioData.tipo_comida_preferido = tipoComida
  if (estacionamientoRequerido) usuarioData.estacionamiento_requerido = estacionamientoRequerido
  if (direccion) usuarioData.direccion = direccion
  if (latitud !== null && longitud !== null) {
    usuarioData.latitud = latitud
    usuarioData.longitud = longitud
  }

  // Construir request body
  // Si hay dirección y se calcularon tiempos, enviar restaurantes con tiempos
  // Si no, enviar array vacío para que el backend cargue todos del archivo
  const body = {
    usuario: usuarioData,
    contexto: { clima, dia: "viernes", franja },
    restaurantes: restaurantes.length > 0 ? restaurantes : [],  // Enviar array, puede estar vacío
    usar_pesos_optimizados: usar_pesos_optimizados
  }
  
  console.log('Request body preparado:', {
    usuario: usuarioData,
    restaurantesCount: restaurantes.length,
    usar_pesos_optimizados
  })

  // Mostrar loading
  const btnRecomendar = document.getElementById('btnRecomendar')
  const btnTextOriginal = btnRecomendar.textContent
  btnRecomendar.disabled = true
  btnRecomendar.textContent = 'Procesando...'

  try {
    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body)
    }

    console.log('Enviando request:', body)
    const r = await fetch('http://localhost:8000/api/recommend', requestOptions)

    if (!r.ok) {
      const errorText = await r.text()
      console.error('Error del servidor:', r.status, errorText)
      alert(`Error del servidor (${r.status}): ${errorText}`)
      return
    }

    const data = await r.json()
    console.log('Respuesta recibida:', data)
    console.log('Cantidad de recomendaciones:', Array.isArray(data) ? data.length : 0)
    console.log('Datos completos:', JSON.stringify(data, null, 2))

    // Guardar datos globales
    window.__usuarioData = usuarioData
    currentRecommendations = data
    currentUsuarioData = usuarioData

    // Verificar si hay resultados
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('No se recibieron recomendaciones del servidor')
      console.log('Restaurantes enviados:', restaurantes.length)
      console.log('Datos del usuario:', usuarioData)
      console.log('Datos del contexto:', { clima, dia: "viernes", franja })
    }

    // Renderizar resultados
    renderResults(data, restaurantes, usuarioData)

  } catch (e) {
    console.error('Error en la llamada a la API:', e)
    alert('Error al obtener recomendación: ' + e.message)
  } finally {
    btnRecomendar.disabled = false
    btnRecomendar.textContent = btnTextOriginal
  }
}

// Exportar función para uso en el componente
export { handleRecomendar }

