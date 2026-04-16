/**
 * @jest-environment node
 */
import { assignQueue, advanceQueue } from '../lib/queue';
import { adminDb } from '../lib/firebase-admin';

// Mock Firebase Admin
jest.mock('../lib/firebase-admin', () => ({
  adminDb: {
    runTransaction: jest.fn(),
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
      })),
      where: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn(),
        })),
      })),
    })),
  },
}));

describe('Queue Assignment Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('assignQueue should fail if user not found', async () => {
    (adminDb.runTransaction as jest.Mock).mockImplementation(async (cb) => {
      const transaction = {
        get: jest.fn().mockResolvedValue({ exists: false }),
        set: jest.fn(),
        update: jest.fn(),
      };
      return cb(transaction);
    });

    const result = await assignQueue('fake-user-id');
    expect(result.success).toBe(false);
    expect(result.error).toBe('user_not_found');
  });

  test('assignQueue should succeed if queues available', async () => {
    (adminDb.runTransaction as jest.Mock).mockImplementation(async (cb) => {
      const transaction = {
        get: jest.fn((ref) => {
          if (ref.path === 'users/user1') return { exists: true, data: () => ({ name: 'Test' }) };
          if (ref.path === 'queues/Q1') return { exists: true, data: () => ({ activeCount: 5, lastAssigned: 10, currentServing: 5, capacity: 50 }) };
          // ... return others
          return { exists: true, data: () => ({ activeCount: 10, capacity: 50 }) };
        }),
        set: jest.fn(),
        update: jest.fn(),
      };
      return cb(transaction);
    });

    // In this mocked scenario, Q1 has the lowest activeCount (5).
    const result = await assignQueue('user1');
    expect(result.success).toBe(true);
    expect(result.queueId).toBe('Q1');
  });
});
