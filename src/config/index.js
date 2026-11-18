import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

// Load environment variables
dotenv.config({ path: path.join(rootDir, '.env') });

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  admin: {
    secretKey: process.env.ADMIN_SECRET_KEY || 'default_dev_secret_key_928374',
    defaultPassword: process.env.ADMIN_PASSWORD || 'admin12345'
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    receiverEmail: process.env.CONTACT_RECEIVER_EMAIL || 'rahuldheeraj.anil@gmail.com'
  },
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5000,http://127.0.0.1:5000')
      .split(',')
      .map(origin => origin.trim())
  },
  paths: {
    root: rootDir,
    public: path.join(rootDir, 'public'),
    data: path.join(rootDir, 'data')
  }
};

