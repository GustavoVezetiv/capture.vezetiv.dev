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

export function formatStatus(status: string): string {
  const labels: Record<string, string> = {
    local: 'local',
    enviado: 'enviado',
    processado: 'processado',
    erro: 'erro',
    enviado_mock: 'enviado mock',
  };

  return labels[status] ?? status;
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}
