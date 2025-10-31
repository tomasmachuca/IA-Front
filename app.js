async function recomendar(){
  // Obtener elementos del DOM de forma segura
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
  
  // Validar que los elementos existan
  if (!presupuestoEl || !tmaxEl || !climaEl || !franjaEl) {
    console.error('Error: Faltan elementos requeridos en el formulario')
    alert('Error: El formulario no está completo. Por favor, recargá la página.')
    return
  }
  
  // Validar campos requeridos (usar valores por defecto si los elementos no existen)
  const presupuesto = presupuestoEl ? parseFloat(presupuestoEl.value || '0') : 0
  const tmax = tmaxEl ? parseFloat(tmaxEl.value || '0') : 0
  const clima = climaEl ? climaEl.value : ''
  const franja = franjaEl ? franjaEl.value : ''
  
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
  
  // Obtener gustos y restricciones - permitir valores vacíos
  const gustos = gustosEl && gustosEl.value.trim() 
    ? gustosEl.value.trim().split(/\s+/).filter(Boolean) 
    : []
  const restricciones = restriccionesEl && restriccionesEl.value.trim() 
    ? restriccionesEl.value.trim().split(/\s+/).filter(Boolean) 
    : []
  const movilidad = (movilidadEl ? movilidadEl.value : 'a_pie') || 'a_pie'
  const movilidadReducida = (movilidadReducidaEl ? movilidadReducidaEl.value : null) || null
  const ratingMinimo = (ratingMinimoEl && ratingMinimoEl.value) ? parseFloat(ratingMinimoEl.value) : null
  const petFriendlyUsuario = (petFriendlyUsuarioEl ? petFriendlyUsuarioEl.value : null) || null
  const requiereReserva = (requiereReservaEl ? requiereReservaEl.value : null) || null
  const soloAbiertos = (soloAbiertosEl ? soloAbiertosEl.value : null) || null
  const tiempoEsperaMax = (tiempoEsperaMaxEl && tiempoEsperaMaxEl.value) ? parseFloat(tiempoEsperaMaxEl.value) : null
  const tipoComida = (tipoComidaEl ? tipoComidaEl.value : null) || null
  const estacionamientoRequerido = (estacionamientoRequeridoEl ? estacionamientoRequeridoEl.value : null) || null
  
  // Si el usuario requiere pet friendly, agregarlo a restricciones para el filtro
  if (petFriendlyUsuario === 'si') {
    restricciones.push('pet_friendly')
  }
  
  // Valores por defecto para los pesos (ya que eliminamos la sección de pesos avanzados)
  const wg = 0.35
  const wp = 0.20
  const wd = 0.25
  const wq = 0.15
  const wa = 0.05
  
  const direccionEl = document.getElementById('direccion')
  const latitudEl = document.getElementById('latitud')
  const longitudEl = document.getElementById('longitud')
  const direccion = direccionEl ? direccionEl.value.trim() : ''
  const latitud = (latitudEl && latitudEl.value) ? parseFloat(latitudEl.value) : null
  const longitud = (longitudEl && longitudEl.value) ? parseFloat(longitudEl.value) : null

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
  
  // Mapear movilidad a modo de Google Maps API
  const modoMap = {
    'a_pie': 'walking',
    'auto': 'driving',
    'moto': 'driving',
    'bicicleta': 'bicycling',
    'transporte_publico': 'transit'
  }
  
  // Si hay dirección del usuario, calcular tiempos usando Google Maps API (backend)
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
      // Continuar con restaurantes sin tiempos calculados
    }
  }

  // Los pesos ya están normalizados arriba

  const usuarioData = {
    id:"u1",
    cocinas_favoritas: gustos.length > 0 ? gustos : [],
    picante: "bajo",
    presupuesto,
    tiempo_max: tmax,
    movilidad: movilidad,
    restricciones: restricciones.length > 0 ? restricciones : [],
    diversidad: "media",
    wg,wp,wd,wq,wa
  }
  
  // Agregar campos opcionales si están disponibles
  if (movilidadReducida) {
    usuarioData.movilidad_reducida = movilidadReducida
  }
  if (ratingMinimo !== null && !isNaN(ratingMinimo)) {
    usuarioData.rating_minimo = ratingMinimo
  }
  if (requiereReserva) {
    usuarioData.requiere_reserva = requiereReserva
  }
  if (soloAbiertos) {
    usuarioData.solo_abiertos = soloAbiertos
  }
  if (tiempoEsperaMax !== null && !isNaN(tiempoEsperaMax)) {
    usuarioData.tiempo_espera_max = tiempoEsperaMax
  }
  if (tipoComida) {
    usuarioData.tipo_comida_preferido = tipoComida
  }
  if (estacionamientoRequerido) {
    usuarioData.estacionamiento_requerido = estacionamientoRequerido
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
    contexto: { clima, dia:"viernes", franja },
    restaurantes: restaurantes // Si ya tienen tiempo_min calculado, enviarlos; si no, dejar array vacío para que backend los calcule
  }

  // Mostrar indicador de carga
  const btnRecomendar = document.getElementById('btnRecomendar')
  const btnTextOriginal = btnRecomendar ? btnRecomendar.textContent : ''
  if (btnRecomendar) {
    btnRecomendar.disabled = true
    btnRecomendar.textContent = 'Procesando...'
  }

  try{
    const requestOptions = {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    };
    console.log('Enviando request:', body);
    const r = await fetch('http://localhost:8000/api/recommend', requestOptions)
    
    if (!r.ok) {
      const errorText = await r.text();
      console.error('Error del servidor:', r.status, errorText);
      alert(`Error del servidor (${r.status}): ${errorText}`);
      return;
    }
    
    const data = await r.json()
    console.log('Respuesta recibida:', data);
    render(data, restaurantes)
  }catch(e){
    console.error('Error en la llamada a la API:', e);
    alert('Error al obtener recomendación: ' + e.message);
  }finally{
    // Restaurar botón
    if (btnRecomendar) {
      btnRecomendar.disabled = false
      btnRecomendar.textContent = btnTextOriginal
    }
  }
}

function render(recs, allRestaurants){
  const cont = document.getElementById('resultado')
  const top = document.getElementById('top')
  const lista = document.getElementById('lista')
  if(!Array.isArray(recs) || recs.length===0){
    cont.classList.remove('hidden')
    top.innerHTML = '<div class="result"><strong>No hay resultados</strong><p>Revisá presupuesto, restricciones o si los restaurantes están abiertos. Ningún restaurante cumplió con todos los criterios requeridos.</p></div>'
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
    ${r0.reserva ? `<p><strong>📋 Reserva:</strong> ${r0.reserva === 'si' ? 'Sí, se requiere' : 'No'}</p>` : ''}
    ${r0.abierto ? `<p><strong>🕐 Abierto ahora:</strong> ${r0.abierto === 'si' ? '✅ Sí' : '❌ No'}</p>` : ''}
    ${r0.direccion ? `<p><strong>📍 Dirección:</strong> ${r0.direccion}</p>` : ''}
    ${r0.tiempo_min && r0.tiempo_min < 999 ? `<p><strong>🚗 Tiempo estimado de viaje:</strong> ${Math.round(r0.tiempo_min)} min${r0.distancia_km ? ` (${r0.distancia_km} km)` : ''}</p>` : ''}
    ${r0.tiempo_espera ? `<p><strong>Tiempo de espera promedio:</strong> ${r0.tiempo_espera} min</p>` : ''}
    ${r0.tipo_comida ? `<p><strong>Tipo de comida:</strong> ${r0.tipo_comida}</p>` : ''}
    ${r0.horario_apertura && r0.horario_cierre ? `<p><strong>Horarios:</strong> ${r0.horario_apertura} - ${r0.horario_cierre}</p>` : ''}
    ${r0.pet_friendly ? `<p><strong>🐕 Pet friendly:</strong> ${r0.pet_friendly === 'si' ? 'Sí' : 'No'}</p>` : ''}
    ${r0.estacionamiento_propio ? `<p><strong>🅿️ Estacionamiento propio:</strong> ${r0.estacionamiento_propio === 'si' ? 'Sí' : 'No'}</p>` : ''}
    <div><strong>Índice U:</strong> ${r0.U.toFixed(3)}</div>
    <div class="justifications" style="margin-top: 16px; padding: 12px; background: #f5f5f5; border-radius: 8px;">
      <strong style="display: block; margin-bottom: 8px;">💡 ¿Por qué elegimos este restaurante?</strong>
      ${(Array.isArray(r0.justifs) && r0.justifs.length > 0) 
        ? `<ul style="margin: 0; padding-left: 20px;">
            ${r0.justifs.map(j => {
              // Mejorar las justificaciones para que sean más comprensibles
              let texto = escapeHtml(j)
              if (texto.includes('afinidad=') || texto.includes('wg') || texto.toLowerCase().includes('italiana') || texto.toLowerCase().includes('pizza')) {
                return `<li>✅ Coincide con tus gustos culinarios</li>`
              }
              if (texto.includes('precio=') || texto.includes('wp')) {
                return `<li>💰 Precio adecuado para tu presupuesto</li>`
              }
              if (texto.includes('cercania=') || texto.includes('wd')) {
                return `<li>📍 Ubicación cercana a tu destino</li>`
              }
              if (texto.includes('calidad=') || texto.includes('wq') || texto.includes('★')) {
                return `<li>⭐ Buena calificación y reseñas</li>`
              }
              if (texto.includes('disp=') || texto.includes('wa')) {
                return `<li>⏱️ Disponible para tu franja horaria</li>`
              }
              if (texto.includes('penalizacion_presupuesto')) {
                const valor = texto.match(/penalizacion_presupuesto=([\d.]+)/)
                return `<li>⚠️ Supera el presupuesto (penalización aplicada)</li>`
              }
              if (texto.includes('penalizacion_estacionamiento')) {
                return `<li>⚠️ No tiene estacionamiento propio (penalización aplicada)</li>`
              }
              if (texto.includes('penalizacion_reserva')) {
                return `<li>⚠️ No requiere reserva (penalización aplicada)</li>`
              }
              return `<li>${texto}</li>`
            }).join('')}
          </ul>`
        : (r0.U > 0 
            ? '<p style="margin: 0; color: #666;">Este restaurante cumple con tus criterios de búsqueda, aunque algunos aspectos pueden haber sido penalizados (presupuesto, estacionamiento, etc.).</p>'
            : '<p style="margin: 0; color: #666;">Este restaurante cumple con los criterios obligatorios, pero tiene penalizaciones significativas que afectan su puntuación.</p>')}
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
      ${r.reserva ? `<span>📋 Reserva: ${r.reserva === 'si' ? 'Sí, se requiere' : 'No'}</span><br/>` : ''}
      ${r.abierto ? `<span>🕐 Abierto ahora: ${r.abierto === 'si' ? '✅ Sí' : '❌ No'}</span><br/>` : ''}
      ${r.direccion ? `<span>📍 Dirección: ${r.direccion}</span><br/>` : ''}
      ${r.tiempo_min && r.tiempo_min < 999 ? `<span>Tiempo estimado de viaje: ${Math.round(r.tiempo_min)} min${r.distancia_km ? ` (${r.distancia_km} km)` : ''}</span><br/>` : ''}
      ${r.tiempo_espera ? `<span>Tiempo de espera promedio: ${r.tiempo_espera} min</span><br/>` : ''}
      ${r.tipo_comida ? `<span>Tipo de comida: ${r.tipo_comida}</span><br/>` : ''}
      ${r.horario_apertura && r.horario_cierre ? `<span>Horarios: ${r.horario_apertura} - ${r.horario_cierre}</span><br/>` : ''}
      ${r.pet_friendly ? `<span>🐕 Pet friendly: ${r.pet_friendly === 'si' ? 'Sí' : 'No'}</span><br/>` : ''}
      ${r.estacionamiento_propio ? `<span>🅿️ Estacionamiento propio: ${r.estacionamiento_propio === 'si' ? 'Sí' : 'No'}</span><br/>` : ''}
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
  
  if (!statusEl || !direccionEl || !latEl || !lonEl) {
    console.error('Elementos del formulario de ubicación no encontrados')
    return
  }
  
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

// Asignar event listeners cuando el DOM esté listo
function inicializarEventListeners() {
  
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
