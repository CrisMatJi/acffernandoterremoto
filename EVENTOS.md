## SQL a ejecutar en Supabase (OBLIGATORIO antes de probar)

Entra en Supabase → SQL Editor y ejecuta este bloque:

```sql
-- 1. Permite que la anon key lea eventos activos
CREATE POLICY "anon lee eventos activos"
  ON eventos FOR SELECT TO anon
  USING (activo = 1 OR activo_invitado = 1);

-- 2. Función segura de autenticación de socios
--    (SECURITY DEFINER = bypassa RLS, nunca expone datos innecesarios)
CREATE OR REPLACE FUNCTION auth_socio(p_id int, p_dni text)
RETURNS TABLE(id int, nombre text, apellidos text, n_socio int)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.nombre, s.apellidos, s.n_socio
  FROM socios s
  WHERE s.id = p_id
    AND lower(s.dni) = lower(p_dni)
    AND s.activo = 1;
END;
$$;
```

---

# Plataforma de Reserva de Eventos — Instrucciones de Migración a React

## Contexto

La plataforma actual es una aplicación PHP que permite a socios e invitados
reservar asientos para eventos flamencos. Está en:
`webDescargada/acffernandoterremoto/eventos/`
Ya no se usa — la base de datos ha sido migrada a Supabase (ver `supabase_migration.sql`).

---

## Funcionalidad que debe tener la nueva app React

### Flujo público (socios e invitados)

1. **Login** — El socio introduce su número de socio (id) y DNI como contraseña.
   - Autenticación contra tabla `socios` en Supabase (`id` + `dni`).
   - Invitados: introducen DNI (validado con algoritmo NIF español) + nombre.
     Solo pueden acceder si el evento tiene `activo_invitado = true`.

2. **Selección de evento** — Dropdown con eventos activos (`activo = 1` o `activo_invitado = 1`).

3. **Mapa de asientos** — Grid visual del aforo:
   - 20 filas (A–T) × 7 columnas = 140 asientos (tabla `asientos`, ids A1–T7).
   - Asientos `disponible = false` → bloqueados permanentemente (zona escenario u otros).
   - Asientos ya reservados en `reserva` para el evento seleccionado → ocupados.
   - La reserva propia del usuario (si existe) → pre-seleccionada.
   - Quota: socios = 2 asientos máx., invitados = 1 asiento máx.

4. **Confirmación** — Al confirmar:
   - INSERT en `reserva` (o UPDATE si ya tenía reserva para ese evento).
   - Mostrar/descargar entrada en PDF (usar `@react-pdf/renderer` o similar).

5. **Cancelar reserva** — Botón visible si el usuario ya tiene reserva activa.
   - DELETE en `reserva` filtrando por `socio_id/invitado_id` + `evento_id`.

### Panel de administración (ruta protegida `/admin`)

- **Credenciales**: usuario/contraseña — almacenar en variables de entorno, NO hardcoded.
- **Gestión de Socios**: CRUD completo (nombre, apellidos, DNI, activo).
- **Gestión de Eventos**: CRUD + toggle `activo` + toggle `activo_invitado`.
- **Listado de Reservas**: filtrado por evento, exportable a CSV/Excel.

---

## Tablas Supabase relevantes

```
socios       — id (PK), n_socio, nombre, apellidos, dni, activo
eventos      — id (PK), nombre, fecha, hora, activo, activo_invitado
asientos     — id (PK, ej: "A1"), letra, numero, disponible
reserva      — id (PK), socio_id, invitado_id, nombre_apellidos, asiento_id, evento_id
configuracion — precio_socio, precio_invitado
```

RLS activa en todas las tablas. Las escrituras requieren usuario autenticado
(usar Supabase Auth o rol de servicio para el admin).

---

## Arquitectura sugerida

```
landing/src/
  pages/
    eventos/
      index.jsx         — Login + selección de evento (ruta: /eventos)
      reserva.jsx       — Mapa de asientos (ruta: /eventos/reserva)
      entrada.jsx       — Confirmación + PDF ticket
      admin/
        index.jsx       — Admin login
        dashboard.jsx   — Panel principal
        socios.jsx      — CRUD socios
        eventos.jsx     — CRUD eventos
        reservas.jsx    — Listado reservas
  components/
    SeatMap.jsx         — Grid de asientos reutilizable
    SeatMap.module.css
```

Usar **React Router** (`react-router-dom`) para las rutas.

---

## Issues conocidos a resolver

- **DNI duplicado**: socios id=1 e id=34 tienen el mismo DNI `31570965S`.
  Antes de lanzar, corregir in Supabase y añadir el índice UNIQUE en `dni`.
- **Autenticación admin**: usar variable de entorno `VITE_ADMIN_PASSWORD`
  (nunca hardcodear como en el PHP original).
- **Cuota de asientos**: validar también en servidor (RLS / Edge Function),
  no solo en cliente.
- **Supabase anon key**: expuesta en el bundle JS (GitHub Pages es estático).
  Las políticas RLS son la única barrera — revisar que estén correctas.

---

## Próximos pasos

1. Instalar `react-router-dom` en `landing/`.
2. Crear la página `/eventos` con el flujo de login.
3. Construir el componente `SeatMap` con el grid A–T × 7.
4. Conectar confirmación de reserva a Supabase.
5. Implementar generación de PDF para la entrada.
6. Construir panel admin con rutas protegidas.
