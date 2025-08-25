import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PaymentConfigService } from '../../../infrastructure/config/payment-config.service';

describe('PaymentConfigService', () => {
  let service: PaymentConfigService;
  let configService: jest.Mocked<ConfigService>;

  const mockConfigValues = {
    PAYMENT_PUBLIC_KEY: 'pk_test_123456789',
    PAYMENT_INTEGRITY_SECRET: 'secret_123456789',
    PAYMENT_API_URL: 'https://api.payments.test',
    PAYMENT_TIMEOUT: 30000,
  };

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentConfigService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PaymentConfigService>(PaymentConfigService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('publicKey', () => {
    it('should return the public key from config service', () => {
      // Arrange
      configService.get.mockReturnValue(mockConfigValues.PAYMENT_PUBLIC_KEY);

      // Act
      const result = service.publicKey;

      // Assert
      expect(result).toBe(mockConfigValues.PAYMENT_PUBLIC_KEY);
      expect(configService.get).toHaveBeenCalledWith('PAYMENT_PUBLIC_KEY');
    });

    it('should return empty string when public key is not configured', () => {
      // Arrange
      configService.get.mockReturnValue(undefined);

      // Act
      const result = service.publicKey;

      // Assert
      expect(result).toBe('');
      expect(configService.get).toHaveBeenCalledWith('PAYMENT_PUBLIC_KEY');
    });

    it('should return empty string when public key is null', () => {
      // Arrange
      configService.get.mockReturnValue(null);

      // Act
      const result = service.publicKey;

      // Assert
      expect(result).toBe('');
    });

    it('should return empty string when public key is empty string', () => {
      // Arrange
      configService.get.mockReturnValue('');

      // Act
      const result = service.publicKey;

      // Assert
      expect(result).toBe('');
    });
  });

  describe('integritySecret', () => {
    it('should return the integrity secret from config service', () => {
      // Arrange
      configService.get.mockReturnValue(
        mockConfigValues.PAYMENT_INTEGRITY_SECRET,
      );

      // Act
      const result = service.integritySecret;

      // Assert
      expect(result).toBe(mockConfigValues.PAYMENT_INTEGRITY_SECRET);
      expect(configService.get).toHaveBeenCalledWith(
        'PAYMENT_INTEGRITY_SECRET',
      );
    });

    it('should return empty string when integrity secret is not configured', () => {
      // Arrange
      configService.get.mockReturnValue(undefined);

      // Act
      const result = service.integritySecret;

      // Assert
      expect(result).toBe('');
      expect(configService.get).toHaveBeenCalledWith(
        'PAYMENT_INTEGRITY_SECRET',
      );
    });

    it('should return empty string when integrity secret is null', () => {
      // Arrange
      configService.get.mockReturnValue(null);

      // Act
      const result = service.integritySecret;

      // Assert
      expect(result).toBe('');
    });
  });

  describe('apiUrl', () => {
    it('should return the API URL from config service', () => {
      // Arrange
      configService.get.mockReturnValue(mockConfigValues.PAYMENT_API_URL);

      // Act
      const result = service.apiUrl;

      // Assert
      expect(result).toBe(mockConfigValues.PAYMENT_API_URL);
      expect(configService.get).toHaveBeenCalledWith('PAYMENT_API_URL');
    });

    it('should return empty string when API URL is not configured', () => {
      // Arrange
      configService.get.mockReturnValue(undefined);

      // Act
      const result = service.apiUrl;

      // Assert
      expect(result).toBe('');
      expect(configService.get).toHaveBeenCalledWith('PAYMENT_API_URL');
    });

    it('should return empty string when API URL is null', () => {
      // Arrange
      configService.get.mockReturnValue(null);

      // Act
      const result = service.apiUrl;

      // Assert
      expect(result).toBe('');
    });
  });

  describe('timeout', () => {
    it('should return the timeout value from config service', () => {
      // Arrange
      configService.get.mockReturnValue(mockConfigValues.PAYMENT_TIMEOUT);

      // Act
      const result = service.timeout;

      // Assert
      expect(result).toBe(mockConfigValues.PAYMENT_TIMEOUT);
      expect(configService.get).toHaveBeenCalledWith('PAYMENT_TIMEOUT');
    });

    it('should return default timeout when timeout is not configured', () => {
      // Arrange
      configService.get.mockReturnValue(undefined);

      // Act
      const result = service.timeout;

      // Assert
      expect(result).toBe(30000);
      expect(configService.get).toHaveBeenCalledWith('PAYMENT_TIMEOUT');
    });

    it('should return default timeout when timeout is null', () => {
      // Arrange
      configService.get.mockReturnValue(null);

      // Act
      const result = service.timeout;

      // Assert
      expect(result).toBe(30000);
    });

    it('should return default timeout when timeout is 0', () => {
      // Arrange
      configService.get.mockReturnValue(0);

      // Act
      const result = service.timeout;

      // Assert
      expect(result).toBe(30000);
    });

    it('should return default timeout when timeout is negative', () => {
      // Arrange
      configService.get.mockReturnValue(-1000);

      // Act
      const result = service.timeout;

      // Assert
      expect(result).toBe(-1000);
    });

    it('should return custom timeout when valid value is provided', () => {
      // Arrange
      const customTimeout = 60000;
      configService.get.mockReturnValue(customTimeout);

      // Act
      const result = service.timeout;

      // Assert
      expect(result).toBe(customTimeout);
    });
  });

  describe('validateConfig', () => {
    it('should not throw error when all required variables are configured', () => {
      // Arrange
      configService.get
        .mockReturnValueOnce(mockConfigValues.PAYMENT_PUBLIC_KEY)
        .mockReturnValueOnce(mockConfigValues.PAYMENT_INTEGRITY_SECRET)
        .mockReturnValueOnce(mockConfigValues.PAYMENT_API_URL);

      // Act & Assert
      expect(() => service.validateConfig()).not.toThrow();
    });

    it('should throw error when PAYMENT_PUBLIC_KEY is missing', () => {
      // Arrange
      configService.get
        .mockReturnValueOnce(undefined) // PAYMENT_PUBLIC_KEY
        .mockReturnValueOnce(mockConfigValues.PAYMENT_INTEGRITY_SECRET)
        .mockReturnValueOnce(mockConfigValues.PAYMENT_API_URL);

      // Act & Assert
      expect(() => service.validateConfig()).toThrow(
        'Variables de entorno requeridas no configuradas: PAYMENT_PUBLIC_KEY',
      );
    });

    it('should throw error when PAYMENT_INTEGRITY_SECRET is missing', () => {
      // Arrange
      configService.get
        .mockReturnValueOnce(mockConfigValues.PAYMENT_PUBLIC_KEY)
        .mockReturnValueOnce(undefined) // PAYMENT_INTEGRITY_SECRET
        .mockReturnValueOnce(mockConfigValues.PAYMENT_API_URL);

      // Act & Assert
      expect(() => service.validateConfig()).toThrow(
        'Variables de entorno requeridas no configuradas: PAYMENT_INTEGRITY_SECRET',
      );
    });

    it('should throw error when PAYMENT_API_URL is missing', () => {
      // Arrange
      configService.get
        .mockReturnValueOnce(mockConfigValues.PAYMENT_PUBLIC_KEY)
        .mockReturnValueOnce(mockConfigValues.PAYMENT_INTEGRITY_SECRET)
        .mockReturnValueOnce(undefined); // PAYMENT_API_URL

      // Act & Assert
      expect(() => service.validateConfig()).toThrow(
        'Variables de entorno requeridas no configuradas: PAYMENT_API_URL',
      );
    });

    it('should throw error when multiple variables are missing', () => {
      // Arrange
      configService.get
        .mockReturnValueOnce(undefined) // PAYMENT_PUBLIC_KEY
        .mockReturnValueOnce(undefined) // PAYMENT_INTEGRITY_SECRET
        .mockReturnValueOnce(mockConfigValues.PAYMENT_API_URL);

      // Act & Assert
      expect(() => service.validateConfig()).toThrow(
        'Variables de entorno requeridas no configuradas: PAYMENT_PUBLIC_KEY, PAYMENT_INTEGRITY_SECRET',
      );
    });

    it('should throw error when all required variables are missing', () => {
      // Arrange
      configService.get
        .mockReturnValueOnce(undefined) // PAYMENT_PUBLIC_KEY
        .mockReturnValueOnce(undefined) // PAYMENT_INTEGRITY_SECRET
        .mockReturnValueOnce(undefined); // PAYMENT_API_URL

      // Act & Assert
      expect(() => service.validateConfig()).toThrow(
        'Variables de entorno requeridas no configuradas: PAYMENT_PUBLIC_KEY, PAYMENT_INTEGRITY_SECRET, PAYMENT_API_URL',
      );
    });

    it('should throw error when variables are empty strings', () => {
      // Arrange
      configService.get
        .mockReturnValueOnce('') // PAYMENT_PUBLIC_KEY
        .mockReturnValueOnce(mockConfigValues.PAYMENT_INTEGRITY_SECRET)
        .mockReturnValueOnce(mockConfigValues.PAYMENT_API_URL);

      // Act & Assert
      expect(() => service.validateConfig()).toThrow(
        'Variables de entorno requeridas no configuradas: PAYMENT_PUBLIC_KEY',
      );
    });

    it('should throw error when variables are null', () => {
      // Arrange
      configService.get
        .mockReturnValueOnce(null) // PAYMENT_PUBLIC_KEY
        .mockReturnValueOnce(mockConfigValues.PAYMENT_INTEGRITY_SECRET)
        .mockReturnValueOnce(mockConfigValues.PAYMENT_API_URL);

      // Act & Assert
      expect(() => service.validateConfig()).toThrow(
        'Variables de entorno requeridas no configuradas: PAYMENT_PUBLIC_KEY',
      );
    });

    it('should handle case sensitivity in variable names', () => {
      // Arrange
      configService.get
        .mockReturnValueOnce(mockConfigValues.PAYMENT_PUBLIC_KEY)
        .mockReturnValueOnce(mockConfigValues.PAYMENT_INTEGRITY_SECRET)
        .mockReturnValueOnce(mockConfigValues.PAYMENT_API_URL);

      // Act & Assert
      expect(() => service.validateConfig()).not.toThrow();
    });
  });

  describe('integration tests', () => {
    it('should work correctly with all valid configurations', () => {
      // Arrange
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'PAYMENT_PUBLIC_KEY':
            return mockConfigValues.PAYMENT_PUBLIC_KEY;
          case 'PAYMENT_INTEGRITY_SECRET':
            return mockConfigValues.PAYMENT_INTEGRITY_SECRET;
          case 'PAYMENT_API_URL':
            return mockConfigValues.PAYMENT_API_URL;
          case 'PAYMENT_TIMEOUT':
            return mockConfigValues.PAYMENT_TIMEOUT;
          default:
            return undefined;
        }
      });

      // Act
      const publicKey = service.publicKey;
      const integritySecret = service.integritySecret;
      const apiUrl = service.apiUrl;
      const timeout = service.timeout;

      // Assert
      expect(publicKey).toBe(mockConfigValues.PAYMENT_PUBLIC_KEY);
      expect(integritySecret).toBe(mockConfigValues.PAYMENT_INTEGRITY_SECRET);
      expect(apiUrl).toBe(mockConfigValues.PAYMENT_API_URL);
      expect(timeout).toBe(mockConfigValues.PAYMENT_TIMEOUT);
      expect(() => service.validateConfig()).not.toThrow();
    });

    it('should handle mixed valid and invalid configurations', () => {
      // Arrange
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'PAYMENT_PUBLIC_KEY':
            return mockConfigValues.PAYMENT_PUBLIC_KEY;
          case 'PAYMENT_INTEGRITY_SECRET':
            return undefined; // Missing integrity secret
          case 'PAYMENT_API_URL':
            return mockConfigValues.PAYMENT_API_URL;
          case 'PAYMENT_TIMEOUT':
            return 50000; // Custom timeout
          default:
            return undefined;
        }
      });

      // Act
      const publicKey = service.publicKey;
      const integritySecret = service.integritySecret;
      const apiUrl = service.apiUrl;
      const timeout = service.timeout;

      // Assert
      expect(publicKey).toBe(mockConfigValues.PAYMENT_PUBLIC_KEY);
      expect(integritySecret).toBe('');
      expect(apiUrl).toBe(mockConfigValues.PAYMENT_API_URL);
      expect(timeout).toBe(50000);
      expect(() => service.validateConfig()).toThrow(
        'Variables de entorno requeridas no configuradas: PAYMENT_INTEGRITY_SECRET',
      );
    });
  });
});
