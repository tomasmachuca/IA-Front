async function cargarRestaurantes() {
  try {
    const response = await fetch('http://localhost:8000/api/restaurantes')
    const restaurantes = await response.json()
    document.getElementById('restaurantes').value = JSON.stringify(restaurantes, null, 2)
    mostrarStatus('✓ Restaurantes cargados desde el backend', true)
  } catch (e) {
    mostrarStatus('Error al cargar restaurantes: ' + e.message, false)
  }
}

async function guardarRestaurantes() {
  let restaurantes
  try {
    restaurantes = JSON.parse(document.getElementById('restaurantes').value || '[]')
  } catch (e) {
    mostrarStatus('JSON inválido: ' + e.message, false)
    return
  }
  
  // Validar que no tengan tiempo_min (se calcula dinámicamente)
  restaurantes = restaurantes.map(r => {
    const {tiempo_min, ...rest} = r
    return rest
  })
  
  try {
    const response = await fetch('http://localhost:8000/api/restaurantes', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(restaurantes)
    })
    const result = await response.json()
    mostrarStatus(`✓ ${result.message}. ${result.count} restaurantes guardados.`, true)
  } catch (e) {
    mostrarStatus('Error al guardar restaurantes: ' + e.message, false)
  }
}

function mostrarStatus(mensaje, exito) {
  const statusEl = document.getElementById('status')
  const outputEl = document.getElementById('output')
  statusEl.textContent = mensaje
  statusEl.style.color = exito ? '#388e3c' : '#d32f2f'
  outputEl.classList.remove('hidden')
}

document.getElementById('btnCargar').onclick = cargarRestaurantes
document.getElementById('btnGuardar').onclick = guardarRestaurantes

document.getElementById('btnEjemplo').onclick = async () => {
  // Obtener ejemplo del backend (cargar restaurantes actuales)
  await cargarRestaurantes()
}

document.getElementById('btnLimpiar').onclick = () => {
  document.getElementById('restaurantes').value = '[]'
}

// Cargar restaurantes al iniciar
cargarRestaurantes()
