# Deployment Guide - PnP Conveyancer

## ✅ Successfully Deployed to Vercel!

### 🌐 Live URLs

**Production URL**: https://pnp-conveyancer-ahdjjgik5-way2flyagency-gmailcoms-projects.vercel.app

**Project Dashboard**: https://vercel.com/way2flyagency-gmailcoms-projects/pnp-conveyancer

---

## 📋 Deployment Details

### Configuration
- **Framework**: Expo (React Native Web)
- **Build Command**: `npx expo export --platform web`
- **Output Directory**: `dist`
- **Development Command**: `expo start --web`
- **Node Version**: Auto-detected
- **Region**: Automatic (closest to users)

### GitHub Integration
✅ Connected to: `https://github.com/Uvaancovie/pnp-conveyancing`

**Automatic Deployments**: Every push to `main` branch will trigger a new deployment automatically.

---

## 🚀 Redeployment

### Method 1: Git Push (Recommended)
```bash
git add .
git commit -m "Your commit message"
git push origin main
```
Vercel will automatically detect the push and deploy.

### Method 2: Manual Deployment
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Method 3: Vercel Dashboard
1. Go to https://vercel.com/way2flyagency-gmailcoms-projects/pnp-conveyancer
2. Click "Deployments" tab
3. Click "Redeploy" on any previous deployment

---

## 🔧 Post-Deployment Setup

### 1. Custom Domain (Optional)
1. Go to project settings: https://vercel.com/way2flyagency-gmailcoms-projects/pnp-conveyancer/settings
2. Navigate to "Domains"
3. Add your custom domain (e.g., `pnpconveyancer.co.za`)
4. Follow DNS configuration instructions

### 2. Environment Variables
If you need to add environment variables:
1. Go to Settings → Environment Variables
2. Add variables:
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - etc.
3. Redeploy for changes to take effect

**Note**: Current Firebase config is hardcoded in `lib/firebase.ts` and working fine.

### 3. Build Optimization
Your `vercel.json` is already configured with:
- ✅ SPA routing (all routes → index.html)
- ✅ Cache headers for static assets (1 year)
- ✅ Security headers (XSS, nosniff, frame-options)
- ✅ Singapore region for fast Asia-Pacific delivery

---

## 📱 Testing Your Deployment

### Web App
Visit: https://pnp-conveyancer-ahdjjgik5-way2flyagency-gmailcoms-projects.vercel.app

**Test these features**:
- ✅ Landing page loads
- ✅ Login/Register works
- ✅ All three calculators (Transfer, Bond, Repayment)
- ✅ Firebase Authentication
- ✅ Responsive design (mobile, tablet, desktop)

### Mobile App Downloads
The download buttons point to:
- iOS: `https://expo.dev/artifacts/eas/your-build-id.ipa`
- Android: `/downloads/pnp-conveyancer.apk`

**To enable downloads**:
1. Build mobile apps with EAS:
   ```bash
   # Android
   eas build --platform android --profile production
   
   # iOS
   eas build --platform ios --profile production
   ```

2. Download the built APK/IPA from EAS

3. Create `public/downloads` folder in your project

4. Upload files and redeploy

---

## 🔍 Monitoring & Analytics

### Vercel Analytics (Built-in)
View analytics at: https://vercel.com/way2flyagency-gmailcoms-projects/pnp-conveyancer/analytics

Tracks:
- Page views
- Unique visitors
- Geographic distribution
- Device types
- Performance metrics

### Error Monitoring
View runtime logs: https://vercel.com/way2flyagency-gmailcoms-projects/pnp-conveyancer/logs

---

## 🐛 Troubleshooting

### Issue: Routes not working
**Solution**: Already configured! `vercel.json` has rewrites for SPA routing.

### Issue: Firebase connection errors
**Solution**: 
1. Check Firebase project is active
2. Enable Firestore Database in Firebase Console
3. Verify API keys in `lib/firebase.ts`

### Issue: Slow loading
**Solution**:
1. Check build size: `npx expo export --platform web`
2. Optimize images in `assets/`
3. Enable Vercel's image optimization

### Issue: Mobile app downloads don't work
**Solution**: 
1. Build apps with `eas build`
2. Host APK/IPA files in `public/downloads/`
3. Update URLs in `app/index.tsx`

---

## 📊 Performance

### Current Status
- ✅ Build Time: ~8 seconds
- ✅ Deploy Time: ~8 seconds
- ✅ Build Output: `dist/` directory
- ✅ Static Site Generation: 12 routes
- ✅ JavaScript Bundle: ~3.24 MB (minified)

### Optimization Tips
1. **Code Splitting**: Expo Router handles this automatically
2. **Image Optimization**: Use `expo-image` (already installed)
3. **Caching**: Set via headers in `vercel.json` (already configured)
4. **CDN**: Vercel's Edge Network (automatic)

---

## 🔐 Security

### Current Headers (via vercel.json)
```json
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block"
}
```

### Firebase Security
- ✅ Authentication enabled
- ⚠️ Firestore rules: Currently in test mode
- 🔒 **Action Required**: Update Firestore security rules for production

**Recommended Firestore Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    match /leads/{leadId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.token.role == 'agent';
    }
  }
}
```

---

## 📞 Support

### Vercel Support
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Status: https://www.vercel-status.com/

### Project Issues
- GitHub Issues: https://github.com/Uvaancovie/pnp-conveyancing/issues
- Project Owner: way2flyagency-gmailcom

---

## ✅ Deployment Checklist

- [x] Initial deployment successful
- [x] GitHub integration connected
- [x] Automatic deployments enabled
- [x] SPA routing configured
- [x] Security headers set
- [x] Cache headers optimized
- [ ] Custom domain added (optional)
- [ ] Environment variables configured (if needed)
- [ ] Mobile app builds generated
- [ ] Download links updated
- [ ] Firestore security rules updated
- [ ] Analytics monitoring set up

---

## 🎉 Next Steps

1. **Test the live site**: Visit the production URL and test all features
2. **Share with users**: Your app is now live and accessible worldwide!
3. **Monitor performance**: Check Vercel Analytics regularly
4. **Update content**: Push to GitHub and see automatic deployments
5. **Add custom domain**: Make it professional with your own domain
6. **Build mobile apps**: Generate APK/IPA for download section

---

**Deployed on**: October 13, 2025  
**Deployment Tool**: Vercel CLI v48.2.9  
**Status**: ✅ Live and Running
