// @ts-check
import { defineConfig } from 'astro/config';

// The Pages path lives here and nowhere else: `site` + `base` are the single
// source for the project-page URL, so no page hardcodes the repository base.
// Project page target: https://wannnn.github.io/spanish-daily/
export default defineConfig({
  site: 'https://wannnn.github.io',
  base: '/spanish-daily/',
  output: 'static',
});
