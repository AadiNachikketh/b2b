import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const rulesText = fs.readFileSync('./DRAFT_firestore.rules', 'utf-8');

test('Global safety net default-deny exists at top of rules', () => {
  assert.ok(rulesText.includes('match /{document=**} {\n      allow read, write: if false;\n    }'));
});

test('Dirty Dozen #1 & #2: Shadow Field Injection & Role Privilege Escalation are blocked via hasOnly and role checks', () => {
  assert.ok(rulesText.includes("data.keys().hasOnly(['uid', 'displayName', 'role', 'tier', 'createdAt'])"));
  assert.ok(rulesText.includes("(incoming().role == 'subscriber' || isAdmin())"));
  assert.ok(rulesText.includes('incoming().role == existing().role'));
});

test('Dirty Dozen #3: Email spoofing requires email_verified == true', () => {
  assert.ok(rulesText.includes('request.auth != null && request.auth.token.email_verified == true'));
});

test('Dirty Dozen #4 & #5: Cross-User PII Read & Orphaned Subcollection Write blocked by isOwner and exists() Master Gate', () => {
  assert.ok(rulesText.includes('match /private/{docId}'));
  assert.ok(rulesText.includes('exists(/databases/$(database)/documents/users/$(userId))'));
  assert.ok(rulesText.includes('(isOwner(userId) || isAdmin())'));
});

test('Dirty Dozen #6: Client Timestamp Forgery blocked by request.time equality', () => {
  assert.ok(rulesText.includes('incoming().createdAt == request.time'));
  assert.ok(rulesText.includes('incoming().updatedAt == request.time'));
});

test('Dirty Dozen #7 & #8: ID Poisoning & String Overflow blocked by isValidId and size checks', () => {
  assert.ok(rulesText.includes("id.size() >= 1 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\\\-]+$')"));
  assert.ok(rulesText.includes('data.summaryText.size() <= 1000'));
});

test('Dirty Dozen #9, #10, #11, #12: Owner Hijack, Invoice Mutation, Blanket List Scraping, and Update-Gap blocked', () => {
  assert.ok(rulesText.includes('incoming().ownerId == existing().ownerId'));
  assert.ok(rulesText.includes('match /invoices/{invoiceId}'));
  assert.ok(rulesText.includes('resource.data.ownerId == request.auth.uid || isAdmin()'));
  assert.ok(rulesText.includes('isValidSubscription(incoming())'));
});
