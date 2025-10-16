document.getElementById('btnEjemplo').onclick = ()=>{
  document.getElementById('restaurantes').value = `[
  {"id":"r1","nombre":"Trattoria X","cocinas":["italiana"],"precio_pp":17000,"rating":4.6,"n_resenas":220,"atributos":[],"reserva":"si","tiempo_min":6,"abierto":"si"},
  {"id":"r2","nombre":"Bistró Y","cocinas":["italiana","fusion"],"precio_pp":19000,"rating":4.4,"n_resenas":120,"atributos":["sin_tacc"],"reserva":"si","tiempo_min":9,"abierto":"si"},
  {"id":"r3","nombre":"Cantina Z","cocinas":["pizza"],"precio_pp":12000,"rating":4.2,"n_resenas":80,"atributos":[],"reserva":"no","tiempo_min":12,"abierto":"si"}
]`
}

document.getElementById('btnLimpiar').onclick = ()=>{
  document.getElementById('restaurantes').value = '[]'
}

// Placeholder for admin-specific functions like saving restaurants
function saveRestaurants() {
  let restaurantes;
  try {
    restaurantes = JSON.parse(document.getElementById('restaurantes').value || '[]');
    document.getElementById('status').textContent = 'Restaurantes cargados correctamente.\n' + JSON.stringify(restaurantes, null, 2);
    document.getElementById('output').classList.remove('hidden');
  } catch (e) {
    document.getElementById('status').textContent = 'JSON de restaurantes inválido: ' + e.message;
    document.getElementById('output').classList.remove('hidden');
  }
}

// Example of how to add a new button in admin.html and link it here
// document.getElementById('btnGuardarRestaurantes').onclick = saveRestaurants;
