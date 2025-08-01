import { ExpoRoot } from 'expo-router';
import { configureConsoleWarnings } from './src/shared/config/consoleConfig';

// Configurar advertencias de consola
configureConsoleWarnings();

export default function App() {
  const ctx = (require as any).context('./app');
  return <ExpoRoot context={ctx} />;
} 