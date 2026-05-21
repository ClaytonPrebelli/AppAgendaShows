# App AgendaShows — React Native (Expo)

## Stack
- React Native 0.81 + Expo SDK 54
- TypeScript strict
- React Navigation (native-stack)
- GitHub Actions + Gradle (APK build)

## Estrutura
```
src/
  theme/          ← Cores, constantes (FORMAS_PAGAMENTO, ESTILOS_MUSICAIS)
  models/         ← Interfaces Show, Contratante, Local
  services/       ↑ api.ts + showService, contratanteService, localService
  components/     ↑ Calendar, ShowCard, StatsCard, ShowModal, AutocompleteField, CurrencyInput, CreateEntityModal
  screens/        ↑ HomeScreen (dashboard + calendário), ShowFormScreen (formulário completo)
App.tsx           ↑ NavigationContainer + Stack Navigator
```

## API
Base URL: `http://localhost:5000` (DEV) / `https://api.claytonprebelli.com.br` (PROD)
Endpoints: `/api/shows`, `/api/contratantes`, `/api/locais`

## Build APK
- Workflow: `.github/workflows/build-apk.yml` (push em main/app/master ou manual)
- Gera APK via `expo prebuild` + Gradle `assembleRelease`
- APK disponível nos artifacts do GitHub Actions

## Commits
- Sempre em português BR
- Commitar e push automático liberado
- Atualizar este arquivo com mudanças relevantes
