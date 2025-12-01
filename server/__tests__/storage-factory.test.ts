import { describe, it, expect, beforeEach } from 'vitest';
import { storageFactory } from '../storage-factory';

describe('StorageFactory', () => {
  beforeEach(async () => {
    // Réinitialise la factory avant chaque test
    await storageFactory.initialize();
  });

  it('should initialize without errors', async () => {
    await storageFactory.initialize();
    const backend = storageFactory.getBackend();
    expect(['replit', 'supabase']).toContain(backend);
  });

  it('should detect backend automatically', async () => {
    const backend = storageFactory.getBackend();
    expect(backend).toBeDefined();
    expect(['replit', 'supabase']).toContain(backend);
  });

  it('should switch backend manually', () => {
    const currentBackend = storageFactory.getBackend();
    const targetBackend = currentBackend === 'replit' ? 'supabase' : 'replit';

    storageFactory.setBackend(targetBackend);
    expect(storageFactory.getBackend()).toBe(targetBackend);

    // Restore
    storageFactory.setBackend(currentBackend);
  });

  it('should return valid storage instance', () => {
    const storage = storageFactory.getStorage();
    expect(storage).toBeDefined();
    expect(storage).toHaveProperty('getUserById');
    expect(storage).toHaveProperty('createUser');
    expect(storage).toHaveProperty('createSignupSession');
  });

  it('should provide storage proxy methods', async () => {
    // Test que les méthodes proxy fonctionnent
    const result = await storageFactory.getStorage().getUserById('test-id');
    // Devrait retourner undefined ou un user, jamais une erreur
    expect(result === undefined || typeof result === 'object').toBe(true);
  });
});
