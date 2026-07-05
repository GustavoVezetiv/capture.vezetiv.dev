import type { CaptureStatus } from '../types/capture';

export function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${minutes}:${pad(seconds)}`;
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatStatus(status: CaptureStatus): string {
  const labels: Record<CaptureStatus, string> = {
    local: 'Local',
    enviando: 'Enviando',
    enviado: 'Enviado',
    processado: 'Processado',
    erro: 'Erro',
    enviado_mock: 'Enviado mock',
  };

  return labels[status];
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}
