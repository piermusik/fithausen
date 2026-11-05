# fithausen

Eigene Kleiderschrank-Webapp: Klamotten fotografieren (Hintergrund wird im Browser entfernt), am Collage-Avatar kombinieren, shufflen, "Heute an" loggen, rotieren. Mit Wetter-Filter.

## Aufbau

- `public/` – die App (HTML, CSS, JS). Kein Build-Schritt.
- `functions/api/[[path]].js` – kleine API als Cloudflare Pages Function.
- Daten und Fotos liegen in einer Cloudflare-D1-Datenbank (Binding `DB`). Die Tabellen werden beim ersten Aufruf automatisch angelegt.
- Login per Passwort aus der Umgebungsvariable `APP_PASSWORD`.

## Cloudflare Pages Einstellungen

- Framework preset: None
- Build command: leer
- Build output directory: `public`
- Binding: D1-Datenbank, Variablenname `DB`
- Variable: `APP_PASSWORD` (als Secret)

## Externe Dienste (ohne Key)

- Wetter und Ortssuche: Open-Meteo
- Freistellen: `@imgly/background-removal` (lädt das Modell beim ersten Mal ins Browser-Cache)
