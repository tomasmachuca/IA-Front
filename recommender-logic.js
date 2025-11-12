// Lógica del recomendador: renderizado de resultados y feedback
import { escapeHtml } from './utils.js'

// Variables globales para feedback
let selectedRestaurantForFeedback = null
let selectedRestaurantsRejected = []

export function generarMensajesJustificacion(restaurante, usuarioData, justifs) {
  const mensajes = []
  const tienePenalizacionPrecio = justifs.some(j => j.includes('penalizacion_presupuesto'))
  
  // 1. Verificar gustos culinarios
  if (usuarioData.cocinas_favoritas && usuarioData.cocinas_favoritas.length > 0 && restaurante.cocinas) {
    const cocinasComunes = restaurante.cocinas.filter(c => 
      usuarioData.cocinas_favoritas.includes(c)
    )
    if (cocinasComunes.length > 0) {
      mensajes.push(`✅ Ofrece ${cocinasComunes.join(', ')}, que coinciden con tus gustos`)
    }
  }
  
  // 2. Verificar precio
  if (usuarioData.presupuesto && restaurante.precio_pp !== undefined) {
    const precioRest = restaurante.precio_pp
    const presupuesto = usuarioData.presupuesto
    if (precioRest <= presupuesto) {
      const porcentaje = ((presupuesto - precioRest) / presupuesto * 100).toFixed(0)
      if (parseFloat(porcentaje) > 10) {
        mensajes.push(`💰 Precio de $${precioRest.toLocaleString('es-AR')}, dentro de tu presupuesto de $${presupuesto.toLocaleString('es-AR')} (te sobra ~${porcentaje}%)`)
      } else {
        mensajes.push(`💰 Precio de $${precioRest.toLocaleString('es-AR')}, dentro de tu presupuesto de $${presupuesto.toLocaleString('es-AR')}`)
      }
    } else if (tienePenalizacionPrecio) {
      const exceso = ((precioRest - presupuesto) / presupuesto * 100).toFixed(0)
      mensajes.push(`⚠️ Precio de $${precioRest.toLocaleString('es-AR')}, supera tu presupuesto de $${presupuesto.toLocaleString('es-AR')} en ~${exceso}%`)
    }
  }
  
  // 3. Verificar cercanía
  if (restaurante.tiempo_min && restaurante.tiempo_min < 999 && usuarioData.tiempo_max) {
    const tiempo = Math.round(restaurante.tiempo_min)
    const tiempoMax = usuarioData.tiempo_max
    if (tiempo <= tiempoMax) {
      mensajes.push(`📍 ${tiempo} min de viaje, dentro de tu límite de ${tiempoMax} min`)
    } else {
      mensajes.push(`📍 ${tiempo} min de viaje (supera tu límite de ${tiempoMax} min)`)
    }
  }
  
  // 4. Verificar calidad
  if (restaurante.rating !== undefined) {
    const rating = restaurante.rating
    const nResenas = restaurante.n_resenas || 0
    if (usuarioData.rating_minimo && rating >= usuarioData.rating_minimo) {
      mensajes.push(`⭐ Rating de ${rating.toFixed(1)}${nResenas > 0 ? ` (${nResenas} reseñas)` : ''}, supera tu mínimo de ${usuarioData.rating_minimo}`)
    } else {
      mensajes.push(`⭐ Rating de ${rating.toFixed(1)}${nResenas > 0 ? ` con ${nResenas} reseñas` : ''}`)
    }
  }
  
  // 5. Verificar disponibilidad
  const soloAbiertos = usuarioData.solo_abiertos
  if (restaurante.abierto === 'si') {
    mensajes.push('⏱️ Está abierto ahora y disponible para tu franja horaria')
  } else if (restaurante.abierto === 'no') {
    if (soloAbiertos === 'no' || !soloAbiertos) {
      mensajes.push('⚠️ Actualmente está cerrado (se muestra porque elegiste ver todos los restaurantes)')
    } else {
      mensajes.push('⚠️ Actualmente está cerrado, pero cumple con otros criterios importantes')
    }
  }
  
  // 6. Verificar reserva
  if (usuarioData.requiere_reserva === 'si' && restaurante.reserva === 'si') {
    mensajes.push('📋 Requiere reserva (como preferiste)')
  } else if (usuarioData.requiere_reserva === 'no' && restaurante.reserva === 'no') {
    mensajes.push('📋 No requiere reserva (como preferiste)')
  }
  
  // 7. Verificar estacionamiento
  if (usuarioData.estacionamiento_requerido === 'si' && restaurante.estacionamiento_propio === 'si') {
    mensajes.push('🅿️ Tiene estacionamiento propio (como requeriste)')
  } else if (justifs.some(j => j.includes('penalizacion_estacionamiento'))) {
    mensajes.push('⚠️ No tiene estacionamiento propio')
  }
  
  // 8. Verificar pet friendly
  if (usuarioData.restricciones && usuarioData.restricciones.includes('pet_friendly') && restaurante.pet_friendly === 'si') {
    mensajes.push('🐕 Acepta mascotas (pet friendly)')
  }
  
  // 9. Verificar tipo de comida
  if (usuarioData.tipo_comida_preferido && restaurante.tipo_comida === usuarioData.tipo_comida_preferido) {
    const tipoLabels = {
      'comida_rapida': 'comida rápida',
      'gourmet': 'gourmet',
      'fine_dining': 'fine dining',
      'casual': 'casual',
      'bar': 'bar',
      'cafeteria': 'cafetería'
    }
    mensajes.push(`🍽️ Es ${tipoLabels[usuarioData.tipo_comida_preferido] || usuarioData.tipo_comida_preferido} (como preferiste)`)
  }
  
  // 10. Verificar tiempo de espera
  if (usuarioData.tiempo_espera_max && restaurante.tiempo_espera) {
    if (restaurante.tiempo_espera <= usuarioData.tiempo_espera_max) {
      mensajes.push(`⏱️ Tiempo de espera de ~${restaurante.tiempo_espera} min, dentro de tu límite de ${usuarioData.tiempo_espera_max} min`)
    } else {
      mensajes.push(`⚠️ Tiempo de espera de ~${restaurante.tiempo_espera} min, supera tu límite de ${usuarioData.tiempo_espera_max} min`)
    }
  }
  
  if (mensajes.length === 0 && restaurante.U > 0) {
    mensajes.push('✅ Cumple con tus criterios principales de búsqueda')
  }
  
  return mensajes
}

export function renderResults(recs, allRestaurants, usuarioData) {
  const resultadoEl = document.getElementById('resultado')
  
  console.log('renderResults llamado con:', {
    recsCount: Array.isArray(recs) ? recs.length : 'NO ES ARRAY',
    allRestaurantsCount: Array.isArray(allRestaurants) ? allRestaurants.length : 'NO ES ARRAY',
    recsType: typeof recs,
    recs: recs
  })
  
  if (!Array.isArray(recs)) {
    console.error('ERROR: recs no es un array:', recs)
    resultadoEl.className = 'bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-red-100'
    resultadoEl.innerHTML = `
      <div class="text-center">
        <div class="text-6xl mb-4">⚠️</div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">Error en la respuesta</h3>
        <p class="text-gray-600">El servidor devolvió un formato inesperado. Por favor, revisá la consola para más detalles.</p>
        <p class="text-sm text-gray-500 mt-2">Respuesta recibida: ${typeof recs}</p>
      </div>
    `
    resultadoEl.classList.remove('hidden')
    return
  }
  
  if (recs.length === 0) {
    console.warn('Array de recomendaciones está vacío')
    resultadoEl.className = 'bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-orange-100'
    resultadoEl.innerHTML = `
      <div class="text-center">
        <div class="text-6xl mb-4">😕</div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">No hay resultados</h3>
        <p class="text-gray-600 mb-4">Ningún restaurante cumplió con todos los criterios de búsqueda.</p>
        <div class="bg-orange-50 rounded-xl p-4 text-left max-w-md mx-auto">
          <p class="text-sm font-semibold text-orange-800 mb-2">💡 Sugerencias:</p>
          <ul class="text-sm text-orange-700 space-y-1 list-disc list-inside">
            <li>Revisá tu presupuesto - puede ser muy bajo</li>
            <li>Verificá las restricciones alimentarias</li>
            <li>Si seleccionaste "Solo abiertos ahora", puede que todos estén cerrados</li>
            <li>Considerá aumentar el tiempo máximo de viaje</li>
            <li>Revisá el rating mínimo requerido</li>
          </ul>
        </div>
      </div>
    `
    resultadoEl.classList.remove('hidden')
    return
  }
  
  resultadoEl.classList.remove('hidden')
  
  const r0_rec = recs[0]
  const r0_full = allRestaurants.find(r => r.id === r0_rec.id) || {}
  const r0 = {...r0_full, ...r0_rec}
  if (r0_rec.tiempo_min !== undefined) {
    r0.tiempo_min = r0_rec.tiempo_min
  }

  const mensajes = generarMensajesJustificacion(r0, usuarioData, r0.justifs || [])
  
  resultadoEl.innerHTML = `
    <div class="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 mb-8 border border-indigo-100">
      <h2 class="text-3xl font-bold text-indigo-600 mb-6 flex items-center">
        <span class="w-1 h-10 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full mr-3"></span>
        🎯 Nuestra mejor opción: ${escapeHtml(r0.nombre)}
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
          <div class="text-sm text-gray-600 mb-1">Precio por persona</div>
          <div class="text-2xl font-bold text-indigo-600">$${r0.precio_pp?.toLocaleString('es-AR') || 'N/A'}</div>
        </div>
        <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6">
          <div class="text-sm text-gray-600 mb-1">Rating</div>
          <div class="text-2xl font-bold text-orange-600">
            ${r0.rating?.toFixed(1) || 'N/A'} ${r0.n_resenas ? `(${r0.n_resenas} reseñas)` : ''}
          </div>
        </div>
      </div>
      
      <div class="space-y-4 mb-6">
        ${r0.cocinas && r0.cocinas.length > 0 ? `
          <div>
            <span class="font-semibold text-gray-700">Cocinas:</span>
            <span class="ml-2 text-gray-600">${r0.cocinas.join(', ')}</span>
          </div>
        ` : ''}
        ${r0.direccion ? `
          <div>
            <span class="font-semibold text-gray-700">📍 Dirección:</span>
            <span class="ml-2 text-gray-600">${escapeHtml(r0.direccion)}</span>
          </div>
        ` : ''}
        ${r0.tiempo_min && r0.tiempo_min < 999 ? `
          <div>
            <span class="font-semibold text-gray-700">🚗 Tiempo estimado:</span>
            <span class="ml-2 text-gray-600">${Math.round(r0.tiempo_min)} min${r0.distancia_km ? ` (${r0.distancia_km} km)` : ''}</span>
          </div>
        ` : ''}
        ${r0.abierto ? `
          <div>
            <span class="font-semibold text-gray-700">🕐 Estado:</span>
            <span class="ml-2 ${r0.abierto === 'si' ? 'text-green-600' : 'text-red-600'} font-semibold">
              ${r0.abierto === 'si' ? '✅ Abierto ahora' : '❌ Cerrado'}
            </span>
          </div>
        ` : ''}
        <div>
          <span class="font-semibold text-gray-700">Índice U:</span>
          <span class="ml-2 text-indigo-600 font-bold text-lg">${r0.U?.toFixed(3) || 'N/A'}</span>
        </div>
      </div>
      
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
        <h4 class="font-bold text-indigo-700 mb-4 text-lg">💡 ¿Por qué elegimos este restaurante?</h4>
        <ul class="space-y-2 list-disc list-inside text-gray-700">
          ${mensajes.map(m => `<li>${escapeHtml(m)}</li>`).join('')}
        </ul>
      </div>
    </div>
    
    <div class="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 mb-8 border border-indigo-100">
      <h3 class="text-2xl font-bold text-gray-800 mb-6">Alternativas</h3>
      <div id="lista-alternativas" class="space-y-4">
        ${recs.slice(1).map(r_rec => {
          const r_full = allRestaurants.find(r => r.id === r_rec.id) || {}
          const r = {...r_full, ...r_rec}
          if (r_rec.tiempo_min !== undefined) r.tiempo_min = r_rec.tiempo_min
          
          return `
            <div class="border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-indigo-400 hover:shadow-lg transition-all bg-gradient-to-br from-gray-50 to-white">
              <div class="flex justify-between items-start mb-3">
                <h4 class="text-xl font-bold text-gray-800">${escapeHtml(r.nombre)}</h4>
                <span class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">U=${r.U?.toFixed(3) || '0'}</span>
              </div>
              <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div><span class="font-semibold">Precio:</span> $${r.precio_pp?.toLocaleString('es-AR') || 'N/A'}</div>
                <div><span class="font-semibold">Rating:</span> ${r.rating?.toFixed(1) || 'N/A'} (${r.n_resenas || 0} reseñas)</div>
                ${r.tiempo_min && r.tiempo_min < 999 ? `<div><span class="font-semibold">Tiempo:</span> ${Math.round(r.tiempo_min)} min</div>` : ''}
                ${r.abierto ? `<div><span class="font-semibold">Estado:</span> ${r.abierto === 'si' ? '✅ Abierto' : '❌ Cerrado'}</div>` : ''}
              </div>
              ${r.cocinas && r.cocinas.length > 0 ? `
                <div class="mt-3">
                  <span class="text-xs font-semibold text-gray-500">Cocinas:</span>
                  <span class="text-xs text-gray-600 ml-2">${r.cocinas.join(', ')}</span>
                </div>
              ` : ''}
            </div>
          `
        }).join('')}
      </div>
    </div>
    
    <div class="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 mb-8 border border-indigo-100">
      <div class="flex flex-wrap gap-4 mb-6">
        <button id="btnCopiar" class="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all">
          📋 Copiar explicación
        </button>
        <button id="btnDescargar" class="bg-indigo-100 text-indigo-700 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-200 transition-all">
          💾 Descargar JSON
        </button>
      </div>
      
      <div id="feedback-section" class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-indigo-300">
        <h3 class="text-xl font-bold text-indigo-700 mb-3">💬 ¿Cuál te gustó más?</h3>
        <p class="text-gray-600 mb-4">Seleccioná la recomendación que más te interesa para mejorar futuras sugerencias:</p>
        <div id="feedback-buttons" class="flex flex-wrap gap-3 mb-4"></div>
        <div id="feedback-reasons" class="hidden bg-white rounded-xl p-6 mt-4">
          <p class="font-bold text-indigo-700 mb-4">¿Por qué elegiste esta opción? (podés seleccionar varias):</p>
          <div id="reasons-checklist" class="grid grid-cols-1 md:grid-cols-2 gap-3"></div>
          <div class="flex gap-3 mt-6">
            <button id="btnEnviarFeedback" class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all">
              Enviar feedback
            </button>
            <button id="btnCancelarFeedback" class="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all">
              Cancelar
            </button>
          </div>
        </div>
        <div id="feedback-status" class="mt-4 text-sm"></div>
      </div>
    </div>
  `
  
  // Configurar botones de acciones
  setupActionButtons(recs)
  
  // Configurar sistema de feedback
  setupFeedbackSystem(recs.slice(0, 3), allRestaurants, usuarioData)
  
  // Scroll suave a los resultados
  resultadoEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function setupActionButtons(recs) {
  window.__last = recs
  
  // Botón copiar
  const btnCopiar = document.getElementById('btnCopiar')
  if (btnCopiar) {
    btnCopiar.addEventListener('click', async () => {
      const lines = recs.map(r => `- ${r.nombre}: U=${r.U.toFixed(3)} | ${(r.justifs || []).join(' | ')}`)
      try {
        await navigator.clipboard.writeText(lines.join('\n') || 'Sin datos')
        btnCopiar.textContent = '✓ Copiado!'
        setTimeout(() => {
          btnCopiar.textContent = '📋 Copiar explicación'
        }, 2000)
      } catch (e) {
        alert('No se pudo copiar: ' + e.message)
      }
    })
  }
  
  // Botón descargar
  const btnDescargar = document.getElementById('btnDescargar')
  if (btnDescargar) {
    btnDescargar.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(recs, null, 2)], {type: 'application/json'})
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'recomendacion.json'
      a.click()
      URL.revokeObjectURL(a.href)
    })
  }
}

export function setupFeedbackSystem(recs, allRestaurants, usuarioData) {
  const feedbackButtonsEl = document.getElementById('feedback-buttons')
  const feedbackStatusEl = document.getElementById('feedback-status')
  const feedbackReasonsEl = document.getElementById('feedback-reasons')
  
  if (!feedbackButtonsEl || !feedbackStatusEl || !feedbackReasonsEl) return
  
  // Limpiar
  feedbackButtonsEl.innerHTML = ''
  feedbackStatusEl.innerHTML = ''
  feedbackReasonsEl.classList.add('hidden')
  
  if (recs.length === 0) return
  
  // Crear botones de restaurantes
  recs.forEach((r_rec, index) => {
    const r_full = allRestaurants.find(r => r.id === r_rec.id) || {}
    const r = {...r_full, ...r_rec}
    
    const button = document.createElement('button')
    button.className = 'bg-indigo-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-all text-left'
    button.innerHTML = `
      <div class="font-bold">${r.nombre || 'Restaurante ' + (index + 1)}</div>
      <div class="text-sm opacity-90">${r.cocinas && r.cocinas.length > 0 ? r.cocinas.join(', ') : ''} - $${r.precio_pp || 0}</div>
    `
    button.type = 'button'
    
    button.addEventListener('click', (e) => {
      e.preventDefault()
      selectedRestaurantForFeedback = r
      selectedRestaurantsRejected = recs.filter((rec, idx) => idx !== index).map(rec => {
        const r_rej = allRestaurants.find(rest => rest.id === rec.id) || {}
        return {...r_rej, ...rec}
      })
      
      // Deshabilitar todos los botones
      feedbackButtonsEl.querySelectorAll('button').forEach(btn => {
        btn.disabled = true
        btn.classList.add('opacity-50')
      })
      
      // Resaltar el seleccionado
      button.classList.remove('bg-indigo-600', 'hover:bg-indigo-700')
      button.classList.add('bg-indigo-800', 'ring-2', 'ring-indigo-400')
      
      // Mostrar razones
      showFeedbackReasons()
    })
    
    feedbackButtonsEl.appendChild(button)
  })
  
  // Configurar botones de enviar/cancelar
  const btnEnviarFeedback = document.getElementById('btnEnviarFeedback')
  const btnCancelarFeedback = document.getElementById('btnCancelarFeedback')
  
  if (btnCancelarFeedback) {
    btnCancelarFeedback.addEventListener('click', () => {
      feedbackReasonsEl.classList.add('hidden')
      selectedRestaurantForFeedback = null
      selectedRestaurantsRejected = []
      
      feedbackButtonsEl.querySelectorAll('button').forEach(btn => {
        btn.disabled = false
        btn.classList.remove('opacity-50', 'bg-indigo-800', 'ring-2', 'ring-indigo-400')
        btn.classList.add('bg-indigo-600', 'hover:bg-indigo-700')
      })
    })
  }
  
  if (btnEnviarFeedback) {
    btnEnviarFeedback.addEventListener('click', async () => {
      await enviarFeedback(usuarioData)
    })
  }
}

function showFeedbackReasons() {
  const feedbackReasonsEl = document.getElementById('feedback-reasons')
  const reasonsChecklist = document.getElementById('reasons-checklist')
  
  if (!feedbackReasonsEl || !reasonsChecklist) return
  
  const razones = [
    { value: 'precio', label: '💰 Precio más conveniente' },
    { value: 'distancia', label: '📍 Más cercano / Menor tiempo de viaje' },
    { value: 'calidad', label: '⭐ Mejor rating / Calidad' },
    { value: 'gustos', label: '🍽️ Coincide mejor con mis gustos culinarios' },
    { value: 'abierto', label: '🕐 Está abierto ahora' },
    { value: 'reserva', label: '📋 No requiere reserva / Requiere reserva' },
    { value: 'caracteristicas', label: '✅ Tiene características que busco (pet friendly, estacionamiento, etc.)' },
    { value: 'otro', label: '💭 Otra razón' }
  ]
  
  reasonsChecklist.innerHTML = razones.map(razon => `
    <label class="flex items-center cursor-pointer p-3 rounded-lg hover:bg-indigo-50 transition-colors">
      <input type="checkbox" name="razon" value="${razon.value}" class="mr-3 w-5 h-5 text-indigo-600 rounded">
      <span class="text-gray-700">${razon.label}</span>
    </label>
  `).join('')
  
  feedbackReasonsEl.classList.remove('hidden')
  feedbackReasonsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

async function enviarFeedback(usuarioData) {
  const feedbackStatusEl = document.getElementById('feedback-status')
  const feedbackReasonsEl = document.getElementById('feedback-reasons')
  const reasonsChecklist = document.getElementById('reasons-checklist')
  
  if (!selectedRestaurantForFeedback) {
    if (feedbackStatusEl) {
      feedbackStatusEl.innerHTML = '<span class="text-red-600">⚠️ No hay restaurante seleccionado</span>'
    }
    return
  }
  
  const checkboxes = reasonsChecklist.querySelectorAll('input[type="checkbox"]:checked')
  const razones = Array.from(checkboxes).map(cb => cb.value).filter(v => v)
  
  if (razones.length === 0) {
    if (feedbackStatusEl) {
      feedbackStatusEl.innerHTML = '<span class="text-red-600">⚠️ Por favor, seleccioná al menos una razón.</span>'
    }
    return
  }
  
  if (feedbackStatusEl) {
    feedbackStatusEl.innerHTML = '<span class="text-indigo-600">Enviando feedback...</span>'
  }
  
  try {
    const climaEl = document.getElementById('clima')
    const franjaEl = document.getElementById('franja')
    const contexto = {
      clima: climaEl ? climaEl.value : 'templado',
      dia: 'viernes',
      franja: franjaEl ? franjaEl.value : 'cena'
    }
    
    const feedbackData = {
      usuario: usuarioData || window.__usuarioData || {},
      contexto: contexto,
      restaurante_seleccionado: selectedRestaurantForFeedback,
      restaurantes_rechazados: selectedRestaurantsRejected,
      razones_preferencia: razones
    }
    
    const response = await fetch('http://localhost:8000/api/feedback', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(feedbackData)
    })
    
    if (response.ok) {
      const result = await response.json()
      if (feedbackStatusEl) {
        feedbackStatusEl.innerHTML = `<span class="text-green-600">✅ ¡Gracias! Tu feedback fue registrado. Total de feedbacks: ${result.total_feedbacks || 0}</span>`
      }
      feedbackReasonsEl.classList.add('hidden')
      selectedRestaurantForFeedback = null
      selectedRestaurantsRejected = []
    } else {
      const errorText = await response.text()
      throw new Error(errorText)
    }
  } catch (error) {
    console.error('Error enviando feedback:', error)
    if (feedbackStatusEl) {
      feedbackStatusEl.innerHTML = `<span class="text-red-600">⚠️ Error al enviar feedback: ${error.message}</span>`
    }
  }
}

