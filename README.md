# PedalMatch 🚲 (Versão Estática Pura)

App de rastreamento e rede social para ciclistas. Esta versão utiliza **HTML, CSS e JavaScript puros**, o que permite rodar instantaneamente no **GitHub Pages** sem processos de build complexos ou Next.js.

## 🏗️ Estrutura do Projeto

-   **`index.html`**: Interface do aplicativo (Single Page Application).
-   **`main.js`**: Lógica de Autenticação, Banco de Dados (Firebase) e Rastreamento.
-   **`firebase-applet-config.json`**: Arquivo de configuração onde você coloca suas chaves.

## 🚀 Como Rodar Localmente

Como o projeto é estático, você não precisa de `npm install` ou `npm run dev` do Next.js.

1.  **Clone o repositório**: 
    ```bash
    git clone https://github.com/seu-usuario/pedalmatch.git
    cd pedalmatch
    ```
2.  **Configuração de Chaves**: Abra o arquivo `firebase-applet-config.json` e adicione suas credenciais do Firebase e do Google Maps:
    ```json
    {
      "apiKey": "SUA_CHAVE_FIREBASE",
      "googleMapsKey": "SUA_CHAVE_GOOGLE_MAPS",
      ...
    }
    ```
3.  **Inicie um Servidor**: Use qualquer servidor estático. Exemplos:
    -   **VS Code**: Instale a extensão "Live Server".
    -   **Terminal**: `npx serve .` ou `python -m http.server 3000`.
4.  **Acesse**: `http://localhost:3000`

## 🌐 Deploy no GitHub Pages

O GitHub Pages é perfeito para esta estrutura:

1.  Suba os arquivos (`index.html`, `main.js`, `firebase-applet-config.json`) para o seu repositório no GitHub.
2.  Vá em **Settings > Pages**.
3.  Em "Build and deployment > Source", selecione **"Deploy from a branch"**.
4.  Selecione a branch `main` e a pasta `/ (root)`.
5.  Clique em Save. Seu site estará online em minutos!

### ⚠️ Configuração Crítica do Firebase
Para que o Login funcione no domínio do GitHub Pages, você **deve** adicionar o seu domínio (`seu-usuario.github.io`) na lista de **Domínios Autorizados** no Console do Firebase (**Authentication > Settings > Authorized Domains**).

---

Desenvolvido para entusiastas do ciclismo! 🚲✨
