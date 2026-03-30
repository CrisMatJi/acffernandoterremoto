# Plataforma de Reserva de Eventos — Estado y Continuación

---

## SQL pendiente en Supabase (EJECUTAR si aún no se ha hecho)

### 1 · Añadir `created_at` a la tabla `reserva`

```sql
ALTER TABLE reserva
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
```

Las reservas existentes recibirán la fecha de ejecución del ALTER.
Las nuevas se guardan automáticamente con el timestamp real del INSERT.

---

### 2 · SQL base completo (referencia — ya ejecutado)

```sql
-- ── Políticas RLS ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon lee eventos activos" ON eventos;
CREATE POLICY "anon lee eventos activos"
  ON eventos FOR SELECT TO anon
  USING (activo = 1 OR activo_invitado = 1);

DROP POLICY IF EXISTS "anon lee asientos" ON asientos;
CREATE POLICY "anon lee asientos"
  ON asientos FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon lee reservas" ON reserva;
CREATE POLICY "anon lee reservas"
  ON reserva FOR SELECT TO anon USING (true);

-- ── Funciones SECURITY DEFINER ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION auth_socio(p_id int, p_dni text)
RETURNS TABLE(id int, nombre text, apellidos text, n_socio int)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.nombre::text, s.apellidos::text, s.n_socio
  FROM socios s
  WHERE s.id = p_id AND lower(s.dni) = lower(p_dni) AND s.activo = 1;
END; $$;

CREATE OR REPLACE FUNCTION hacer_reserva(
  p_evento_id   int,
  p_socio_id    int,
  p_invitado_id text,
  p_nombre      text,
  p_asiento_id  text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF p_socio_id IS NOT NULL THEN
    DELETE FROM reserva WHERE evento_id = p_evento_id AND socio_id = p_socio_id::text;
  ELSE
    DELETE FROM reserva WHERE evento_id = p_evento_id AND invitado_id = p_invitado_id;
  END IF;
  INSERT INTO reserva (socio_id, invitado_id, nombre_apellidos, asiento_id, evento_id)
  VALUES (
    CASE WHEN p_socio_id IS NOT NULL THEN p_socio_id::text ELSE NULL END,
    p_invitado_id,
    p_nombre,
    p_asiento_id,
    p_evento_id
  );
END; $$;

CREATE OR REPLACE FUNCTION cancelar_reserva(
  p_evento_id   int,
  p_socio_id    int,
  p_invitado_id text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF p_socio_id IS NOT NULL THEN
    DELETE FROM reserva WHERE evento_id = p_evento_id AND socio_id = p_socio_id::text;
  ELSE
    DELETE FROM reserva WHERE evento_id = p_evento_id AND invitado_id = p_invitado_id;
  END IF;
END; $$;

-- ── Permisos anon key ─────────────────────────────────────────────────────────
GRANT SELECT ON TABLE eventos   TO anon;
GRANT SELECT ON TABLE asientos  TO anon;
GRANT SELECT ON TABLE reserva   TO anon;

GRANT EXECUTE ON FUNCTION auth_socio(int, text)                    TO anon;
GRANT EXECUTE ON FUNCTION hacer_reserva(int, int, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION cancelar_reserva(int, int, text)          TO anon;
```

---

## Tablas Supabase

```
socios        — id (PK), n_socio, nombre VARCHAR(30), apellidos VARCHAR(30), dni, activo
eventos       — id (PK), nombre, fecha, hora, activo, activo_invitado
asientos      — id (PK varchar "A1"), letra, numero, disponible
reserva       — id (PK), socio_id, invitado_id, nombre_apellidos,
                asiento_id (CSV "A3,A4"), evento_id, created_at TIMESTAMPTZ
configuracion — precio_socio, precio_invitado
```

**Crítico:** `socios.nombre` y `socios.apellidos` son `VARCHAR(30)`.
En la función `auth_socio` hay que castear: `s.nombre::text, s.apellidos::text`.

---

## Estado actual — ya implementado

### Rutas React
- `/`              → Landing page principal
- `/eventos`       → Login + selección de evento (`EventosLogin.jsx`)
- `/eventos/reserva` → Mapa de asientos (`SeatMap.jsx`)
- SPA redirect en GitHub Pages: `public/404.html` + script en `index.html`

### Autenticación y sesión
- `SessionContext.jsx` — contexto global con persistencia en `sessionStorage`
- Socios: login por `n_socio` (mostrado como "Número de socio") + DNI via RPC `auth_socio`
- Invitados: DNI validado con algoritmo NIF español + nombre libre
- Guard en `SeatMap.jsx`: redirige a `/eventos` si no hay sesión

### EventosLogin (`/eventos`)
- Selector de evento como tarjetas (no dropdown): muestra nombre, fecha, hora
- Badge dorado "Invitados" si `activo_invitado = true`
- Badge rojo oscuro "Solo socios" si `activo_invitado = false`
- Formulario de auth solo visible tras seleccionar evento

### SeatMap (`/eventos/reserva`)
- **Layout**: 20 filas (A–T) × 7 columnas (1–7) = 140 asientos (BD es fuente de verdad)
- `asientoMap` keyed por `${letra}${numero}` string (no por integer `id`)
- Asientos bloqueados permanentemente: `A5–A14`, `B5–B14` (hardcoded en `BLOCKED_SEATS`)
- Colores: libre (blanco translúcido), seleccionado (dorado), ocupado (rojo), bloqueado (oscuro)
- Columnas separadas con gap extra tras la 4ª y la 9ª (pasillos, replica PHP original)
- Cuota: socios = 2 asientos, invitados = 1 asiento
- Pre-selecciona la reserva existente al cargar
- `reservaActual` state: asientos confirmados en BD (distinto de `selected` que puede cambiar)
- `pendingChanges`: true cuando `selected ≠ reservaActual`
- Aviso naranja cuando hay cambios pendientes: "Al confirmar, se cancelará tu reserva anterior (X)"
- Botón **Descargar entrada** oculto cuando `pendingChanges = true`
- Fondo: foto `sala.jpg` con overlay oscuro + `backdrop-filter` en panel de asientos

### Entrada PDF (`TicketPDF.jsx`)
- Librería: `@react-pdf/renderer` v4
- Ticket apaisado 560×200pt, dos paneles:
  - **Izquierdo** (crema): logo `logoEntrada.png` (PNG sin fondo, letras negras)
  - **Derecho** (oscuro): nombre evento, fecha+hora, titular, tipo (Socio Nº / Invitado), asientos, fecha de reserva
- Fecha de reserva: `created_at` de la tabla `reserva`, formateada como `DD/MM/AAAA a las HH:MM`
- Descargable tras confirmar o cuando ya existe reserva (y no hay `pendingChanges`)

### Imágenes del proyecto
- `public/images/logo.jpg` — logo circular (navbar)
- `public/images/logoEntrada.png` — logo PNG sin fondo para el PDF
- `public/images/sala.jpg` — foto B&W del teatro (fondo SeatMap) ← **añadir si no está**

---

## Próximo: Panel de Administración (`/admin`)

### Acceso
- Ruta protegida `/admin` y subrutas `/admin/*`
- Credenciales almacenadas en `.env`:
  ```
  VITE_ADMIN_USER=admin
  VITE_ADMIN_PASSWORD=xxxxx
  ```
- No usar Supabase Auth (es estático). Login simple: comparar contra env vars.
- Sesión admin en `sessionStorage` con clave `admin_session`, limpiar al cerrar.
- El cliente Supabase para el admin **debe usar la `service_role` key** (no la anon key)
  para poder hacer INSERT/UPDATE/DELETE sin RLS.
  Añadir a `.env`: `VITE_SUPABASE_SERVICE_KEY=eyJ...`
  Crear segundo cliente en `supabase.js`:
  ```js
  export const supabaseAdmin = createClient(url, import.meta.env.VITE_SUPABASE_SERVICE_KEY)
  ```

### Rutas del admin
```
/admin              → AdminLogin (formulario usuario + contraseña)
/admin/dashboard    → Panel principal con resumen (socios, eventos, reservas)
/admin/socios       → CRUD socios
/admin/eventos      → CRUD eventos
/admin/reservas     → Listado de reservas filtrado por evento
```

### Funcionalidades por sección

#### Dashboard (`/admin/dashboard`)
- Contador socios activos / total
- Contador eventos activos
- Últimas reservas (5 más recientes)
- Accesos directos a las secciones

#### Socios (`/admin/socios`)
- Tabla paginada: n_socio, nombre, apellidos, dni, activo
- Búsqueda por nombre, apellidos o DNI
- **Crear**: formulario modal — n_socio (autoincremental sugerido), nombre, apellidos, dni, activo toggle
- **Editar**: mismo modal pre-rellenado
- **Activar/Desactivar** (toggle `activo`) sin borrar el registro
- **Eliminar**: solo si no tiene reservas activas (advertencia modal)
- Pendiente: DNI duplicado en id=1 e id=34 (ambos `31570965S`) → corregir antes de añadir UNIQUE

#### Eventos (`/admin/eventos`)
- Tabla: nombre, fecha, hora, activo, activo_invitado
- **Crear/Editar**: nombre, fecha (date picker), hora (time picker), toggles activo / activo_invitado
- **Toggle activo**: activa/desactiva el evento para socios
- **Toggle activo_invitado**: además abre/cierra acceso a invitados
- **Ver reservas**: link directo a `/admin/reservas?evento=ID`

#### Reservas (`/admin/reservas`)
- Selector de evento (obligatorio para cargar)
- Tabla: asiento(s), nombre titular, tipo (socio/invitado), n_socio (si aplica), fecha reserva
- **Cancelar reserva** individual (DELETE en `reserva`)
- **Exportar CSV**: columnas nombre, tipo, asiento, fecha_reserva
- Mapa de asientos en modo lectura (sin interacción) mostrando ocupación actual

### Archivos a crear
```
landing/src/
  admin/
    AdminLogin.jsx          — formulario login admin
    AdminLogin.module.css
    AdminLayout.jsx         — layout con sidebar + header (guard de sesión)
    AdminLayout.module.css
    Dashboard.jsx
    Socios.jsx              — tabla + modal CRUD
    Eventos.jsx             — tabla + modal CRUD
    Reservas.jsx            — tabla filtrada por evento + CSV export
  supabase.js               — añadir export supabaseAdmin con service key
```

### Nuevas rutas en `App.jsx`
```jsx
<Route path="/admin" element={<AdminLogin />} />
<Route path="/admin/*" element={<AdminLayout />}>
  <Route index element={<Navigate to="dashboard" />} />
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="socios"    element={<Socios />} />
  <Route path="eventos"   element={<Eventos />} />
  <Route path="reservas"  element={<Reservas />} />
</Route>
```

`AdminLayout` hace de guard: si no hay `admin_session` en sessionStorage, redirige a `/admin`.

### Estilo del admin
- Mismo sistema de variables CSS (`--bg-deep`, `--gold`, `--text-cream`, etc.)
- Layout: sidebar izquierdo fijo + área de contenido con scroll
- Tablas: fondo `var(--bg-card)`, bordes `var(--border-dim)`, hover dorado suave
- Modales: overlay oscuro + card centrada, mismo estilo que `EventosLogin`
- Botones peligrosos (eliminar, cancelar): rojo `#e07070`

---

## Issues pendientes

- **DNI duplicado**: socios id=1 e id=34 tienen `31570965S` → corregir en Supabase antes de producción
- **GitHub Actions deploy**: configurar workflow para GitHub Pages con secrets de Supabase + EmailJS
- **QR en entrada**: funcionalidad aparcada — en el futuro, incluir QR en PDF para marcar asistencia
- **Validación server-side cuota**: actualmente solo se valida en cliente; añadir check en `hacer_reserva`
