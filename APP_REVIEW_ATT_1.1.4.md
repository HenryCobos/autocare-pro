# App Review — ATT (Guideline 2.1) — Version 1.1.4

Submission ID rejected: `59e27df1-27da-47be-ae0d-b000b8dbe71a`

## Notes for App Review Information (paste in English)

```
App Tracking Transparency (ATT)

On a fresh install, the system ATT permission dialog appears immediately after launch,
before any main app content (tabs, onboarding, or analytics). You will briefly see a
blue splash screen labeled "AutoCare Pro"; the ATT dialog follows on top of that screen.

The app uses ATT for TikTok campaign measurement. The TikTok SDK initializes only
after the user responds to the ATT prompt (or if tracking permission was already decided).

How to reproduce the ATT prompt:
1. Delete the app from the device, OR
2. Settings → Privacy & Security → Tracking → disable tracking for this app / reset, then
3. Launch the app from the home screen.

The app runs in iPhone compatibility mode on iPad (iPhone-only UI).

A screen recording demonstrating fresh install → ATT dialog → app flow is attached /
provided in this submission's review notes.
```

## Reply template (Resolution Center)

```
Hello,

Thank you for your review. We have fixed the timing of the App Tracking Transparency
request in version 1.1.4 (new build). The ATT dialog now appears on first launch after
a minimal splash screen, before onboarding or main content and before any third-party
analytics SDK initialization.

We have attached a screen recording on a physical device showing:
- Fresh install (or reset tracking permission)
- ATT permission request on launch
- Continuing into the app after Allow / Ask App Not to Track

Please let us know if you need any additional information.

Best regards,
```

## Screen recording checklist

1. Delete AutoCare from test iPhone or iPad (compatibility mode).
2. Install build 1.1.4 from TestFlight or internal.
3. Record: tap icon → blue gate → **ATT system dialog** → Allow or Deny → onboarding or home.
4. Upload to App Store Connect → App Review Information → Notes (attachment) or reply to rejection thread.

## Release notes (App Store)

```
Mejoras en v1.1.4:

• Corrección en la solicitud del permiso de rastreo (App Tracking Transparency)
• Mejoras de estabilidad
```

## Build commands

```bash
npx eas-cli build --platform ios --profile production
# If eas submit fails with ASC 500, upload the .ipa with Transporter (Mac).
```
