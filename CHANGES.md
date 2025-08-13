 # Changelog

 All notable changes to this project are documented in this file.

## [1.4.0] - 2025-08-13
### Added
- iOS `apple-touch-startup-image` tags for native splash on Add to Home Screen.
- Full-screen in-page splash overlay as a fallback for slow loads.
- `SPLASH_GUIDANCE.md` documentation detailing splash setup across platforms.

 ## [1.3.0] - 2025-08-13
 ### Changed
 - Removed all diagnostic logging and cleaned up console.log statements.
 ### Fixed
 - Ensured no extraneous console output in production.

 ## [1.2.0] - 2025-08-13
 ### Added
 - Prefetch next word functionality in practice view (`words.js`) to improve UI responsiveness.
 - Guard on “Geri” (back) button click to prevent accidental triggering of next-word fetch.
 - Ensure the review flag button (`🚩`) is registered only once per session.
 ### Changed
 - Express server refactored to use a shared router mounted under both `/` and `/aren`.
 - Asynchronous file system (`fs.promises`) used for log directories and file writes to avoid blocking.
 - Added parameter validation (via `express-validator`) for `/api/word/:count` endpoint.
 ### Fixed
 - Removed duplicate `express.json()` middleware.
 - Corrected mounting order so static assets and API routes no longer collide.

 ## [1.1.0] - 2025-08-12
 ### Added
 - Alternating syllable highlighting and dynamic background colors in practice view.
 - Accidental-click guard (ignore rapid taps/clicks) and keyboard/touch support for navigation.
 - Target-count prompt and counter format (`shown/target`) without auto-redirect.
 - Random mode (`Karışık`) with no consecutive syllable-count repeats.
 - Progressive Web App support: manifest, icons, meta tags for fullscreen mobile.
 - Performance logging: date-based `performance/YYYY/MM/DD` logs, APIs to list sessions and view details, `performance.html` & `performance-detail.html` pages.
 - Review-check feature: 🚩 flag button, `check.html` page, `POST /api/check-word`, `GET`/`DELETE /api/check-list` endpoints.
 - Subpath routing support under `/aren` for APIs and static pages.
 ### Changed
 - Enhanced error handling around file-system operations (mkdir, writeFile).
 - Ensured review log file exists at startup.
 - CSS fixes for `text-transform: none` and `pointer-events` for reliable click capture.

 ## [1.0.0] - 2025-08-11
 ### Added
 - Initial Express server loading `/data/*_syllable.json` word lists.
 - Basic practice UI: select syllable count, fetch words via `/api/word-counts` and `/api/word/:count`.
 - Simple click/spacebar-driven word navigation and static HTML/CSS frontend.
