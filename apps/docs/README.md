<div align="center">

# 📚 Starhold docs

**The source of [starhold.fyi](https://starhold.fyi): how the Starhold services work, what they support today, and where their limits are.**

[![Astro](https://img.shields.io/badge/Astro-BC52EE?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![Starlight](https://img.shields.io/badge/Starlight-docs-7C3AED?style=flat-square&logo=astro&logoColor=white)](https://starlight.astro.build)
[![Live](https://img.shields.io/badge/live-starhold.fyi-0D1117?style=flat-square)](https://starhold.fyi)

</div>

| Path | What |
|---|---|
| `src/content/docs/services/` | One page per service: state, how to get in, plans, privacy defaults |
| `src/content/docs/log/` | The dated build log |
| `src/content/docs/shushgame/` | The Shush player manual |
| `src/content/docs/open-source/` | Open-source utilities |
| `src/components/`, `src/styles/` | The Starlight overrides and the shared Starhold look |
| `tests/` | Checks run against the built site |

```sh
npm ci
npm run dev          # local preview
npm run build        # static site in dist/
npm run test:fleet   # checks dist/ (run the build first)
```

> [!NOTE]
> The availability line on each service page is checked by the tests against the same shared source the storefront uses, so a page cannot quietly disagree with it.
