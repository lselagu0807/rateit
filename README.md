# RateIt — Plataforma de reseñas verificadas

Clon de Trustpilot construido con **Angular 18** + **PHP** + **MySQL (XAMPP)**.

---

## Requisitos previos

- [XAMPP](https://www.apachefriends.org/) (Apache + MySQL)
- [Node.js](https://nodejs.org/) v20+
- [Angular CLI](https://angular.io/cli) v18: `npm install -g @angular/cli`

---

## 1. Configurar la base de datos (XAMPP)

1. Inicia **XAMPP** → arranca Apache y MySQL.
2. Abre [phpMyAdmin](http://localhost/phpmyadmin).
3. Importa el archivo `backend/rateit.sql` (pestaña **Importar**).
4. La base de datos `rateit` se creará automáticamente con datos de ejemplo.

---

## 2. Activar mod_headers en Apache (CORS) ⚠️

Esto es **obligatorio** para que Angular pueda hablar con el backend.

1. Abre `C:\xampp\apache\conf\httpd.conf`
2. Busca esta línea y quita el `#` si lo tiene:
   ```
   LoadModule headers_module modules/mod_headers.so
   ```
3. Busca `AllowOverride` dentro de `<Directory "C:/xampp/htdocs">` y ponlo en:
   ```
   AllowOverride All
   ```
4. **Reinicia Apache** desde el panel de XAMPP.

---

## 3. Colocar el backend en XAMPP

Copia la carpeta **`rateit/`** completa en:

```
C:\xampp\htdocs\rateit\      (Windows)
/Applications/XAMPP/htdocs/rateit/   (macOS)
```

La API quedará disponible en:
- `http://localhost/rateit/backend/api/empresas/`
- `http://localhost/rateit/backend/api/resenas/`

> Si tienes contraseña en MySQL, edita `backend/config/db.php` y cambia `DB_PASS`.

---

## 3. Instalar y arrancar el frontend Angular

```bash
cd frontend
npm install
ng serve
```

Abre [http://localhost:4200](http://localhost:4200) en tu navegador.

---

## Estructura del proyecto

```
rateit/
├── backend/
│   ├── config/
│   │   └── db.php                 # Configuración DB
│   ├── api/
│   │   ├── empresas/index.php     # CRUD Empresas
│   │   └── resenas/index.php      # CRUD Reseñas
│   └── rateit.sql                # Schema + datos de ejemplo
│
└── frontend/                      # Angular 18
    └── src/app/
        ├── core/
        │   ├── models/models.ts
        │   └── services/
        │       ├── empresa.service.ts
        │       └── resena.service.ts
        ├── pages/
        │   ├── home/
        │   ├── empresas/
        │   │   └── empresa-detalle/
        │   ├── resenas/
        │   └── cuenta/
        └── shared/components/
            ├── navbar/
            └── star-rating/
```

---

## Funcionalidades

### CRUDs implementados
| Recurso   | Crear | Leer | Actualizar | Eliminar |
|-----------|-------|------|------------|---------|
| Empresas  | ✅   | ✅   | ✅        | ✅      |
| Reseñas   | ✅   | ✅   | ✅        | ✅      |

### Páginas
- **Home** — buscador, reseñas recientes, top empresas
- **Empresas** — listado con filtros, ordenación, CRUD modal
- **Empresa detalle** — perfil completo + distribución de estrellas + reseñas
- **Reseñas** — todas las reseñas con filtro por puntuación
- **Mi cuenta** — perfil de usuario + mis reseñas

### Características técnicas
- Angular 18 standalone components
- Signals para gestión de estado reactivo
- Nueva sintaxis de plantillas `@if`, `@for`
- Lazy loading en todas las rutas
- API REST en PHP con PDO y prepared statements
- Recálculo automático de valoración media al crear/editar/borrar reseñas

---

## Notas para el desarrollo

- El usuario actual está definido en `core/models/models.ts` → `CURRENT_USER` (simula sesión).
- Para añadir autenticación real, implementa JWT en el backend y un `AuthGuard` en Angular.
- Los colores de avatar son generados por hash del nombre (deterministas).
