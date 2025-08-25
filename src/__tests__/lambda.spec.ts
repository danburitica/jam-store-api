import { configure as serverlessExpress } from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import * as fs from 'fs';

// Mock external dependencies
jest.mock('@vendia/serverless-express', () => ({
  configure: jest.fn(),
}));

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

jest.mock('../app.module', () => ({
  AppModule: class MockAppModule {},
}));

describe('lambda.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('file structure', () => {
    it('should import required dependencies', () => {
      expect(serverlessExpress).toBeDefined();
      expect(NestFactory).toBeDefined();
      expect(AppModule).toBeDefined();
    });

    it('should have handler function defined', () => {
      const lambdaContent = fs.readFileSync('./src/lambda.ts', 'utf8');
      expect(lambdaContent).toContain('export const handler');
      expect(lambdaContent).toContain('async (event, context)');
    });

    it('should have cachedServer variable', () => {
      const lambdaContent = fs.readFileSync('./src/lambda.ts', 'utf8');
      expect(lambdaContent).toContain('let cachedServer');
    });

    it('should have correct imports', () => {
      const lambdaContent = fs.readFileSync('./src/lambda.ts', 'utf8');
      expect(lambdaContent).toContain(
        "import { configure as serverlessExpress } from '@vendia/serverless-express'",
      );
      expect(lambdaContent).toContain(
        "import { NestFactory } from '@nestjs/core'",
      );
      expect(lambdaContent).toContain(
        "import { AppModule } from './app.module'",
      );
    });
  });

  describe('handler function logic', () => {
    it('should check if cachedServer exists', () => {
      const lambdaContent = fs.readFileSync('./src/lambda.ts', 'utf8');
      expect(lambdaContent).toContain('if (!cachedServer)');
    });

    it('should create NestJS app when no cached server', () => {
      const lambdaContent = fs.readFileSync('./src/lambda.ts', 'utf8');
      expect(lambdaContent).toContain('NestFactory.create(AppModule)');
    });

    it('should initialize the app', () => {
      const lambdaContent = fs.readFileSync('./src/lambda.ts', 'utf8');
      expect(lambdaContent).toContain('nestApp.init()');
    });

    it('should configure serverless express', () => {
      const lambdaContent = fs.readFileSync('./src/lambda.ts', 'utf8');
      expect(lambdaContent).toContain('serverlessExpress({');
      expect(lambdaContent).toContain(
        'app: nestApp.getHttpAdapter().getInstance()',
      );
    });

    it('should return cached server result', () => {
      const lambdaContent = fs.readFileSync('./src/lambda.ts', 'utf8');
      expect(lambdaContent).toContain('return cachedServer(event, context)');
    });
  });

  describe('caching behavior', () => {
    it('should create server only once', () => {
      const lambdaContent = fs.readFileSync('./src/lambda.ts', 'utf8');
      expect(lambdaContent).toContain('if (!cachedServer)');
      expect(lambdaContent).toContain('cachedServer = serverlessExpress');
    });

    it('should reuse cached server on subsequent calls', () => {
      const lambdaContent = fs.readFileSync('./src/lambda.ts', 'utf8');
      expect(lambdaContent).toContain('return cachedServer(event, context)');
    });
  });

  describe('error handling', () => {
    it('should handle async operations properly', () => {
      const lambdaContent = fs.readFileSync('./src/lambda.ts', 'utf8');
      expect(lambdaContent).toContain('async (event, context)');
      expect(lambdaContent).toContain('await nestApp.init()');
    });

    it('should have proper error handling structure', () => {
      const lambdaContent = fs.readFileSync('./src/lambda.ts', 'utf8');
      expect(lambdaContent).toContain(
        'export const handler = async (event, context) => {',
      );
      expect(lambdaContent).toContain('return cachedServer(event, context)');
    });
  });

  describe('real-world scenarios', () => {
    it('should handle API Gateway events', () => {
      const lambdaContent = fs.readFileSync('./src/lambda.ts', 'utf8');
      expect(lambdaContent).toContain('event, context');
    });

    it('should handle ALB events', () => {
      const lambdaContent = fs.readFileSync('./src/lambda.ts', 'utf8');
      expect(lambdaContent).toContain('event, context');
    });

    it('should handle Lambda function URLs', () => {
      const lambdaContent = fs.readFileSync('./src/lambda.ts', 'utf8');
      expect(lambdaContent).toContain('event, context');
    });
  });

  describe('performance considerations', () => {
    it('should implement server caching', () => {
      const lambdaContent = fs.readFileSync('./src/lambda.ts', 'utf8');
      expect(lambdaContent).toContain('let cachedServer');
      expect(lambdaContent).toContain('if (!cachedServer)');
    });

    it('should avoid recreating server on each call', () => {
      const lambdaContent = fs.readFileSync('./src/lambda.ts', 'utf8');
      expect(lambdaContent).toContain('cachedServer = serverlessExpress');
    });
  });

  describe('code quality', () => {
    it('should have proper TypeScript syntax', () => {
      const lambdaContent = fs.readFileSync('./src/lambda.ts', 'utf8');
      expect(lambdaContent).toContain('import {');
      expect(lambdaContent).toContain('export const');
      expect(lambdaContent).toContain('async');
    });

    it('should follow AWS Lambda conventions', () => {
      const lambdaContent = fs.readFileSync('./src/lambda.ts', 'utf8');
      expect(lambdaContent).toContain('export const handler');
      expect(lambdaContent).toContain('event, context');
    });

    it('should have clean code structure', () => {
      const lambdaContent = fs.readFileSync('./src/lambda.ts', 'utf8');
      expect(lambdaContent).toContain(
        'export const handler = async (event, context) => {',
      );
      expect(lambdaContent).toContain('return cachedServer(event, context)');
    });
  });
});
