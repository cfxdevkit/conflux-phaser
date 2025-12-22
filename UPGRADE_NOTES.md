Summary of remaining major upgrades and migration recommendations

What remains (major versions):

- React -> 19.x (current: 18.3.1)
  - Potential breaking API changes and runtime behavior changes (concurrent rendering advances).
  - Requires updating `react` and `react-dom` along with `@types/react`/`@types/react-dom`.
  - Recommended steps:
    1. Read React 19 migration guide and changelog.
    2. Upgrade `react` and `react-dom` in a separate PR.
    3. Fix any type or runtime issues introduced; run full test/build.

- wagmi -> 3.x (current: 2.19.5)
  - Major changes likely in configuration and hooks; check the wagmi migration guide and changelog.
  - Recommended steps:
    1. Review the v3 migration docs and changelog.
    2. Upgrade `wagmi` in a separate PR and update usages in `src/contexts/WalletContext.tsx`, `src/config/walletConfig.ts`, and any other places.
    3. Run thorough integration testing with wallet flows.

- eslint-plugin-react-hooks -> 7.x (current: 5.2.0)
  - This is an ESLint plugin; API changes are unlikely to affect runtime but may change lint rules or defaults.
  - Recommended steps:
    1. Upgrade in a separate PR and re-run lint to capture new rule warnings.
    2. Adjust code or ESLint config if needed.

Notes:
- I intentionally only applied non-breaking/wanted updates and bumped TypeScript to `~5.9.3`.
- After major upgrades, run `npm audit`, lint, build, and any app-level tests; verify wallet integrations and UI flows.

If you want, I can prepare separate PR(s) and run the React and wagmi migrations step-by-step and make necessary code changes.
