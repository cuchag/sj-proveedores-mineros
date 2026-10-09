# sj-proveedores-mineros

Control de documentación de contratistas/proveedores para mineras de San Juan.

**Prototipo v0** (HTML único, sin dependencias): por contratista, carga la fecha de vencimiento de cada documento
(ARCA, Rentas, ART, seguro RC, F.931, registro provincial, seguridad e higiene) y muestra semáforo
(vigente / por vencer en 30 días / vencido o faltante) y % de cumplimiento. Datos en `localStorage` del navegador.

## Probar
Abrir `index.html`, o servir en red local/Tailscale: `python -m http.server 8080 --bind 0.0.0.0` y abrir `http://IP:8080`.

## Próximos pasos
1. Validar la lista de documentos con 10 contratistas mineros (entrevistas).
2. Backend + base de datos (Postgres/Supabase) y login.
3. Subida de archivos (PDF) y avisos de vencimiento por mail/WhatsApp.
