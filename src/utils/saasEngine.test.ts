import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSubscriptionAmount,
  calculateProratedUpgrade,
  validateAuditTargetUrl,
  isPrivateOrReservedIp,
  computeAuditScore,
  generateInvoiceNumber,
  AuditCheckItem
} from './saasEngine';

test('calculateSubscriptionAmount returns accurate monthly and annual prices', () => {
  assert.equal(calculateSubscriptionAmount('free', 'monthly'), 0);
  assert.equal(calculateSubscriptionAmount('starter', 'monthly'), 149);
  assert.equal(calculateSubscriptionAmount('starter', 'annual'), 1428);
  assert.equal(calculateSubscriptionAmount('growth', 'monthly'), 399);
  assert.equal(calculateSubscriptionAmount('agency', 'annual'), 9588);
});

test('calculateProratedUpgrade computes exact prorated delta and new limits', () => {
  const upgrade = calculateProratedUpgrade('starter', 'growth', 'monthly', 15);
  // (399 - 149) * 15 / 30 = 125
  assert.equal(upgrade.immediateChargeUsd, 125);
  assert.equal(upgrade.newRecurringAmountUsd, 399);
  assert.equal(upgrade.auditLimit, 100);
  assert.equal(upgrade.keywordLimit, 250);
});

test('validateAuditTargetUrl blocks SSRF vectors and normalizes valid public URLs', () => {
  assert.equal(validateAuditTargetUrl('').valid, false);
  assert.equal(validateAuditTargetUrl('http://localhost:3000').valid, false);
  assert.equal(validateAuditTargetUrl('http://127.0.0.1/admin').valid, false);
  assert.equal(validateAuditTargetUrl('http://169.254.169.254/latest/meta-data/').valid, false);
  assert.equal(validateAuditTargetUrl('http://192.168.1.10').valid, false);
  assert.equal(validateAuditTargetUrl('http://10.0.0.1').valid, false);
  assert.equal(validateAuditTargetUrl('ftp://example.com').valid, false);

  const validRes = validateAuditTargetUrl('example.com/services#top');
  assert.equal(validRes.valid, true);
  assert.equal(validRes.normalizedUrl, 'https://example.com/services');
  assert.equal(validRes.hostname, 'example.com');
});

test('isPrivateOrReservedIp detects RFC1918, loopback, and link-local addresses', () => {
  assert.equal(isPrivateOrReservedIp('127.0.0.1'), true);
  assert.equal(isPrivateOrReservedIp('10.24.0.5'), true);
  assert.equal(isPrivateOrReservedIp('172.16.0.1'), true);
  assert.equal(isPrivateOrReservedIp('192.168.0.1'), true);
  assert.equal(isPrivateOrReservedIp('169.254.169.254'), true);
  assert.equal(isPrivateOrReservedIp('::1'), true);
  assert.equal(isPrivateOrReservedIp('93.184.216.34'), false);
});

test('computeAuditScore calculates weighted score and status counts accurately', () => {
  const sampleChecks: AuditCheckItem[] = [
    {
      id: '1',
      checkName: 'HTTPS',
      category: 'Technical Foundation',
      status: 'pass',
      observedValue: 'HTTPS active',
      explanation: 'Encrypted connection.',
      recommendation: 'None',
      weight: 20
    },
    {
      id: '2',
      checkName: 'Meta Description',
      category: 'On-Page Content',
      status: 'warn',
      observedValue: '175 chars',
      explanation: 'Slightly long.',
      recommendation: 'Trim to 155 chars.',
      weight: 10
    },
    {
      id: '3',
      checkName: 'Canonical Tag',
      category: 'Indexability',
      status: 'fail',
      observedValue: 'Missing',
      explanation: 'No canonical link.',
      recommendation: 'Add self-referencing canonical.',
      weight: 10
    }
  ];

  const summary = computeAuditScore(sampleChecks);
  // Total weight = 40, Earned = 20 + 5 + 0 = 25 -> 25/40 = 62.5 -> 63
  assert.equal(summary.overallScore, 63);
  assert.equal(summary.passedCount, 1);
  assert.equal(summary.warningCount, 1);
  assert.equal(summary.failedCount, 1);
});

test('generateInvoiceNumber formats deterministic invoice IDs', () => {
  const inv = generateInvoiceNumber(Date.UTC(2026, 10, 2), 'user_99ab');
  assert.equal(inv, 'INV-20261102-USER');
});
