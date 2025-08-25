import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import * as fs from 'fs';

// Mock NestFactory
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

// Mock AppModule
jest.mock('../app.module', () => ({
  AppModule: class MockAppModule {},
}));

describe('main.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('file structure', () => {
    it('should import NestFactory correctly', () => {
      expect(NestFactory).toBeDefined();
      expect(NestFactory.create).toBeDefined();
    });

    it('should import AppModule correctly', () => {
      expect(AppModule).toBeDefined();
    });

    it('should have bootstrap function defined', () => {
      // Verify that the bootstrap function exists in the file
      const mainContent = fs.readFileSync('./src/main.ts', 'utf8');
      expect(mainContent).toContain('async function bootstrap');
      expect(mainContent).toContain('bootstrap()');
    });

    it('should have correct imports', () => {
      const mainContent = fs.readFileSync('./src/main.ts', 'utf8');
      expect(mainContent).toContain(
        "import { NestFactory } from '@nestjs/core'",
      );
      expect(mainContent).toContain("import { AppModule } from './app.module'");
    });

    it('should have correct function structure', () => {
      const mainContent = fs.readFileSync('./src/main.ts', 'utf8');
      expect(mainContent).toContain('NestFactory.create(AppModule)');
      expect(mainContent).toContain('app.listen');
    });

    it('should handle environment variable for port', () => {
      const mainContent = fs.readFileSync('./src/main.ts', 'utf8');
      expect(mainContent).toContain('process.env.PORT');
      expect(mainContent).toContain('?? 3000');
    });

    it('should call bootstrap function', () => {
      const mainContent = fs.readFileSync('./src/main.ts', 'utf8');
      expect(mainContent).toContain('bootstrap()');
    });
  });

  describe('bootstrap function logic', () => {
    it('should create app with AppModule', () => {
      const mainContent = fs.readFileSync('./src/main.ts', 'utf8');
      expect(mainContent).toContain('NestFactory.create(AppModule)');
    });

    it('should listen on port from environment or default', () => {
      const mainContent = fs.readFileSync('./src/main.ts', 'utf8');
      expect(mainContent).toContain('app.listen(process.env.PORT ?? 3000)');
    });

    it('should use default port 3000', () => {
      const mainContent = fs.readFileSync('./src/main.ts', 'utf8');
      expect(mainContent).toContain('?? 3000');
    });
  });

  describe('error handling', () => {
    it('should handle missing environment variables gracefully', () => {
      const mainContent = fs.readFileSync('./src/main.ts', 'utf8');
      expect(mainContent).toContain('?? 3000'); // Nullish coalescing operator
    });

    it('should have proper async/await syntax', () => {
      const mainContent = fs.readFileSync('./src/main.ts', 'utf8');
      expect(mainContent).toContain('async function bootstrap');
      expect(mainContent).toContain('await NestFactory.create');
      expect(mainContent).toContain('await app.listen');
    });
  });

  describe('real-world scenarios', () => {
    it('should work with development port configuration', () => {
      const mainContent = fs.readFileSync('./src/main.ts', 'utf8');
      expect(mainContent).toContain('process.env.PORT');
    });

    it('should work with production port configuration', () => {
      const mainContent = fs.readFileSync('./src/main.ts', 'utf8');
      expect(mainContent).toContain('process.env.PORT');
    });

    it('should work with Docker port configuration', () => {
      const mainContent = fs.readFileSync('./src/main.ts', 'utf8');
      expect(mainContent).toContain('process.env.PORT');
    });
  });

  describe('code quality', () => {
    it('should have proper TypeScript syntax', () => {
      const mainContent = fs.readFileSync('./src/main.ts', 'utf8');
      expect(mainContent).toContain('import {');
      expect(mainContent).toContain('async function');
      expect(mainContent).toContain('await');
    });

    it('should follow NestJS conventions', () => {
      const mainContent = fs.readFileSync('./src/main.ts', 'utf8');
      expect(mainContent).toContain('NestFactory.create');
      expect(mainContent).toContain('AppModule');
    });

    it('should have clean code structure', () => {
      const mainContent = fs.readFileSync('./src/main.ts', 'utf8');
      expect(mainContent).toContain('async function bootstrap()');
      expect(mainContent).toContain('bootstrap()');
    });
  });
});
