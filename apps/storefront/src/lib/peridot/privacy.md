# Peridot privacy policy

Last updated: 19 November 2026

Peridot is a menstrual cycle tracking app for Android made by Starhold (COPPER JERKY LLC). This policy explains what happens to the information you put into Peridot.

## Summary

- Your cycle records are stored on your phone, encrypted.
- Starhold runs no servers that hold Peridot data and receives none of your data, except a report you choose to send (see "What Starhold receives").
- Data leaves your phone only when you use circles (encrypted, through public Nostr relays), sign in with Google (optional: Peridot also works without a Google account), turn on backup to your Google Drive (encrypted on your phone first; off by default), send a problem report or report a circle member.
- Peridot contains no advertising, analytics or crash-reporting software.

## Information stored on your phone

Peridot stores the following on your phone:

- cycle records: period days, flow, symptoms and their severity, mood, sleep hours and custom tags you log;
- circle information: circle names, member display names and public keys, circle keys, approval votes;
- your block list, if you block someone: the public key of each person you blocked and the display name they had when you blocked them;
- sign-in information, if you sign in with Google: the ID and display name of the Google account you signed in with, and a Google refresh token used to keep you signed in; if you turn on Google Drive backup, a second Google refresh token that lets Peridot reach its backup folder. If you continue without Google, Peridot keeps only the display name you chose for your circles, if any;
- settings: reminder lead times, relay list, sharing choices.

The database is encrypted with SQLCipher. Its key is derived from a random secret created on your phone and kept in Android secure storage. Android's own automatic backup and device-to-device transfer are turned off for Peridot, so Android does not copy this data to your Google account. Peridot's optional Google Drive backup, described below, is separate and is off unless you turn it on.

## Information that leaves your phone

**Circles (optional).** A circle is a group of up to 12 people you choose. When you are in a circle, Peridot sends the entries that circle is set to receive (period days, and symptoms only if you turn that on for the circle) to the other members through Nostr relays.

- Entries are encrypted on your phone with a key that only the circle's members hold before they are sent. The relays, Starhold and anyone else in between cannot read them.
- Nostr relays are servers run by independent third parties, not by Starhold. The default relays are relay.damus.io, nos.lol, relay.primal.net and nostr.mom. You can change the list in Settings > Relay management.
- Relays can see, and may store, technical information that is not encrypted: your Peridot public key, the random ID of each circle, the time of each event, the type of event, the public keys of members an event is addressed to, approval votes, and the IP address your phone connects from. The label that identifies each entry on a relay is a keyed hash that only your Recovery Key can produce, so it does not show which dates you logged, and entries are padded to the same size so their length does not show what kind of entry they are. The time of an event is when it was sent, not the date it describes.
- The circle name, sent when a circle key is shared with a member, and your display name, sent when you ask to join a circle, are encrypted to the one person they are for. Relays cannot read them.
- Each relay's own privacy policy applies to what it stores. Peridot asks relays to delete your circle entries when you delete your data (see below), but cannot force a relay to comply.

**Sign-in (optional).** You can use Peridot without any account: choose "Continue without Google" and nothing about sign-in leaves your phone. If you choose Google sign-in, you authenticate with Google directly; Google returns your account ID, name and profile picture link to the app. Peridot keeps the ID and name on your phone and does not send them to Starhold. Google's privacy policy applies to the sign-in itself. Your encryption keys do not depend on your Google account, and signing in sends no cycle data to Google.

**Backup to your Google Drive (optional).** Off by default. If you turn it on in Settings > Data > Google Drive backup, Peridot asks Google for access to one hidden folder in your Google Drive that only Peridot can use. Peridot cannot see or change your other Drive files.

- Peridot keeps one file in that folder: a copy of your cycle records, the entries and display names that members of your circles shared with you, your circle information, and the ID and display name of your sign-in account.
- The file is encrypted on your phone before it is uploaded, with a key made from your Recovery Key. Google can see that the file exists, its size and when it was created and changed, but cannot read it. Starhold never receives it.
- The file is updated in the background after your data changes, at most once every 15 minutes, and when you tap Back up now.
- To restore it on a new phone you need your Recovery Key. Without it the file cannot be opened.
- To stop, turn the switch off: Peridot stops uploading and offers to delete the file. If backup is on, Delete all data also deletes the file. A file you kept when turning backup off stays in your Drive until you delete it there: drive.google.com > Settings > Manage apps > Peridot > Options > Delete hidden app data. You can remove Peridot's access to your Drive at myaccount.google.com.
- Your block list is not part of the file. After a restore on a new phone, block again anyone you had blocked.
- Google's privacy policy applies to your Google Drive.

**Notifications.** Period reminders are scheduled on your phone. No push-notification service is used.

**Problem reports (optional).** Settings > About > Report a problem sends a report only when you press Send, after showing you exactly what will be sent. It contains the text you wrote; the app version, Android version and phone model only if you switch on device details; and a contact address only if you tick "I would like a reply". It never contains cycle records, symptoms, circle or member names, keys or your Recovery Key. The app encrypts the report on your phone to Starhold's report key, signs it with a one-time key that is not your Peridot identity, and sends it through the Nostr relays it already uses, asking them to drop it after 14 days. Relays see that an encrypted message was sent, its time and the IP address your phone connects from, but cannot read it.

**Reports about a circle member (optional).** In a circle, a member's menu has Report. It sends a report only when you press Send, after showing you exactly what will be sent. It always contains the text you wrote and the public key of the person you are reporting, and the screen says so. It contains their display name only if you tick it, and the symptom tags they share with you only if you tick that. Device details and a contact address are optional in the same way as for a problem report. It never contains your own name, your public key, your cycle records or the reported person's cycle dates. It is sent the same way as a problem report: encrypted on your phone to Starhold's report key, signed with a one-time key that is not your Peridot identity, through the Nostr relays. The person you report is not told. Starhold cannot see circles and cannot remove anyone from one; a report does not change your circle.

**Blocking a circle member.** A member's menu also has Block. Blocking happens on your phone only and sends nothing: the person is not told, and neither is anyone else. Their name, cycle data and symptoms are hidden on your phone, nothing new from them is stored, and their join requests and invites are ignored. A circle has one key for all its members, so Peridot cannot hide your entries from one member only: while a person you blocked is in a circle with you, your new entries are not sent to that circle at all, and they are not sent later. To share with the other members again, propose the person's removal or leave the circle. You can unblock at any time; entries they sent while blocked may be missing afterwards.

**Feedback form.** The web form at https://starhold.dev/peridot/feedback receives what you type and, only if you tick "I would like a reply", a contact address. It sets no cookies, loads nothing from third parties, keeps no access log and stores no IP address, browser details or referrer. A short-lived rate limit keeps only a keyed hash in memory for 10 minutes.

## What Starhold receives

Nothing, unless you send a report. Starhold operates no server that holds Peridot data, has no Peridot account database and cannot see, export or hand over your records. If Starhold is sold, closes or receives a legal demand, there is no Peridot user data on Starhold's side to transfer or disclose.

The one exception is a report you choose to send: a problem report from the app or the feedback form, or a report about a circle member from the app. Starhold receives the text you wrote, plus device details and a contact address only if you added them. A report about a circle member also carries that person's public key, and their display name and the symptom tags they share with you only if you ticked them. Starhold receives nothing else. Each report is kept as an issue in a private GitHub repository, so GitHub (GitHub, Inc.) also stores it; GitHub's privacy policy applies to that storage. Reports are used only to fix problems, to understand what was reported about a member and, if you asked, to reply, and are never copied anywhere public. Starhold cannot act inside a circle on a report: it cannot see circles, read entries or remove a member.

## Your choices and controls

- **Export:** Settings > Data > Export data writes your history as JSON, plaintext or encrypted.
- **Delete:** Settings > Data > Delete all data erases the local database and secure storage on your phone and cancels scheduled reminders. On every relay it uses, it replaces each circle entry you shared with an empty encrypted deletion record, asks the relays to delete your circle entries, heartbeats and membership records (Nostr NIP-09 deletion requests) and takes you out of your circles. Requests that cannot be delivered right away are kept on your phone, with no cycle data in them, and sent when Peridot is next open and online, for up to 30 days. Peridot cannot check what a relay actually deletes, and the screen says so before and after. If Google Drive backup is on, it also deletes the backup file from your Drive, or tells you if Drive could not be reached. Afterwards your Recovery Key opens an empty identity.
- **Google Drive backup:** off by default; turn it on or off in Settings > Data > Google Drive backup.
- **Block or report a circle member:** in the circle, open the member's menu. Block hides them on your phone and pauses your sharing with any circle they are in; unblock from the same menu or the Blocked list on the Circles screen. Report sends Starhold what you choose to send.
- **Leave a circle:** possible at any time; the circle's key is replaced so later entries are unreadable to you.
- **Relays:** add or remove relays in Settings > Relay management.
- **Uninstalling** Peridot removes its data from your phone.

## Recovery Key

When you start, Peridot creates a 24-word Recovery Key. It recreates your identity and keys on a new phone. It is shown once when it is created, and afterwards only behind your screen lock; on a phone with no screen lock it cannot be shown again, and Peridot says so before you continue. Starhold has no copy. If you lose your phone and your Recovery Key, records that existed only on that phone cannot be recovered. A Google Drive backup does not change this: it can only be opened with the Recovery Key.

## Health information and medical use

Cycle records are health information. Peridot does not sell it, does not use it for advertising and does not share it with anyone except the circle members you choose. One case goes to Starhold and only by your choice: a symptom tag a circle member shared with you, if you tick it when you report that member. If you turn on Google Drive backup, it is stored in your own Drive only in encrypted form that Google cannot read. Peridot is not a medical device. Its predictions are statistical estimates, not medical advice.

## Children

Peridot is intended for people 18 and over and is not directed at children.

## Security

Encryption at rest (SQLCipher), end-to-end encryption for circle data (XChaCha20-Poly1305; circle keys exchanged with NIP-44), encryption on the phone for the Google Drive backup (XChaCha20-Poly1305, key derived from the Recovery Key), TLS for every network connection (wss:// relays, https:// Google, https:// feedback form). No method of storage or transmission is perfectly secure; Peridot's design aims to make Starhold unable to access your records at all.

## Changes

Changes to this policy will be posted at this address with a new date.

## Contact

Starhold, COPPER JERKY LLC. Email: hello@starhold.dev. Website: https://starhold.dev
