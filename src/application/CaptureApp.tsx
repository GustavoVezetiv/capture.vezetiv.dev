import { useCallback, useState } from 'react';

import { CaptureDetailsScreen } from '../screens/CaptureDetailsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { VoiceCapture } from '../types/capture';

export function CaptureApp() {
  const [captures, setCaptures] = useState<VoiceCapture[]>([]);
  const [selectedCaptureId, setSelectedCaptureId] = useState<string | null>(null);

  const selectedCapture = captures.find((capture) => capture.id === selectedCaptureId) ?? null;

  const handleCapturesChange = useCallback((nextCaptures: VoiceCapture[]) => {
    setCaptures(nextCaptures);
  }, []);

  const handleCaptureUpdated = (updatedCapture: VoiceCapture) => {
    setCaptures((currentCaptures) =>
      currentCaptures.map((capture) => (capture.id === updatedCapture.id ? updatedCapture : capture)),
    );
  };

  const handleCaptureDeleted = (id: string) => {
    setCaptures((currentCaptures) => currentCaptures.filter((capture) => capture.id !== id));
    setSelectedCaptureId(null);
  };

  if (selectedCapture) {
    return (
      <CaptureDetailsScreen
        capture={selectedCapture}
        onBack={() => setSelectedCaptureId(null)}
        onCaptureDeleted={handleCaptureDeleted}
        onCaptureUpdated={handleCaptureUpdated}
      />
    );
  }

  return (
    <HomeScreen
      captures={captures}
      onCapturesChange={handleCapturesChange}
      onOpenCapture={(capture) => setSelectedCaptureId(capture.id)}
    />
  );
}
