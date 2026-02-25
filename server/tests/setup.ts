/**
 * Test Setup — Variables d'environnement pour tests
 */

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only-32chars';
process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/test_db';
process.env.OAUTH_SERVER_URL = 'http://localhost:8080';
process.env.OWNER_OPEN_ID = 'test-owner-openid';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.VITE_APP_ID = 'test-app-id';
