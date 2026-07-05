import { StatusBar } from 'expo-status-bar';

import { CaptureApp } from './src/application/CaptureApp';

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <CaptureApp />
    </>
  );
}
