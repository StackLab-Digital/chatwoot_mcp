# Chatwoot MCP Server

Este é um servidor MCP (Model Context Protocol) que fornece ferramentas para interagir com a API do Chatwoot.

## Ferramentas Disponíveis

1. `chatwoot_setup`: Configura a conexão com o Chatwoot
   - Parâmetros:
     - `baseUrl`: URL base da sua instalação do Chatwoot
     - `apiToken`: Token de API do Chatwoot

2. `chatwoot_list_inboxes`: Lista todas as caixas de entrada
   - Sem parâmetros

3. `chatwoot_list_conversations`: Lista conversas
   - Parâmetros opcionais:
     - `inbox_id`: ID da caixa de entrada
     - `status`: Status das conversas ("open", "resolved", "pending")

4. `chatwoot_send_message`: Envia uma mensagem
   - Parâmetros:
     - `conversation_id`: ID da conversa
     - `message`: Conteúdo da mensagem
     - `message_type`: Tipo da mensagem ("incoming" ou "outgoing")

5. `chatwoot_update_conversation`: Atualiza o status de uma conversa
   - Parâmetros:
     - `conversation_id`: ID da conversa
     - `status`: Novo status ("open", "resolved", "pending")

## Instalação

### Desenvolvimento Local

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run start
   ```

### Deploy com Docker

1. Clone o repositório
2. Construa e inicie os containers:
   ```bash
   docker-compose up -d
   ```

O servidor estará disponível em `http://localhost:8787/sse`.

## Uso com Clientes MCP

1. Conecte-se ao servidor usando a URL: `http://seu-servidor:8787/sse`
2. Configure o cliente usando a ferramenta `chatwoot_setup`
3. Comece a usar as outras ferramentas disponíveis

## Exemplo de Uso

```typescript
// Configurar o cliente
await mcp.invoke("chatwoot_setup", {
  baseUrl: "https://seu-chatwoot.com",
  apiToken: "seu-token-api"
});

// Listar caixas de entrada
const inboxes = await mcp.invoke("chatwoot_list_inboxes");

// Listar conversas abertas
const conversations = await mcp.invoke("chatwoot_list_conversations", {
  status: "open"
});

// Enviar mensagem
await mcp.invoke("chatwoot_send_message", {
  conversation_id: 123,
  message: "Olá! Como posso ajudar?",
  message_type: "outgoing"
});
```

## Connect the MCP inspector to your server

To explore your new MCP api, you can use the [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector).

- Start it with `npx @modelcontextprotocol/inspector`
- [Within the inspector](http://localhost:5173), switch the Transport Type to `SSE` and enter `http://localhost:8787/sse` as the URL of the MCP server to connect to, and click "Connect"
- You will navigate to a (mock) user/password login screen. Input any email and pass to login.
- You should be redirected back to the MCP Inspector and you can now list and call any defined tools!

<div align="center">
  <img src="img/mcp-inspector-sse-config.png" alt="MCP Inspector with the above config" width="600"/>
</div>

<div align="center">
  <img src="img/mcp-inspector-successful-tool-call.png" alt="MCP Inspector with after a tool call" width="600"/>
</div>

## Connect Claude Desktop to your local MCP server

The MCP inspector is great, but we really want to connect this to Claude! Follow [Anthropic's Quickstart](https://modelcontextprotocol.io/quickstart/user) and within Claude Desktop go to Settings > Developer > Edit Config to find your configuration file.

Open the file in your text editor and replace it with this configuration:

```json
{
  "mcpServers": {
    "math": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:8787/sse"
      ]
    }
  }
}
```

This will run a local proxy and let Claude talk to your MCP server over HTTP

When you open Claude a browser window should open and allow you to login. You should see the tools available in the bottom right. Given the right prompt Claude should ask to call the tool.

<div align="center">
  <img src="img/available-tools.png" alt="Clicking on the hammer icon shows a list of available tools" width="600"/>
</div>

<div align="center">
  <img src="img/claude-does-math-the-fancy-way.png" alt="Claude answers the prompt 'I seem to have lost my calculator and have run out of fingers. Could you use the math tool to add 23 and 19?' by invoking the MCP add tool" width="600"/>
</div>

## Deploy to Cloudflare

1. `npx wrangler kv namespace create OAUTH_KV`
2. Follow the guidance to add the kv namespace ID to `wrangler.jsonc`
3. `npm run deploy`

## Call your newly deployed remote MCP server from a remote MCP client

Just like you did above in "Develop locally", run the MCP inspector:

`npx @modelcontextprotocol/inspector@latest`

Then enter the `workers.dev` URL (ex: `worker-name.account-name.workers.dev/sse`) of your Worker in the inspector as the URL of the MCP server to connect to, and click "Connect".

You've now connected to your MCP server from a remote MCP client.

## Connect Claude Desktop to your remote MCP server

Update the Claude configuration file to point to your `workers.dev` URL (ex: `worker-name.account-name.workers.dev/sse`) and restart Claude 

```json
{
  "mcpServers": {
    "math": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://worker-name.account-name.workers.dev/sse"
      ]
    }
  }
}
```

## Debugging

Should anything go wrong it can be helpful to restart Claude, or to try connecting directly to your
MCP server on the command line with the following command.

```bash
npx mcp-remote http://localhost:8787/sse
```

In some rare cases it may help to clear the files added to `~/.mcp-auth`

```bash
rm -rf ~/.mcp-auth
```
