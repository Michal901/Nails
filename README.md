# Galeria stylizacji paznokci

- `adres-strony/` – galeria dla klientek
- `adres-strony/dev` – panel edycji (ukryty przed Google, bez linku na stronie)

## Jak edytować
1. Wejdź na `adres-strony/dev`.
2. Zmień teksty, kolejność, rozmiary i kadry, dodaj zdjęcia. Podgląd odświeża się na żywo.
3. Kliknij **Pobierz zmiany (.zip)**.
4. Rozpakuj paczkę do tego folderu. Podmieni `gallery.json` i doda zdjęcia do `images/`.
5. Wrzuć folder na hosting (Netlify: przeciągnij folder w zakładce Deploys).

## Pliki
- `index.html` – strona galerii
- `dev/index.html` – panel edycji
- `assets/app.js`, `assets/app.css` – kod i style wspólne dla obu stron
- `gallery.json` – dane: nagłówek, techniki, kafelki (`size` 1–3, `src`, kadr `fx`/`fy`, `zoom`)
- `images/` – zdjęcia
- `_redirects` – reguła Netlify, żeby `/dev` działało bez ukośnika na końcu

`/dev` jest chroniony PIN-em (zmiana PIN-u: `PIN_HASH` w `assets/app.js`). To blokada w przeglądarce, nie prawdziwe hasło serwera — wystarcza, bo panel niczego nie zmienia online.
