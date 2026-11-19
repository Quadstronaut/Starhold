# Delete your Peridot data

Peridot is a menstrual cycle tracking app for Android made by Starhold (COPPER JERKY LLC).

## There is no Peridot account to delete on our side

Starhold runs no servers that hold Peridot data. There is no Peridot account, account database or copy of your records on any Starhold server, so there is nothing for Starhold to delete and no deletion request to send us. The one exception is a problem report you chose to send (see "Problem reports" below). Everything Peridot keeps is on your phone, plus, if you use Google Drive backup, one encrypted file in your own Google Drive. You delete it in the app, or, for a backup file you kept, in Google Drive.

## How to delete your data

1. Open Peridot.
2. Go to Settings > Data > Delete all data and confirm.

Before you confirm, the screen says what will be deleted, what Peridot can only ask others to delete, and what it cannot check. Afterwards it says what happened.

This erases, on your phone: the encrypted database (cycle records, symptoms, circles, settings), the keys in Android secure storage, your sign-in information and your scheduled reminders. It takes effect immediately and cannot be undone. Export your history first (Settings > Data > Export data) if you want to keep a copy. Files you exported are not touched.

If you were in a circle, it also does three things on every relay Peridot uses. It replaces each circle entry you shared with an empty, encrypted deletion record (relays keep only the newest version of such an entry, so this overwrites the old one). It asks the relays to delete your circle entries, heartbeats and membership records (Nostr NIP-09 deletion requests). And it takes you out of your circles, so the other members' apps remove your entries and change the circle key. Those entries were encrypted on your phone, and relays could never read them. If a relay cannot be reached, Peridot keeps the requests on your phone, with no cycle data in them, and sends them whenever it is open and online, for up to 30 days. If you were never in a circle, nothing you logged ever reached a relay.

Afterwards your Recovery Key opens an empty identity: restoring it does not bring this data back or rejoin your old circles, unless you restore a Google Drive backup file that is still there. Anyone who has your Recovery Key could still decrypt a copy a relay kept, so destroy the written key if you will not use it again.

If Google Drive backup is on, Delete all data also deletes the backup file from your Google Drive and removes Peridot's access to it. The confirmation screen says so. If a backup upload is still running when you confirm, Peridot waits up to 30 seconds for it; if it is still running after that, the app says so: the upload deletes its own file when it ends, and if Google Drive cannot be reached at that moment, the file stays in your Drive until you delete it there (see below). If Drive cannot be reached (for example, no internet connection), Peridot tells you before erasing anything on your phone; if you delete anyway, the data on your phone is erased and the backup file stays in your Drive, still encrypted.

If Google Drive backup is off, Delete all data does not touch Google Drive. A backup file you kept when turning backup off stays there until you delete it (see below); when Peridot knows such a file exists, or has not checked, the confirmation screen says so. After a Recovery Key restore you can check in Settings > Data > Google Drive backup.

## Google Drive backup

To delete only the backup, turn off Settings > Data > Google Drive backup and choose Delete file. You can also delete it without the app: open drive.google.com > Settings > Manage apps > Peridot > Options > Delete hidden app data. The backup is encrypted with a key made from your Recovery Key; nobody without that key can read it.

## Uninstalling

Uninstalling Peridot removes all of its data from your phone. Uninstalling alone does not ask the relays to delete anything and does not delete a Google Drive backup. If you used circles, or Google Drive backup is on, use Delete all data first. A backup file you kept when turning backup off is deleted by neither: delete it in Google Drive (see above). Circle entries left on a relay stay encrypted: nobody without that circle's key can read them.

## What may remain

- **Relays:** Nostr relays are run by independent third parties. Peridot overwrites and asks them to delete your circle entries, but cannot force a relay to comply or check what it did. Anything a relay keeps is encrypted and unreadable to it.
- **Circle members:** entries you shared with a circle before deleting are already on the phones of its members, inside their own Peridot app. Leaving the circle or deleting your data stops anything new from reaching them, and deleting your data tells their apps to remove your entries; an app that is not updated or never comes online again may keep them.
- **Google Drive backup:** if Drive could not be reached when you deleted your data, or you kept the file when turning backup off, the encrypted backup file stays in your Drive until you delete it there (see above).
- **Google sign-in:** to remove Peridot's access to your Google account, open your Google Account (myaccount.google.com) > Security > Your connections to third-party apps and services, choose Peridot and remove its access.

## Problem reports

A problem report sent from the app without a contact address, or from the feedback form without one, is not linked to you or your Peridot identity, so Starhold cannot find it to delete it on request. If you added a contact address, write to hello@starhold.dev from that address and Starhold will delete the report (a GitHub issue in a private repository).

## Contact

Starhold, COPPER JERKY LLC. Email: hello@starhold.dev. Website: https://starhold.dev
