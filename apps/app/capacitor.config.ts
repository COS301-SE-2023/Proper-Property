import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.proper-property.app',
  appName: 'properproperty',
  webDir: '../../dist/apps/app',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
  },
};

export default config;
