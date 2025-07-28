# Aren Okuma Uygulaması

A simple full-stack Turkish syllable practice app. Users select a syllable count and practice reading randomly chosen words, with alternating syllable highlights and background color changes.

## Features

- Select words by exact syllable count
- Random word generator with counter
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
├─ index.js            # Express server (serves /api and static files)
├─ package.json
├─ index.html          # Main menu page
├─ words.html          # Practice page
├─ menu.js
├─ words.js
├─ style.css
└─ README.md
```

## API Endpoints

- `GET /api/word-counts` — Returns available syllable counts
- `GET /api/word/:count` — Returns a random word with that count
- `GET /api/word` — Returns a random word from all lists

## Deployment to A2 Hosting (cPanel)

1. Push your code and data folder to GitHub
2. In cPanel → **Setup Node.js App**:
   - Application root: `~/aren-app` (folder containing `package.json`)
   - Startup file: `index.js`
   - Run **npm install**
   - Click **Start** or **Restart App**
3. Ensure DNS points to your A2 account.
4. The app will be available at your domain.

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
