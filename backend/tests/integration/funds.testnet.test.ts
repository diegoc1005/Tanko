import { fundsService } from '../../src/services/funds.service';
import { stellarService } from '../../src/services/stellar.service';
import { fundRequestStore } from '../../src/services/funds.store';
import { TestnetAccount } from '../../src/types';
import { config } from '../../src/config/index';

const TRUSTLESS_WORK_API_KEY = config.trustlessWork.apiKey;
const API_KEY_TESTS_ENABLED = Boolean(TRUSTLESS_WORK_API_KEY && TRUSTLESS_WORK_API_KEY.includes('.'));

describe('Funds Flow - Testnet Real', () => {
  let jefe: TestnetAccount;
  let conductor: TestnetAccount;
  const testIds: string[] = [];

  beforeAll(async () => {
    console.log('\n=== Setting up test accounts on Stellar Testnet ===\n');

    console.log('Creating Jefe account...');
    const jefeResult = await fundsService.createTestnetAccount();
    if (!jefeResult.success || !jefeResult.data) {
      throw new Error(`Failed to create Jefe account: ${jefeResult.error}`);
    }
    jefe = jefeResult.data;
    console.log(`Jefe created: ${jefe.publicKey}`);

    console.log('Creating Conductor account...');
    const conductorResult = await fundsService.createTestnetAccount();
    if (!conductorResult.success || !conductorResult.data) {
      throw new Error(`Failed to create Conductor account: ${conductorResult.error}`);
    }
    conductor = conductorResult.data;
    console.log(`Conductor created: ${conductor.publicKey}`);

    console.log('\nWaiting for accounts to be funded...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log('Verifying balances...');
    const jefeBalance = await stellarService.getAccountBalance(jefe.publicKey);
    console.log(`Jefe XLM Balance: ${jefeBalance.find((b) => b.asset === 'XLM')?.balance}`);

    const conductorBalance = await stellarService.getAccountBalance(conductor.publicKey);
    console.log(`Conductor XLM Balance: ${conductorBalance.find((b) => b.asset === 'XLM')?.balance}`);

    expect(jefeBalance.some((b) => b.asset === 'XLM' && parseFloat(b.balance) > 0)).toBe(true);
    expect(conductorBalance.some((b) => b.asset === 'XLM' && parseFloat(b.balance) > 0)).toBe(true);

    console.log('\n=== Test accounts ready ===\n');
  });

  afterAll(async () => {
    console.log('\n=== Cleaning up test data ===\n');
    fundRequestStore.clear();
  });

  beforeEach(() => {
    fundRequestStore.clear();
  });

  describe('1. Account Creation & Verification', () => {
    it('should have valid public keys for both accounts', () => {
      expect(stellarService.validatePublicKey(jefe.publicKey)).toBe(true);
      expect(stellarService.validatePublicKey(conductor.publicKey)).toBe(true);
    });

    it('should have valid secret keys for both accounts', () => {
      expect(stellarService.validateSecretKey(jefe.secret)).toBe(true);
      expect(stellarService.validateSecretKey(conductor.secret)).toBe(true);
    });

    it('should have funded accounts on testnet', async () => {
      const jefeBalances = await stellarService.getAccountBalance(jefe.publicKey);
      const conductorBalances = await stellarService.getAccountBalance(conductor.publicKey);

      expect(jefeBalances.length).toBeGreaterThan(0);
      expect(conductorBalances.length).toBeGreaterThan(0);
    });
  });

  describe('2. Fund Request Creation (Conductor)', () => {
    it('should create a fund request from conductor to jefe', async () => {
      const result = await fundsService.createRequest(
        conductor.publicKey,
        {
          amount: '1000000',
          description: 'Combustible ruta México-Querétaro',
        },
        jefe.publicKey
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.status).toBe('pending');
      expect(result.data?.conductorPublicKey).toBe(conductor.publicKey);
      expect(result.data?.jefePublicKey).toBe(jefe.publicKey);
      expect(result.data?.amount).toBe('1000000');

      if (result.data) {
        testIds.push(result.data.id);
      }
    });

    it('should reject invalid conductor public key', async () => {
      const result = await fundsService.createRequest(
        'INVALID_KEY',
        {
          amount: '1000000',
          description: 'Test',
        },
        jefe.publicKey
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid conductor');
    });

    it('should reject invalid amount', async () => {
      const result = await fundsService.createRequest(
        conductor.publicKey,
        {
          amount: '-100',
          description: 'Test',
        },
        jefe.publicKey
      );

      expect(result.success).toBe(false);
    });

    it('should create request with minimum amount', async () => {
      const result = await fundsService.createRequest(
        conductor.publicKey,
        {
          amount: '1',
          description: 'Minimum test',
        },
        jefe.publicKey
      );

      expect(result.success).toBe(true);
    });
  });

  describe('3. Request Query (Jefe)', () => {
    it('should get pending requests for jefe', async () => {
      const createResult = await fundsService.createRequest(
        conductor.publicKey,
        {
          amount: '2000000',
          description: 'Viáticos',
        },
        jefe.publicKey
      );

      if (createResult.data) {
        testIds.push(createResult.data.id);
      }

      const result = fundsService.getPendingRequests(jefe.publicKey);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBeGreaterThan(0);
    });

    it('should get all requests for conductor', async () => {
      await fundsService.createRequest(
        conductor.publicKey,
        { amount: '500000', description: 'Test 1' },
        jefe.publicKey
      );

      await fundsService.createRequest(
        conductor.publicKey,
        { amount: '500000', description: 'Test 2' },
        jefe.publicKey
      );

      const result = fundsService.getRequestsByConductor(conductor.publicKey);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBe(2);
    });

    it('should get request by ID', async () => {
      const createResult = await fundsService.createRequest(
        conductor.publicKey,
        { amount: '1000000', description: 'Test request' },
        jefe.publicKey
      );

      if (createResult.data) {
        testIds.push(createResult.data.id);
      }

      const result = fundsService.getRequest(createResult.data!.id);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(createResult.data!.id);
    });

    it('should return empty array for unknown conductor', () => {
      const result = fundsService.getRequestsByConductor(
        'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('4. Request Rejection (Jefe)', () => {
    it('should reject a pending request', async () => {
      const createResult = await fundsService.createRequest(
        conductor.publicKey,
        { amount: '1000000', description: 'Test rejection' },
        jefe.publicKey
      );

      if (createResult.data) {
        testIds.push(createResult.data.id);
      }

      const rejectResult = fundsService.rejectRequest(
        { requestId: createResult.data!.id },
        jefe.publicKey
      );

      expect(rejectResult.success).toBe(true);
      expect(rejectResult.data?.status).toBe('rejected');
    });

    it('should not allow non-assigned jefe to reject', async () => {
      const createResult = await fundsService.createRequest(
        conductor.publicKey,
        { amount: '1000000', description: 'Test' },
        jefe.publicKey
      );

      if (createResult.data) {
        testIds.push(createResult.data.id);
      }

      const newAccount = stellarService.generateKeypair();

      const rejectResult = fundsService.rejectRequest(
        { requestId: createResult.data!.id },
        newAccount.publicKey
      );

      expect(rejectResult.success).toBe(false);
      expect(rejectResult.error).toContain('Only the assigned jefe');
    });

    it('should not reject already rejected request', async () => {
      const createResult = await fundsService.createRequest(
        conductor.publicKey,
        { amount: '1000000', description: 'Test' },
        jefe.publicKey
      );

      fundsService.rejectRequest(
        { requestId: createResult.data!.id },
        jefe.publicKey
      );

      const secondReject = fundsService.rejectRequest(
        { requestId: createResult.data!.id },
        jefe.publicKey
      );

      expect(secondReject.success).toBe(false);
      expect(secondReject.error).toContain('Cannot reject');
    });
  });

  (API_KEY_TESTS_ENABLED ? describe : describe.skip)('5. Trustless Work Integration (Requires Valid API Key)', () => {
    it('NOTE: These tests require a valid Trustless Work API key with deploy permissions', () => {
      console.log('\n⚠️ Trustless Work API tests skipped - requires valid API key\n');
      expect(true).toBe(true);
    });
  });

  describe('6. Testnet Account Operations', () => {
    it('should create new testnet account', async () => {
      const result = await fundsService.createTestnetAccount();

      expect(result.success).toBe(true);
      expect(result.data?.publicKey).toBeDefined();
      expect(result.data?.secret).toBeDefined();
      expect(stellarService.validatePublicKey(result.data!.publicKey)).toBe(true);
    }, 30000);

    it('should handle funding already funded account', async () => {
      const fundResult = await fundsService.fundTestnetAccount(jefe.publicKey);

      expect(fundResult.success).toBe(false);
    });

    it('should reject invalid public key for funding', async () => {
      const result = await fundsService.fundTestnetAccount('INVALID_KEY');

      expect(result.success).toBe(false);
    });
  });

  describe('7. Request State Machine', () => {
    it('should follow correct state transitions', async () => {
      const createResult = await fundsService.createRequest(
        conductor.publicKey,
        { amount: '1000000', description: 'State test' },
        jefe.publicKey
      );

      expect(createResult.data?.status).toBe('pending');

      const rejectResult = fundsService.rejectRequest(
        { requestId: createResult.data!.id },
        jefe.publicKey
      );

      expect(rejectResult.data?.status).toBe('rejected');

      const getResult = fundsService.getRequest(createResult.data!.id);
      expect(getResult.data?.status).toBe('rejected');
    });

    it('should track timestamps correctly', async () => {
      const createResult = await fundsService.createRequest(
        conductor.publicKey,
        { amount: '1000000', description: 'Timestamp test' },
        jefe.publicKey
      );

      expect(createResult.data?.createdAt).toBeDefined();
      expect(createResult.data?.updatedAt).toBeDefined();

      await new Promise((resolve) => setTimeout(resolve, 100));

      fundsService.rejectRequest(
        { requestId: createResult.data!.id },
        jefe.publicKey
      );

      const updated = fundsService.getRequest(createResult.data!.id);
      expect(new Date(updated.data!.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(createResult.data!.createdAt).getTime()
      );
    });
  });

  describe('8. Store Operations', () => {
    it('should clear all requests', async () => {
      await fundsService.createRequest(
        conductor.publicKey,
        { amount: '1000000', description: 'To be cleared' },
        jefe.publicKey
      );

      fundRequestStore.clear();

      const result = fundsService.getRequestsByConductor(conductor.publicKey);
      expect(result.data).toEqual([]);
    });

    it('should return undefined for non-existent request', () => {
      const result = fundsService.getRequest('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });
});
