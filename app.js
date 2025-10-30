async function recomendar(){
  const presupuesto = parseFloat(document.getElementById('presupuesto').value || '0')
  const tmax = parseFloat(document.getElementById('tmax').value || '0')
  const gustos = document.getElementById('gustos').value.trim().split(/\s+/).filter(Boolean)
  const restricciones = document.getElementById('restricciones').value.trim().split(/\s+/).filter(Boolean)
  // Obtener valores de pesos desde inputs hidden (actualizados por estrellas)
  let wg = parseFloat(document.getElementById('wg').value||'0.35')
  let wp = parseFloat(document.getElementById('wp').value||'0.20')
  let wd = parseFloat(document.getElementById('wd').value||'0.25')
  let wq = parseFloat(document.getElementById('wq').value||'0.15')
  let wa = parseFloat(document.getElementById('wa').value||'0.05')
  
  // Normalizar pesos para que sumen 1.0
  const sum = wg + wp + wd + wq + wa
  if (sum > 0) {
    wg = wg / sum
    wp = wp / sum
    wd = wd / sum
    wq = wq / sum
    wa = wa / sum
  }
  const clima = document.getElementById('clima').value
  const franja = document.getElementById('franja').value
  const grupo = document.getElementById('grupo').value
  const direccion = document.getElementById('direccion').value.trim()
  const latitud = document.getElementById('latitud').value ? parseFloat(document.getElementById('latitud').value) : null
  const longitud = document.getElementById('longitud').value ? parseFloat(document.getElementById('longitud').value) : null

  // Obtener restaurantes del backend
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
  
  // Si hay dirección del usuario, calcular tiempos usando Google Maps API (backend)
  if (direccion) {
    try {
      const modo = "walking" // Por ahora siempre walking, podría cambiar según movilidad
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
      // Continuar con restaurantes sin tiempos calculados
    }
  }

  // Los pesos ya están normalizados arriba

  const usuarioData = {
    id:"u1",
    cocinas_favoritas: gustos,
    picante: "bajo",
    presupuesto,
    tiempo_max: tmax,
    movilidad: "a_pie",
    restricciones,
    diversidad: "media",
    wg,wp,wd,wq,wa
  }
  
  // Agregar dirección si está disponible
  if (direccion) {
    usuarioData.direccion = direccion
  }
  if (latitud !== null && longitud !== null) {
    usuarioData.latitud = latitud
    usuarioData.longitud = longitud
  }

  // Enviar sin restaurantes para que el backend los cargue automáticamente si no se calculó tiempo
  const body = {
    usuario: usuarioData,
    contexto: { clima, dia:"viernes", franja, grupo },
    restaurantes: restaurantes // Si ya tienen tiempo_min calculado, enviarlos; si no, dejar array vacío para que backend los calcule
  }

  try{
    const requestOptions = {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    };
    const r = await fetch('http://localhost:8000/api/recommend', requestOptions)
    const data = await r.json()
    render(data, restaurantes)
  }catch(e){
    console.error('Error en la llamada a la API:', e);
  }
}

function render(recs, allRestaurants){
  const cont = document.getElementById('resultado')
  const top = document.getElementById('top')
  const lista = document.getElementById('lista')
  if(!Array.isArray(recs) || recs.length===0){
    cont.classList.remove('hidden')
    top.innerHTML = '<div class="result"><strong>No hay resultados</strong><p>Revisá presupuesto, restricciones o si los restaurantes están abiertos.</p></div>'
    lista.innerHTML = ''
    return
  }
  cont.classList.remove('hidden')
  const r0_rec = recs[0] // Recomendación principal del backend
  const r0_full = allRestaurants.find(r => r.id === r0_rec.id) || {} // Detalles completos
  // Combinar datos: r0_rec (del recomendador) tiene prioridad, incluye tiempo_min calculado
  const r0 = {...r0_full, ...r0_rec}
  // Asegurar que tiempo_min de la respuesta tenga prioridad si existe
  if (r0_rec.tiempo_min !== undefined) {
    r0.tiempo_min = r0_rec.tiempo_min
  }

  top.innerHTML = `<div class="result">
    <h3>🎯 Nuestra mejor opción: ${r0.nombre}</h3>
    <p><strong>Precio:</strong> $${r0.precio_pp} por persona</p>
    <p><strong>Rating:</strong> ${r0.rating} (${r0.n_resenas} reseñas)</p>
    <p><strong>Cocinas:</strong> ${(Array.isArray(r0.cocinas) && r0.cocinas.length > 0) ? r0.cocinas.join(', ') : 'No especificado'}</p>
    ${(Array.isArray(r0.atributos) && r0.atributos.length > 0) ? `<p><strong>Atributos:</strong> ${r0.atributos.join(', ')}</p>` : ''}
    ${r0.reserva ? `<p><strong>Reserva:</strong> ${r0.reserva}</p>` : ''}
    ${r0.abierto ? `<p><strong>Abierto:</strong> ${r0.abierto}</p>` : ''}
    ${r0.tiempo_min && r0.tiempo_min < 999 ? `<p><strong>Tiempo estimado:</strong> ${r0.tiempo_min} min${r0.distancia_km ? ` (${r0.distancia_km} km)` : ''}</p>` : ''}
    <div><strong>Índice U:</strong> ${r0.U.toFixed(3)}</div>
    <div class="justifications">
      ${(Array.isArray(r0.justifs) && r0.justifs.length > 0) ? r0.justifs.map(j=>`<span class="badge">${escapeHtml(j)}</span>`).join(' ') : 'Sin justificaciones'}
    </div>
  </div>`

  lista.innerHTML = recs.slice(1).map(r_rec=>{
    const r_full = allRestaurants.find(r => r.id === r_rec.id) || {};
    // Combinar datos: r_rec (del recomendador) tiene prioridad, incluye tiempo_min calculado
    const r = {...r_full, ...r_rec};
    // Asegurar que tiempo_min de la respuesta tenga prioridad si existe
    if (r_rec.tiempo_min !== undefined) {
      r.tiempo_min = r_rec.tiempo_min
    }
    return `
    <div class="cardAlt">
      <strong>${r.nombre}</strong> — U=${r.U.toFixed(3)}<br/>
      <span>Precio: $${r.precio_pp} | Rating: ${r.rating} (${r.n_resenas} reseñas)</span><br/>
      <span>Cocinas: ${(Array.isArray(r.cocinas) && r.cocinas.length > 0) ? r.cocinas.join(', ') : 'No especificado'}</span><br/>
      ${(Array.isArray(r.atributos) && r.atributos.length > 0) ? `<span>Atributos: ${r.atributos.join(', ')}</span><br/>` : ''}
      ${r.reserva ? `<span>Reserva: ${r.reserva}</span><br/>` : ''}
      ${r.abierto ? `<span>Abierto: ${r.abierto}</span><br/>` : ''}
      ${r.tiempo_min && r.tiempo_min < 999 ? `<span>Tiempo estimado: ${r.tiempo_min} min${r.distancia_km ? ` (${r.distancia_km} km)` : ''}</span><br/>` : ''}
      <div class="justifications">
        ${(Array.isArray(r.justifs) && r.justifs.length > 0) ? r.justifs.map(j=>`<span class="badge">${escapeHtml(j)}</span>`).join(' ') : 'Sin justificaciones'}
      </div>
    </div>
  `}).join('')
  window.__last = recs
}

function escapeHtml(s){
  return (s||'').toString().replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))
}

// La función calcularDistancia fue eliminada - ahora se calcula en el backend usando Google Maps API

// Funcionalidad de geolocalización
async function obtenerUbicacion() {
  const statusEl = document.getElementById('statusUbicacion')
  const direccionEl = document.getElementById('direccion')
  const latEl = document.getElementById('latitud')
  const lonEl = document.getElementById('longitud')
  
  if (!navigator.geolocation) {
    statusEl.textContent = 'Tu navegador no soporta geolocalización'
    statusEl.style.color = '#d32f2f'
    return
  }
  
  statusEl.textContent = 'Solicitando permisos de ubicación...'
  statusEl.style.color = '#1976d2'
  direccionEl.disabled = true
  
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve, 
        reject, 
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      )
    })
    
    const lat = position.coords.latitude
    const lon = position.coords.longitude
    
    latEl.value = lat
    lonEl.value = lon
    
    statusEl.textContent = 'Obteniendo dirección...'
    
    // Intentar obtener dirección usando geocodificación inversa
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`)
      const data = await response.json()
      
      if (data.address) {
        const parts = []
        if (data.address.road) parts.push(data.address.road)
        if (data.address.house_number) parts.push(data.address.house_number)
        if (parts.length > 0) {
          direccionEl.value = parts.join(' ')
          if (data.address.city || data.address.town) {
            direccionEl.value += `, ${data.address.city || data.address.town}`
          }
        } else {
          direccionEl.value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`
        }
      } else {
        direccionEl.value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`
      }
    } catch (e) {
      // Si falla la geocodificación, usar coordenadas
      direccionEl.value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`
    }
    
    statusEl.textContent = '✓ Ubicación obtenida correctamente'
    statusEl.style.color = '#388e3c'
  } catch (error) {
    let mensajeError = 'Error al obtener ubicación'
    
    if (error.code === 1) {
      mensajeError = 'Permisos de ubicación denegados. Por favor, habilítalos en la configuración del navegador.'
    } else if (error.code === 2) {
      mensajeError = 'No se pudo determinar la ubicación. Verifica tu conexión GPS.'
    } else if (error.code === 3) {
      mensajeError = 'Tiempo de espera agotado al obtener la ubicación.'
    } else if (error.message) {
      mensajeError = 'Error: ' + error.message
    }
    
    statusEl.textContent = mensajeError
    statusEl.style.color = '#d32f2f'
  } finally {
    direccionEl.disabled = false
  }
}

// Inicializar sistema de estrellas para pesos
function inicializarEstrellas() {
  document.querySelectorAll('.stars-container').forEach(container => {
    const weightId = container.getAttribute('data-weight')
    const inputHidden = document.getElementById(weightId)
    if (!inputHidden) return
    
    const stars = Array.from(container.querySelectorAll('.star'))
    
    // Obtener valor inicial y convertir a número de estrellas
    let currentValue = parseFloat(inputHidden.value) || 0
    const numEstrellas = valorANumeroEstrellas(currentValue)
    actualizarEstrellasVisual(stars, numEstrellas)
    
    // Agregar event listeners a cada estrella
    stars.forEach((star, index) => {
      star.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        const numStars = index + 1 // 1-5
        const value = parseFloat(star.getAttribute('data-value'))
        inputHidden.value = value
        actualizarEstrellasVisual(stars, numStars)
      })
    })
  })
}

function valorANumeroEstrellas(value) {
  // Convertir valor decimal (0-1) a número de estrellas (1-5)
  if (value <= 0.2) return 1
  if (value <= 0.4) return 2
  if (value <= 0.6) return 3
  if (value <= 0.8) return 4
  return 5
}

function actualizarEstrellasVisual(stars, numEstrellas) {
  stars.forEach((star, index) => {
    if (index < numEstrellas) {
      star.classList.add('active')
    } else {
      star.classList.remove('active')
    }
  })
}

// Asignar event listeners cuando el DOM esté listo
function inicializarEventListeners() {
  inicializarEstrellas()
  
  const btnUbicacion = document.getElementById('btnUbicacionAuto')
  if (btnUbicacion) {
    btnUbicacion.addEventListener('click', obtenerUbicacion)
  }
  
  const btnRecomendar = document.getElementById('btnRecomendar')
  if (btnRecomendar) {
    btnRecomendar.addEventListener('click', recomendar)
  }
  
  const btnCopiar = document.getElementById('btnCopiar')
  if (btnCopiar) {
    btnCopiar.addEventListener('click', async ()=>{
      const recs = window.__last || []
      const lines = recs.map(r => `- ${r.nombre}: U=${r.U.toFixed(3)} | ${r.justifs.join(' | ')}`)
      try{
        await navigator.clipboard.writeText(lines.join('\n') || 'Sin datos')
        alert('Copiado al portapapeles')
      }catch(e){
        alert('No se pudo copiar: '+e.message)
      }
    })
  }
  
  const btnDescargar = document.getElementById('btnDescargar')
  if (btnDescargar) {
    btnDescargar.addEventListener('click', ()=>{
      const recs = window.__last || []
      const blob = new Blob([JSON.stringify(recs,null,2)], {type:'application/json'})
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'recomendacion.json'
      a.click()
      URL.revokeObjectURL(a.href)
    })
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarEventListeners)
} else {
  inicializarEventListeners()
}
