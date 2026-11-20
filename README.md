# Leonida Trophy Guide — GTA VI

[![make.fun gta6-trophy-guide-01](https://make.fun/badge/competition/gta6-trophy-guide-01)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank 0 entries · closes in 24h](https://make.fun/badge/competition/gta6-trophy-guide-01/entries)](https://make.fun/bounty/gta6-trophy-guide-01)
[![pool $250 USDC](https://make.fun/badge/competition/gta6-trophy-guide-01/prize)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand
Theft Auto VI, built for make.fun's **gta6-trophy-guide-01** bounty ($250
USDC, 50 paid places).

## What it is

- **Checklist** — every trophy with its official name, description and grade,
  a guide in our own words with its sources, difficulty and time estimates,
  and a checkbox that saves progress in the browser (localStorage).
- **Tracker** — progress bar with grade counts and trophy points, search,
  filters by kind (story, missable, collectibles, activities, crime,
  completion) and grade, hide-earned, export/import/reset.
- **Spoiler-safe mode** — the 28 hidden story trophies stay masked (name and
  description hidden) until you earn them.
- **Roadmap** — six stages in order to the Platinum, covering all 55 trophies
  exactly once, with the six missable trophies flagged up front.
- **Offline** — static files under `app/`, no build step, no network request
  at run time. Serve with `node serve.ts` and open http://localhost:8080.

## Trophy data

`app/data/trophies.json` holds the 55 trophies: official name, description
and grade as PlayStation publishes them, hidden flags verified against the
GamesFuze list (27 visible, 28 hidden), kind, difficulty, time estimate,
count, missable flag and note, steps, the guide text, and the source (name
and link) for each trophy. `app/data/roadmap.json` holds the six stages and
the missable list.

## Sources

- [GamesFuze trophy list](https://gamesfuze.com/gta-6-wiki/achievements/)
- [EGamers trophy list](https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/)
- [Planet GTA 6 trophy list](https://www.planetgta6.com/en/gta-6-trophies/)

Lists were last cross-checked on 21 November 2026, the day of the game's
launch. Unofficial fan guide — not affiliated with Rockstar Games,
Take-Two Interactive, Sony Interactive Entertainment or PlayStation. No
Rockstar logo, artwork, box art or game screenshot is used anywhere.

## License

MIT — see [LICENSE](LICENSE).
