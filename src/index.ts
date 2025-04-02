import app from "./app";
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ChatwootTools } from "./chatwoot-tools";

export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Chatwoot MCP",
		version: "1.0.0",
	});

	async init() {
		// Inicializa as ferramentas do Chatwoot
		new ChatwootTools(this.server);
	}
}

export default MyMCP.mount("/sse");
