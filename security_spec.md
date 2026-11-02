# Security Specification: Mehula ADMediaTek SaaS & Agency Platform

## 1. Data Invariants
1. **Global Default Deny**: Any path not explicitly matched is strictly denied (`allow read, write: if false;`).
2. **Verified Authentication**: Every write or private read requires `request.auth != null && request.auth.token.email_verified == true`.
3. **PII Split Collection Isolation**: User PII (`email`, `companyName`, `primaryWebsite`) is isolated inside `/users/{userId}/private/info` and is strictly readable and writable only by `isOwner(userId)` or `isAdmin()`.
4. **Master Gate Relational Sync**: `/users/{userId}/private/{docId}` requires verifying that the parent `/users/{userId}` document exists and belongs to `userId`.
5. **Anti-Self-Assigned Privilege**: Users creating `/users/{userId}` can only set `role == 'subscriber'` unless `isAdmin()`. During updates, `role` and `createdAt` are immutable for non-admins.
6. **Temporal Integrity**: All `createdAt` fields on `create` and `updatedAt` fields on `update` must strictly equal `request.time`.
7. **Strict Key & Size Enforcement**: Every entity validation helper enforces `.keys().hasAll(...)`, `.keys().hasOnly(...)`, type safety, and string `.size() <= MAX` boundaries matching `firebase-blueprint.json`.
8. **Secure List Queries**: All `allow list` rules on `/invoices`, `/saved_audits`, and `/tracked_keywords` enforce `resource.data.ownerId == request.auth.uid || isAdmin()` without delegating filtering to the client or performing `get()` inside `list`.

## 2. The "Dirty Dozen" Payloads
1. **Shadow Field Injection**: Creating `/users/user_1` with an extra field `{"isSuperAdmin": true}` -> Rejected by `hasOnly`.
2. **Self-Assigned Admin Role**: Creating `/users/user_1` with `{"role": "admin"}` as a regular user -> Rejected by role check.
3. **Unverified Email Spoof**: Accessing `/users/admin_uid` with `email == 'aadipasso1@gmail.com'` but `email_verified == false` -> Rejected by `email_verified == true`.
4. **Cross-User PII Read**: Authenticated `user_2` attempting `get` on `/users/user_1/private/info` -> Rejected by `isOwner(userId)`.
5. **Orphaned Subcollection Write**: Creating `/users/user_1/private/info` when `/users/user_1` does not exist -> Rejected by `exists()` Master Gate.
6. **Client Timestamp Forgery**: Creating `/invoices/inv_1` with a past/future `createdAt` timestamp instead of `request.time` -> Rejected by `incoming().createdAt == request.time`.
7. **ID Poisoning Attack**: Creating a document with a 300-character or special-character ID -> Rejected by `isValidId()`.
8. **Denial of Wallet String Overflow**: Updating `summaryText` on `/saved_audits/aud_1` with a 50,000-character string -> Rejected by `.size() <= 1000`.
9. **Owner Hijack on Update**: Updating `ownerId` on `/subscriptions/user_1` to `user_2` -> Rejected by `incoming().ownerId == existing().ownerId`.
10. **Terminal Invoice State Mutation**: Updating a `paid` or `void` invoice in `/invoices/{invoiceId}` -> Rejected because invoices are immutable (`allow update, delete: if false`).
11. **Blanket List Scraping**: Running an unfiltered `list` query on `/saved_audits` as `user_2` to read `user_1`'s audits -> Rejected by `resource.data.ownerId == request.auth.uid`.
12. **Update-Gap Type Poisoning**: Updating `amountUsd` in `/subscriptions/user_1` to a string `"free"` -> Rejected because `isValidSubscription(incoming())` wraps the entire `allow update` block.
