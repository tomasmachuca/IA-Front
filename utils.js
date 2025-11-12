// Funciones de utilidad

export async function obtenerUbicacion() {
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
    statusEl.className = 'text-xs text-red-500 mt-2 min-h-[1.2em]'
    return
  }
  
  statusEl.textContent = 'Solicitando permisos de ubicación...'
  statusEl.className = 'text-xs text-indigo-600 mt-2 min-h-[1.2em]'
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
      direccionEl.value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`
    }
    
    statusEl.textContent = '✓ Ubicación obtenida correctamente'
    statusEl.className = 'text-xs text-green-600 mt-2 min-h-[1.2em]'
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
    statusEl.className = 'text-xs text-red-500 mt-2 min-h-[1.2em]'
  } finally {
    direccionEl.disabled = false
  }
}

export function escapeHtml(s) {
  return (s || '').toString().replace(/[&<>"]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[c]))
}



