// Main entry point
import Router from './router.js'
import { renderLanding } from './landing.js'
import { renderRecommender } from './recommender.js'

// Crear router global
const router = new Router()
window.router = router

// Registrar rutas
router.registerRoute('/', renderLanding)
router.registerRoute('/recommender', renderRecommender)

// Inicializar router
router.init()



