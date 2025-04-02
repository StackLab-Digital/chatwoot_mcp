import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export interface ChatwootConfig {
  baseUrl: string;
  apiToken: string;
  accountId: string;
}

export class ChatwootTools {
  private server: McpServer;
  private configs: Map<string, ChatwootConfig>;

  constructor(server: McpServer) {
    this.server = server;
    this.configs = new Map();
    this.registerTools();
  }

  private async makeRequest(clientId: string, path: string, options: RequestInit = {}) {
    const config = this.configs.get(clientId);
    if (!config) {
      throw new Error("Cliente não configurado. Use a ferramenta setup primeiro.");
    }

    const response = await fetch(`${config.baseUrl}${path}`, {
      ...options,
      headers: {
        "api_access_token": config.apiToken,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private registerTools() {
    // Ferramenta de setup
    this.server.tool(
      "chatwoot_setup",
      {
        baseUrl: z.string(),
        apiToken: z.string(),
        accountId: z.string(),
      },
      async ({ baseUrl, apiToken, accountId }, context) => {
        const clientId = context.clientId;
        this.configs.set(clientId, { baseUrl, apiToken, accountId });
        return {
          content: [{ type: "text", text: "Configuração salva com sucesso!" }],
        };
      }
    );

    // Listar caixas de entrada
    this.server.tool(
      "chatwoot_list_inboxes",
      {},
      async (_, context) => {
        const config = this.configs.get(context.clientId);
        const inboxes = await this.makeRequest(context.clientId, `/api/v1/accounts/${config.accountId}/inboxes`);
        return {
          content: [{ type: "text", text: JSON.stringify(inboxes, null, 2) }],
        };
      }
    );

    // Listar conversas
    this.server.tool(
      "chatwoot_list_conversations",
      {
        inbox_id: z.number().optional(),
        status: z.enum(["open", "resolved", "pending"]).optional(),
      },
      async ({ inbox_id, status }, context) => {
        const config = this.configs.get(context.clientId);
        let path = `/api/v1/accounts/${config.accountId}/conversations`;
        const params = new URLSearchParams();
        if (inbox_id) params.append("inbox_id", inbox_id.toString());
        if (status) params.append("status", status);
        
        if (params.toString()) {
          path += `?${params.toString()}`;
        }

        const conversations = await this.makeRequest(context.clientId, path);
        return {
          content: [{ type: "text", text: JSON.stringify(conversations, null, 2) }],
        };
      }
    );

    // Enviar mensagem
    this.server.tool(
      "chatwoot_send_message",
      {
        conversation_id: z.number(),
        message: z.string(),
        message_type: z.enum(["incoming", "outgoing"]).default("outgoing"),
      },
      async ({ conversation_id, message, message_type }, context) => {
        const config = this.configs.get(context.clientId);
        const response = await this.makeRequest(
          context.clientId,
          `/api/v1/accounts/${config.accountId}/conversations/${conversation_id}/messages`,
          {
            method: "POST",
            body: JSON.stringify({
              content: message,
              message_type,
            }),
          }
        );
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
        };
      }
    );

    // Atualizar status da conversa
    this.server.tool(
      "chatwoot_update_conversation",
      {
        conversation_id: z.number(),
        status: z.enum(["open", "resolved", "pending"]),
      },
      async ({ conversation_id, status }, context) => {
        const config = this.configs.get(context.clientId);
        const response = await this.makeRequest(
          context.clientId,
          `/api/v1/accounts/${config.accountId}/conversations/${conversation_id}`,
          {
            method: "PATCH",
            body: JSON.stringify({ status }),
          }
        );
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
        };
      }
    );
  }
} 