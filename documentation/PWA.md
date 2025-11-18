Expo Web Config (app.json)
"web": {
  "output": "static",
  "display": "standalone",
  "backgroundColor": "#FFFFFF",
  "themeColor": "#0A5C3B",
  "favicon": "./assets/icon.png"
}

Build/Deploy
npx expo export --platform web
# deploy dist/ to Firebase Hosting or Vercel


Install UX: Android auto-prompt after engagement; iOS → Share → Add to Home Screen.