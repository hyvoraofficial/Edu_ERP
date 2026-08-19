export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'hyvora-default-secret-key-super-secure-2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  env: process.env.NODE_ENV || 'development',
});
