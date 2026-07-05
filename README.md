# capture.vezetiv.dev

Protótipo pessoal do ecossistema Vezetiv.dev/Hub. O nome visual provisório do app é **Vozetiv Capture** e o módulo no Hub será **Captura de Voz**.

O MVP roda com Expo, React Native e TypeScript, testado inicialmente em um celular Android físico com Expo Go. A primeira fase usa apenas ferramentas leves de JavaScript.

A base está em Expo SDK 57, conforme definido no `package.json`.

## Requisitos

- Node.js
- npm
- App Expo Go instalado no celular Android físico

Não há etapa inicial com ferramenta nativa local pesada. O fluxo de desenvolvimento começa e termina no Expo Go.

## Rodar no celular com Expo Go

```bash
npm install
npx expo start
```

Depois:

1. Abra o Expo Go no celular Android.
2. Escaneie o QR Code mostrado pelo terminal.
3. Teste gravação, listagem de capturas, reprodução, exclusão e envio para o Hub quando a URL estiver configurada.

Mantenha computador e celular na mesma rede. Se a rede bloquear o modo LAN, use a opção Tunnel no terminal do Expo.

## Configurar envio para o Hub

Para enviar capturas reais, defina a URL base do Hub antes de iniciar o Expo:

```powershell
$env:EXPO_PUBLIC_HUB_API_URL="https://hub.vezetiv.dev"
npm run start:lan
```

O app enviará `multipart/form-data` para:

```text
POST {EXPO_PUBLIC_HUB_API_URL}/api/voice-captures
```

Se `EXPO_PUBLIC_HUB_API_URL` não estiver definida, o app mantém gravação, listagem, reprodução e exclusão locais funcionando, mas mostra um erro claro ao tentar enviar para o Hub.

## Se o Expo Go não abrir pelo QR Code

Use o modo LAN com cache limpo:

```bash
npm run start:lan
```

Depois de trocar dependências ou SDK, feche o Expo Go completamente, abra de novo e escaneie um QR Code novo.

O script `start:lan` roda em modo offline para evitar que o Expo CLI consulte serviços remotos antes de servir o bundle local.

No Expo Go, se o QR Code não funcionar, toque para inserir uma URL manualmente e tente:

```text
exp://SEU_IP_WIFI:8081
```

Exemplo:

```text
exp://192.168.3.117:8081
```

O IP correto é o IPv4 da conexão Wi-Fi do computador. No Windows, consulte com:

```powershell
Get-NetIPAddress -AddressFamily IPv4
```

Se LAN não funcionar por bloqueio de rede, tente o modo Tunnel:

```bash
npm run start:tunnel
```

O modo Tunnel depende do serviço externo usado pelo Expo. Se ele falhar, tente novamente mais tarde ou use outra rede Wi-Fi/hotspot.

## O que este MVP faz

- Gravação rápida por 5, 15 ou 30 minutos.
- Gravação livre com timer crescente.
- Parada manual da gravação.
- Persistência local dos metadados com AsyncStorage.
- Arquivo de áudio salvo no diretório `document` do app.
- Lista de capturas recentes com data, duração e status.
- Tela de detalhes com player de áudio, metadados, exclusão e envio real para o Hub via `multipart/form-data`.
- `src/services/hubApi.ts` concentra o upload e a leitura futura de status remoto.

## Decisões da base mobile

- O fluxo inicial prioriza Expo Go em dispositivo físico Android para manter o projeto simples, barato e sem ferramentas nativas pesadas.
- `expo-audio` foi escolhido por ser biblioteca Expo para gravação e reprodução, compatível com Expo Go.
- AsyncStorage é suficiente nesta fase porque persistimos apenas metadados simples.
- A navegação está em estado local para evitar dependência extra no protótipo.
- Autenticação, IA e integrações externas ficam fora do MVP inicial.

## Builds futuras

Quando for necessário gerar APK, development build ou usar recursos que dependam de configuração nativa, a estratégia será EAS Build na nuvem.

Comandos previstos para essa fase futura:

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

Funcionalidades como gravação em background, foreground service, notificações persistentes ou recursos nativos customizados devem ser tratadas como fase futura e validadas com development build via EAS.

## Preparado para a próxima fase

- Evoluir autenticação e contrato do Hub a partir de `EXPO_PUBLIC_HUB_API_URL`.
- Adicionar autenticação quando o Hub exigir sessão.
- Evoluir status remoto via `getVoiceCaptureStatus`.
- Migrar de AsyncStorage para SQLite se os metadados crescerem ou precisarem de filtros mais ricos.
