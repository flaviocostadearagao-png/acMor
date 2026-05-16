# PedalMatch 🚲

App de rastreamento e rede social para ciclistas com suporte a modo offline. Participe de pedais, acompanhe seu progresso e suba no ranking!

O projeto foi construído utilizando uma arquitetura moderna que compila para **HTML estático, CSS e JavaScript**, garantindo alta performance e compatibilidade total com o **GitHub Pages**.

## 🏗️ Estrutura do Projeto (Arquitetura)

O PedalMatch segue uma estrutura modular baseada em componentes, facilitando a manutenção e o deploy estático:

-   **HTML (Estrutura)**: Definida através de componentes React (JSX) dentro do diretório `/app`. Cada página é convertida em um arquivo `.html` durante o build.
-   **CSS (Estilização)**: Utiliza **Tailwind CSS**, permitindo um design responsivo e moderno sem arquivos CSS externos pesados. O CSS final é otimizado e incluído automaticamente.
-   **JavaScript/TypeScript (Lógica)**: Toda a lógica de rastreamento, integração com Firebase e mapas é escrita em TypeScript (JavaScript com tipagem), garantindo robustez.
-   **Static Export**: Configurado para gerar uma pasta `out/` contendo apenas arquivos estáticos (HTML/CSS/JS), ideal para hospedagem sem servidor (GitHub Pages).

## ✨ Funcionalidades Principais

-   **Rastreamento em Tempo Real**: Monitore distância, tempo e velocidade média via Geolocalização.
-   **Modo Offline**: Grave seus treinos localmente e sincronize com o Firebase assim que recuperar a conexão.
-   **Feed Social**: Descubra e participe de grupos de pedal próximos.
-   **Ranking Global**: Compita com outros ciclistas baseado na distância total percorrida.
-   **Dashboard de Perfil**: Estatísticas detalhadas e recordes pessoais.

## 🛠️ Tecnologias

-   **Framework**: [Next.js 15](https://nextjs.org/) (Configurado com `output: export`)
-   **Banco de Dados & Auth**: [Firebase](https://firebase.google.com/) (Firestore e Google Authentication)
-   **Mapas**: [Google Maps Platform](https://mapsplatform.google.com/)
-   **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
-   **Animações**: [Motion](https://motion.dev/)

## 🚀 Como Rodar Localmente

1.  **Clone o repositório**:
    ```bash
    git clone https://github.com/seu-usuario/pedalmatch.git
    cd pedalmatch
    ```

2.  **Instale as dependências**:
    ```bash
    npm install
    ```

3.  **Configuração de API**:
    Crie um arquivo `.env.local` e adicione sua chave:
    ```env
    NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY=sua_chave_aqui
    ```

4.  **Inicie o desenvolvimento**:
    ```bash
    npm run dev
    ```

## 🌐 Deploy no GitHub Pages

Este projeto possui um workflow do GitHub Actions em `.github/workflows/nextjs.yml` que automatiza o deploy.

1.  No GitHub, vá em **Settings > Pages**.
2.  Em "Build and deployment", selecione **"GitHub Actions"**.
3.  O site será publicado automaticamente ao fazer push para a branch `main`.

### Configuração Crítica do Firebase
Adicione o seu domínio do GitHub Pages (`seu-usuario.github.io`) na seção **Authorized Domains** dentro do Console do Firebase (Authentication > Settings).

---

Desenvolvido para entusiastas do ciclismo! 🚲✨
