# 🎮 Pixel Bot Arena – Dokumentacja Gry (v1.0)

---

## 🧩 Opis gry

**Pixel Bot Arena** to gra oparta na pikselowej mapie, w której autonomiczne boty-gracze rywalizują, malując pola swoimi kolorami. Gra działa w nieskończonych kolejkach i turach, a stan mapy aktualizowany jest na bieżąco. Dodatkowo wspierani są obserwatorzy, którzy mogą śledzić rozgrywkę w czasie rzeczywistym.

Gracz dołącza do lobby i może w każdej chwili opuścić grę. Gdy gracz jest w lobby i gra się rozpocznie będzie od
dostawał informacje o możliwym ruchu, stanie mapy i informacji o graczach. Gdy gracz opuszcza lobby znika z mapy i w
miejsce jego kolory zostaje zastąpione białym.

Do gracza należy zaimplementowanie komunikacji z grą w sposób opisany poniżej. Gra przed dołączeniem gracza będzie
sprawdzać poprawność komunikacji. 

---

## 🧠 Definicje

| Termin        | Opis |
|---------------|------|
| **Gra**       | Sesja gry składająca się z kolejek bez warunku końcowego |
| **Kolejka**   | Sekwencja tur graczy w ustalonej kolejności |
| **Tura**      | Czas przeznaczony na ruch jednego gracza |
| **Mapa**      | Dwuwymiarowa siatka pikseli |
| **Pixel**     | Najmniejszy element mapy; posiada kolor |
| **Gracz**     | Bot lub klient wysyłający komendy do API gry |
| **Komenda**   | Akcja gracza (np. malowanie pikseli) |

---

## 📡 API – REST

---
### `GET /start`

Rozpoczyna gre.

### `GET /stop`

Kończy gre.

### `GET /game-state`

Zwraca aktualny stan gry (dla obserwatorów lub UI).

**Przykład odpowiedzi:**

```json
{
  "state": "waiting",
  "activePlayer": "123",
  "turnNumber": 0,
  "roundNumber": 42,
  "players": [
    { "id": "player1", "color": "red" },
    { "id": "player2", "color": "blue" }
  ],
  "map": {
    "pixels": ['red', 'black'],
    "height": 20,
    "width": 20
  ],
}
```

---

## 🌐 WebSocket API

### 🔁 Kanały

* `/ws/player` – dla graczy
* `/ws/observer` – dla obserwatorów

---

### 📤 Gracz: `playerTurn`

Wysyłane do gracza, gdy nadchodzi jego tura.

**Przykład:**

```json
{
  "type": "playerTurn",
  "playerId": "player2",
  "turnNumber": 2,
  "roundNumber": 11,
  "map": {
    "pixels": ['red', 'black'],
    "height": 20,
    "width": 20
  ],
  "players": [
    { "id": "player1", "color": "red" },
    { "id": "player2", "color": "blue" }
  ],
  "availableCommands": [
    { 
      "type": "paint", 
      "availableTargets": [ 
        { "x": 12, "y": 5 },
        { "x": 13, "y": 5 }
      ]
    }
  ]
}
```

---

### 📥 Gracz: `playerMove`

Wysyłane przez gracza w jego turze.

**Przykład:**

```json
{
  "type": "playerMove",
  "command": "paint",
  "targets": [{ "x": 12, "y": 5 }]
}
```

---

### 📥 Gracz: `join`

Dołącza gracza do gry. Zwraca identyfikator gracza jeśli udało się dołączyć.

**Odpowiedź:**
```json
{
  "playerId": "abc123",
  "color": "red"
}
````
---

### 📤 Obserwator: `gameUpdate`

Wysyłane do obserwatorów po każdej turze.

**Przykład:**

```json
{
  "type": "gameUpdate",
  "state": "playing",
  "activePlayer": "",
  "turnNumber": 0,
  "roundNumber": 42,
  "players": [
    { "id": "player1", "color": "red" },
    { "id": "player2", "color": "blue" }
  ],
  "map": {
    "pixels": ['red', 'black'],
    "height": 20,
    "width": 20
  ],
}
```

---

## 🛠 Komendy

### `paint`
### `eat`
### `bomb`
### `splat`
### `expand`

Zmienia kolor danego pixela na kolor gracza. Może być wykonana tylko na dostępnych pikselach.
