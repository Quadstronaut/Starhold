# Peridot privacy policy

Last updated: 17 November 2026

Peridot is a menstrual cycle tracking app for Android made by Starhold (COPPER JERKY LLC). This policy explains what happens to the information you put into Peridot.

## Summary

- Your cycle records are stored on your phone, encrypted.
- Starhold runs no servers for Peridot and receives none of your data.
- Data leaves your phone only when you use circles (encrypted, through public Nostr relays), sign in (with Google) or turn on backup to your Google Drive (encrypted on your phone first; off by default).
- Peridot contains no advertising, analytics or crash-reporting software.

## Information stored on your phone

Peridot stores the following on your phone:

- cycle records: period days, flow, symptoms and their severity, mood, sleep hours and custom tags you log;
- circle information: circle names, member display names and public keys, circle keys, approval votes;
- sign-in information: the ID and display name of the Google account you signed in with, and a Google refresh token used to keep you signed in; if you turn on Google Drive backup, a second Google refresh token that lets Peridot reach its backup folder;
- settings: reminder lead times, relay list, sharing choices.

The database is encrypted with SQLCipher. Its key is derived from a random secret created on your phone and kept in Android secure storage. Android's own automatic backup and device-to-device transfer are turned off for Peridot, so Android does not copy this data to your Google account. Peridot's optional Google Drive backup, described below, is separate and is off unless you turn it on.

## Information that leaves your phone

**Circles (optional).** A circle is a group of up to 12 people you choose. When you are in a circle, Peridot sends the entries that circle is set to receive (period days, and symptoms only if you turn that on for the circle) to the other members through Nostr relays.

- Entries are encrypted on your phone with a key that only the circle's members hold before they are sent. The relays, Starhold and anyone else in between cannot read them.
- Nostr relays are servers run by independent third parties, not by Starhold. The default relays are relay.damus.io, nos.lol, relay.primal.net and nostr.mom. You can change the list in Settings > Relay management.
- Relays can see, and may store, technical information that is not encrypted: your Peridot public key, the random ID of each circle, the time of each event, the type of event, the public keys of members an event is addressed to, approval votes, and the IP address your phone connects from.
- The circle name, sent when a circle key is shared with a member, and your display name, sent when you ask to join a circle, are encrypted to the one person they are for. Relays cannot read them.
- Each relay's own privacy policy applies to what it stores. Peridot asks relays to delete your circle entries when you delete your data (see below), but cannot force a relay to comply.

**Sign-in.** Peridot uses Google sign-in. You authenticate with Google directly; Google returns your account ID, name and profile picture link to the app. Peridot keeps the ID and name on your phone and does not send them to Starhold. Google's privacy policy applies to the sign-in itself. Your encryption keys do not depend on your Google account, and signing in sends no cycle data to Google.

**Backup to your Google Drive (optional).** Off by default. If you turn it on in Settings > Data > Google Drive backup, Peridot asks Google for access to one hidden folder in your Google Drive that only Peridot can use. Peridot cannot see or change your other Drive files.

- Peridot keeps one file in that folder: a copy of your cycle records, the entries and display names that members of your circles shared with you, your circle information, and the ID and display name of your sign-in account.
- The file is encrypted on your phone before it is uploaded, with a key made from your Recovery Key. Google can see that the file exists, its size and when it was created and changed, but cannot read it. Starhold never receives it.
- The file is updated in the background after your data changes, at most once every 15 minutes, and when you tap Back up now.
- To restore it on a new phone you need your Recovery Key. Without it the file cannot be opened.
- To stop, turn the switch off: Peridot stops uploading and offers to delete the file. If backup is on, Delete all data also deletes the file. A file you kept when turning backup off stays in your Drive until you delete it there: drive.google.com > Settings > Manage apps > Peridot > Options > Delete hidden app data. You can remove Peridot's access to your Drive at myaccount.google.com.
- Google's privacy policy applies to your Google Drive.

**Notifications.** Period reminders are scheduled on your phone. No push-notification service is used.

## What Starhold receives

Nothing. Starhold operates no server for Peridot, has no Peridot account database and cannot see, export or hand over your records. If Starhold is sold, closes or receives a legal demand, there is no Peridot user data on Starhold's side to transfer or disclose.

## Your choices and controls

- **Export:** Settings > Data > Export data writes your history as JSON, plaintext or encrypted.
- **Delete:** Settings > Data > Delete all data erases the local database and secure storage on your phone, cancels scheduled reminders and asks the relays to delete the circle entries, heartbeats and membership records you published (Nostr NIP-09 deletion requests). If Google Drive backup is on, it also deletes the backup file from your Drive, or tells you if Drive could not be reached.
- **Google Drive backup:** off by default; turn it on or off in Settings > Data > Google Drive backup.
- **Leave a circle:** possible at any time; the circle's key is replaced so later entries are unreadable to you.
- **Relays:** add or remove relays in Settings > Relay management.
- **Uninstalling** Peridot removes its data from your phone.

## Recovery Key

On first sign-in Peridot creates a 24-word Recovery Key. It recreates your identity and keys on a new phone. It is shown only on your phone, behind your screen lock. Starhold has no copy. If you lose your phone and your Recovery Key, records that existed only on that phone cannot be recovered. A Google Drive backup does not change this: it can only be opened with the Recovery Key.

## Health information and medical use

Cycle records are health information. Peridot does not sell it, does not use it for advertising and does not share it with anyone except the circle members you choose. If you turn on Google Drive backup, it is stored in your own Drive only in encrypted form that Google cannot read. Peridot is not a medical device. Its predictions are statistical estimates, not medical advice.

## Children

Peridot is intended for people 18 and over and is not directed at children.

## Security

Encryption at rest (SQLCipher), end-to-end encryption for circle data (XChaCha20-Poly1305; circle keys exchanged with NIP-44), encryption on the phone for the Google Drive backup (XChaCha20-Poly1305, key derived from the Recovery Key), TLS for every network connection (wss:// relays, https:// Google). No method of storage or transmission is perfectly secure; Peridot's design aims to make Starhold unable to access your records at all.

## Changes

Changes to this policy will be posted at this address with a new date.

## Contact

Starhold, COPPER JERKY LLC. Email: hello@starhold.dev. Website: https://starhold.dev
