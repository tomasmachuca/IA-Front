USER FRONT — Recomendador de Restaurantes (CLIPS)

Archivos:
- index.html, style.css, app.js

Cómo usar con tu FastAPI existente (app/main.py):
1) Copiá estos archivos a una carpeta pública. Por ejemplo:
   - app/templates/index.html    (reemplaza tu index minimal)
   - app/static/style.css
   - app/static/app.js
2) En main.py montá estáticos (si no lo hiciste):
   from fastapi.staticfiles import StaticFiles
   app.mount("/static", StaticFiles(directory="app/static"), name="static")
3) Asegurate que index.html apunte a /static/style.css y /static/app.js o ajustá rutas.
4) Levantá:
   uvicorn app.main:app --reload
5) Navegá a http://127.0.0.1:8000/

Notas:
- El front llama a POST /api/recommend del mismo host (evitás CORS).
- Validamos pesos aproximadamente; podés endurecer validaciones si querés.
- Para producción: activá HTTPS y poné un proxy (NGINX) si corresponde.
