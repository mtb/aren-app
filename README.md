# Aren Okuma Uygulaması (Version 1.2.0)

A simple full-stack Turkish syllable practice app. Users select a syllable count and practice reading randomly chosen words, with alternating syllable highlights and background color changes.

## Features

 - Select words by exact syllable count
 - Random word generator with counter
 - Performance timing with session logging
 - Flag words for review with red-flag button and review page
 - Back button logs final session performance before returning to menu
- Alternating highlight/dim styling per syllable
- Change background color on each new word
- Keyboard (SPACE), click, and touch controls
- Responsive, dark-themed UI with Google Font **Dongle**

## Technology Stack

- **Backend**: Node.js, Express, CORS
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Data**: Pre-generated JSON word lists in `/data/`
- **Font**: Dongle (Google Fonts)

## Getting Started

### Prerequisites

- Node.js v14+ (tested on v18)
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/mtb/aren-app.git
cd aren-app

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the API & static server
npm start
```

Open http://localhost:3000 in your browser.

### Project Structure

```
aren-app/
├─ data/               # JSON lists by syllable count
│  ├─ 1_syllable.json
│  └─ ...
├─ performance/        # Performance session logs, organized by date
│  └─ YYYY/
│     └─ MM/
│        └─ DD/
│           └─ <sessionId>.log
├─ index.js            # Express server (serves /api and static files)
├─ package.json
├─ index.html          # Main menu page
├─ words.html          # Practice page
├─ menu.js             # Builds menu buttons
├─ words.js            # Practice logic and performance logging
├─ style.css           # App styling
└─ README.md           # Project documentation
```

## API Endpoints

- `GET /api/word-counts` — Returns available syllable counts
- `GET /api/word/:count` — Returns a random word with that count
 - `GET /api/word` — Returns a random word from all lists

### Performance APIs
- `POST /api/performance` — Log a performance session (JSON)
- `GET /api/performance` — List session metadata
- `GET /api/performance/:sessionId` — Get details for a session

### Review Check APIs
- `POST /api/check-word` — Flag the current word for review
- `GET /api/check-list` — Retrieve all flagged words
- `DELETE /api/check-list` — Clear the flagged words list

### UI Pages
- `/performance` — View all performance sessions
- `/performance/:sessionId` — Detailed session report
- `/check.html` — View/clear flagged words

## Deployment

You can deploy this Node.js app on any platform supporting Node.js (Heroku, Render, Railway, DigitalOcean, etc.).

1. Clone and install:
   ```bash
   git clone https://github.com/mtb/aren-app.git
   cd aren-app
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Browse to `http://localhost:3000`.

For production, consider using PM2 or Docker:
```bash
# PM2 example
pm install -g pm2
pm2 start index.js --name aren-app

# Docker example
docker build -t aren-app .
docker run -d -p 3000:3000 aren-app
```

## Deployment to Other Platforms

You can also deploy easily to Heroku, Render, Railway, or any Node.js–compatible host with:

```bash
npm install
npm start
```

## Contributing

1. Fork and create a feature branch
2. Commit your changes
3. Open a Pull Request

## License

MIT © mtb
