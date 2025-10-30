async function recomendar(){
  const presupuesto = parseFloat(document.getElementById('presupuesto').value || '0')
  const tmax = parseFloat(document.getElementById('tmax').value || '0')
  const gustos = document.getElementById('gustos').value.trim().split(/\s+/).filter(Boolean)
  const restricciones = document.getElementById('restricciones').value.trim().split(/\s+/).filter(Boolean)
  const wg = parseFloat(document.getElementById('wg').value||'0.35')
  const wp = parseFloat(document.getElementById('wp').value||'0.20')
  const wd = parseFloat(document.getElementById('wd').value||'0.25')
  const wq = parseFloat(document.getElementById('wq').value||'0.15')
  const wa = parseFloat(document.getElementById('wa').value||'0.05')
  const clima = document.getElementById('clima').value
  const franja = document.getElementById('franja').value
  const grupo = document.getElementById('grupo').value
  const transporte = document.getElementById('transporte')?.value || ''
  const discapacidadSel = document.getElementById('discapacidad')
  const discapacidad = discapacidadSel && discapacidadSel.value || ''
  const movilidadSel = document.getElementById('movilidad')
  const puedeAutonomo = movilidadSel && movilidadSel.value || ''
  const direccion = (document.getElementById('direccion')?.value || '').trim()
  const coords = window.__coords || null

  let restaurantes = [
  {"id":"r1","nombre":"Trattoria X","cocinas":["italiana"],"precio_pp":17000,"rating":4.6,"n_resenas":220,"atributos":[],"reserva":"si","tiempo_min":6,"abierto":"si"},
  {"id":"r2","nombre":"Bistró Y","cocinas":["italiana","fusion"],"precio_pp":19000,"rating":4.4,"n_resenas":120,"atributos":["sin_tacc"],"reserva":"si","tiempo_min":9,"abierto":"si"},
  {"id":"r3","nombre":"Cantina Z","cocinas":["pizza"],"precio_pp":12000,"rating":4.2,"n_resenas":80,"atributos":[],"reserva":"no","tiempo_min":12,"abierto":"si"}
  ]

  // Normalización mínima de pesos
  const sum = wg+wp+wd+wq+wa
  if(sum < 0.99 || sum > 1.01){
    if(!confirm('Los pesos no suman ≈ 1.0. ¿Continuar igual?')) return;
  }

  const body = {
    usuario: {
      id:"u1",
      cocinas_favoritas: gustos,
      picante: "bajo",
      presupuesto,
      tiempo_max: tmax,
      movilidad: transporte || "a_pie",
      discapacidad: discapacidad === 'si' ? 'si' : 'no',
      puede_autonomo: discapacidad === 'si' ? (puedeAutonomo || 'no_definido') : 'no_aplica',
      restricciones,
      diversidad: "media",
      wg,wp,wd,wq,wa
    },
    contexto: { clima, dia:"viernes", franja, grupo, direccion, coords, transporte },
    restaurantes
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
  const r0 = {...r0_full, ...r0_rec} // Combinar datos

  top.innerHTML = `<div class="result">
    <h3>🎯 Nuestra mejor opción: ${r0.nombre}</h3>
    <p><strong>Precio:</strong> $${r0.precio_pp} por persona</p>
    <p><strong>Rating:</strong> ${r0.rating} (${r0.n_resenas} reseñas)</p>
    <p><strong>Cocinas:</strong> ${(Array.isArray(r0.cocinas) && r0.cocinas.length > 0) ? r0.cocinas.join(', ') : 'No especificado'}</p>
    ${(Array.isArray(r0.atributos) && r0.atributos.length > 0) ? `<p><strong>Atributos:</strong> ${r0.atributos.join(', ')}</p>` : ''}
    ${r0.reserva ? `<p><strong>Reserva:</strong> ${r0.reserva}</p>` : ''}
    ${r0.abierto ? `<p><strong>Abierto:</strong> ${r0.abierto}</p>` : ''}
    ${r0.tiempo_min ? `<p><strong>Tiempo mínimo:</strong> ${r0.tiempo_min} min</p>` : ''}
    <div><strong>Índice U:</strong> ${r0.U.toFixed(3)}</div>
    <div class="justifications">
      ${(Array.isArray(r0.justifs) && r0.justifs.length > 0) ? r0.justifs.map(j=>`<span class="badge">${escapeHtml(j)}</span>`).join(' ') : 'Sin justificaciones'}
    </div>
  </div>`

  lista.innerHTML = recs.slice(1).map(r_rec=>{
    const r_full = allRestaurants.find(r => r.id === r_rec.id) || {};
    const r = {...r_full, ...r_rec};
    return `
    <div class="cardAlt">
      <strong>${r.nombre}</strong> — U=${r.U.toFixed(3)}<br/>
      <span>Precio: $${r.precio_pp} | Rating: ${r.rating} (${r.n_resenas} reseñas)</span><br/>
      <span>Cocinas: ${(Array.isArray(r.cocinas) && r.cocinas.length > 0) ? r.cocinas.join(', ') : 'No especificado'}</span><br/>
      ${(Array.isArray(r.atributos) && r.atributos.length > 0) ? `<span>Atributos: ${r.atributos.join(', ')}</span><br/>` : ''}
      ${r.reserva ? `<span>Reserva: ${r.reserva}</span><br/>` : ''}
      ${r.abierto ? `<span>Abierto: ${r.abierto}</span><br/>` : ''}
      ${r.tiempo_min ? `<span>Tiempo mínimo: ${r.tiempo_min} min</span><br/>` : ''}
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

document.getElementById('btnRecomendar').onclick = recomendar

// Mostrar/ocultar la pregunta de movilidad cuando hay discapacidad
const discapacidadEl = document.getElementById('discapacidad')
const movilidadWrap = document.getElementById('movilidadWrap')
if(discapacidadEl && movilidadWrap){
  discapacidadEl.addEventListener('change', ()=>{
    if(discapacidadEl.value === 'si'){
      movilidadWrap.classList.remove('hidden')
    }else{
      movilidadWrap.classList.add('hidden')
      const movSel = document.getElementById('movilidad')
      if(movSel) movSel.value = ''
    }
  })
}

// Geolocalización simple: guarda coords y rellena el campo dirección con lat,lon
const btnGeo = document.getElementById('btnGeo')
if(btnGeo){
  btnGeo.addEventListener('click', ()=>{
    if(!('geolocation' in navigator)){
      alert('Tu navegador no soporta geolocalización')
      return
    }
    btnGeo.disabled = true
    btnGeo.textContent = 'Obteniendo...'
    navigator.geolocation.getCurrentPosition(pos=>{
      const {latitude, longitude} = pos.coords
      window.__coords = {lat: latitude, lon: longitude}
      const dir = document.getElementById('direccion')
      if(dir) dir.value = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
      btnGeo.textContent = 'Ubicación detectada'
      btnGeo.disabled = false
    }, err=>{
      alert('No se pudo obtener la ubicación: '+ err.message)
      btnGeo.textContent = 'Obtener automáticamente'
      btnGeo.disabled = false
    }, {enableHighAccuracy:true, timeout:10000})
  })
}

// Presets rápidos para pesos según preferencia
const pills = document.getElementById('preferenciaPills')
if(pills){
  pills.addEventListener('click', (e)=>{
    const btn = e.target.closest('button.pill')
    if(!btn) return
    [...pills.querySelectorAll('.pill')].forEach(b=>b.classList.remove('selected'))
    btn.classList.add('selected')
    const preset = btn.getAttribute('data-preset')
    const wgEl = document.getElementById('wg')
    const wpEl = document.getElementById('wp')
    const wdEl = document.getElementById('wd')
    const wqEl = document.getElementById('wq')
    const waEl = document.getElementById('wa')
    const sets = {
      equilibrado: {wg:0.35, wp:0.20, wd:0.25, wq:0.15, wa:0.05},
      cercania:    {wg:0.25, wp:0.15, wd:0.45, wq:0.10, wa:0.05},
      afinidad:    {wg:0.55, wp:0.10, wd:0.15, wq:0.15, wa:0.05},
      precio:      {wg:0.20, wp:0.45, wd:0.15, wq:0.15, wa:0.05},
      calidad:     {wg:0.25, wp:0.10, wd:0.15, wq:0.45, wa:0.05},
      disponibilidad:{wg:0.25, wp:0.10, wd:0.15, wq:0.10, wa:0.40}
    }
    const s = sets[preset] || sets.equilibrado
    wgEl.value = s.wg
    wpEl.value = s.wp
    wdEl.value = s.wd
    wqEl.value = s.wq
    waEl.value = s.wa
  })
}

document.getElementById('btnCopiar').onclick = async ()=>{
  const recs = window.__last || []
  const lines = recs.map(r => `- ${r.nombre}: U=${r.U.toFixed(3)} | ${r.justifs.join(' | ')}`)
  try{
    await navigator.clipboard.writeText(lines.join('\n') || 'Sin datos')
    alert('Copiado al portapapeles')
  }catch(e){
    alert('No se pudo copiar: '+e.message)
  }
}

document.getElementById('btnDescargar').onclick = ()=>{
  const recs = window.__last || []
  const blob = new Blob([JSON.stringify(recs,null,2)], {type:'application/json'})
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'recomendacion.json'
  a.click()
  URL.revokeObjectURL(a.href)
}
