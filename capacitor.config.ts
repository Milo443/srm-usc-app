import { CapacitorConfig } from '@capacitor/cli';
import { config as dotenvConfig } from 'dotenv';

// Carga las variables de entorno según el ambiente
const env = process.env.NODE_ENV || 'development';
dotenvConfig({ path: `.env.${env}` });

const baseConfig: CapacitorConfig = {
  appId: process.env.APP_ID || 'com.myapp.app',
  appName: process.env.APP_NAME || 'MyApp',
  webDir: 'dist',
  plugins: {
    // Aquí puedes agregar configuración de plugins que usen variables de entorno
  },
  server: {
    androidScheme: 'https'
  }
};

const configByEnvironment: { [key: string]: CapacitorConfig } = {
  development: {
    ...baseConfig,
    // Configuraciones específicas para desarrollo
  },
  production: {
    ...baseConfig,
    // Configuraciones específicas para producción
  }
};

const capacitorConfig: CapacitorConfig = configByEnvironment[env] || baseConfig;

export default capacitorConfig; 