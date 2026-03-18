# INDEXOTECA

## Link health checker (admin)

Verifica links de `ref2d.js` + `indexoteca.js` y genera reportes para identificar caídas.

### Ejecutar

```bash
node scripts/check-links.mjs
```

### Modo sin red (prueba de extracción)

```bash
node scripts/check-links.mjs --dry-run
```

### Salidas

- `reports/link-health/latest.json`
- `reports/link-health/latest.md`
- `reports/link-health/latest.csv`
- `reports/link-health/latest.html` (panel visual con búsqueda, filtros y orden)

El reporte marca links en categorías como `ok`, `broken`, `server_error`, `restricted` o `review`.

### Ver panel HTML (sin terminal)

Abre directamente `reports/link-health/latest.html` en tu navegador.
# Test-Referencioteca
