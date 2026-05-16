# PedalMatch

App de rastreamento e social para ciclistas com modo offline. Participe de pedais, acompanhe seu progresso e suba no ranking!

## Funcionalidades

- **Rastreamento em Tempo Real**: Monitore distância, tempo e velocidade média.
- **Modo Offline**: Grave seus treinos mesmo sem conexão e sincronize depois.
- **Feed de Pedais**: Descubra e junte-se a grupos de ciclistas próximos a você.
- **Ranking**: Veja sua posição no ranking global baseado na distância percorrida.
- **Perfil Customizável**: Gerencie suas estatísticas e recordes pessoais.

## Tecnologias Utilizadas

- **Next.js 15** (App Router)
- **Firebase** (Firestore & Auth)
- **Google Maps API** (Visualização de rotas)
- **Tailwind CSS** (Estilização)
- **Motion** (Animações)
- **Lucide React** (Ícones)

## Como Rodar Localmente

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/pedalmatch.git
   cd pedalmatch
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**:
   Crie um arquivo `.env.local` na raiz e adicione sua chave do Google Maps:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY=sua_chave_aqui
   ```

4. **Firebase Config**:
   Certifique-se de que o arquivo `firebase-applet-config.json` contém as credenciais do seu projeto Firebase.

5. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

6. **Acesse no navegador**:
   [http://localhost:3000](http://localhost:3000)

## Deploy

Este projeto está pronto para ser implantado na **Vercel** ou qualquer plataforma de hospedagem que suporte Next.js. Lembre-se de configurar as variáveis de ambiente no painel da plataforma.

## Deploy no GitHub Pages

Este projeto está configurado para deploy automático no GitHub Pages via GitHub Actions.

1.  **Habilite o GitHub Actions**: Vá em `Settings > Actions > General` no seu repositório e certifique-se de que as Actions estão permitidas.
2.  **Configure o Pages**: Vá em `Settings > Pages`. Em "Build and deployment", selecione **"GitHub Actions"** como fonte.
3.  **Push para o GitHub**: Ao fazer push para a branch `main`, o workflow em `.github/workflows/nextjs.yml` será acionado automaticamente.

### Importante: Configuração do Firebase
Para que o Login funcione no domínio do GitHub Pages:
1. Vá ao [Console do Firebase](https://console.firebase.google.com/).
2. Selecione seu projeto.
3. Vá em `Authentication > Settings > Authorized domains`.
4. Adicione o seu domínio do GitHub Pages (ex: `seu-usuario.github.io`).

---

Desenvolvido para entusiastas do ciclismo! 🚲✨
