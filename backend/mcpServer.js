const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { SSEServerTransport } = require("@modelcontextprotocol/sdk/server/sse.js");
const { z } = require("zod");
const { task, workspace, workspace_membership, user, note, mindmap, mindmap_item } = require("./models");

const server = new McpServer({
  name: "Benote MCP Server",
  version: "1.0.0",
});

// Add a tool to create a task
server.tool(
  "create_task",
  "Create a new task in Benote",
  {
    title: z.string().describe("The title of the task"),
    description: z.string().optional().describe("The description of the task"),
    status: z.enum(["todo", "in_progress", "done"]).optional().describe("The status of the task"),
    workspace_id: z.string().uuid().optional().describe("The ID of the workspace this task belongs to"),
    assigned_to: z.string().uuid().optional().describe("The ID of the user this task is assigned to"),
  },
  async (args, extra) => {
    try {
      // Use the current authenticated user
      const userId = currentUser?.id;
      const newTask = await task.create({
        title: args.title,
        description: args.description,
        status: args.status || "todo",
        workspace_id: args.workspace_id,
        assigned_to: args.assigned_to || userId,
      });
      return {
        content: [{ type: "text", text: `Task created successfully with ID: ${newTask.id}` }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Failed to create task: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Add a tool to create a workspace
server.tool(
  "create_workspace",
  "Create a new workspace in Benote",
  {
    name: z.string().describe("The name of the workspace"),
    description: z.string().optional().describe("The description of the workspace"),
    owned_by: z.string().uuid().describe("The ID of the user who owns the workspace"),
  },
  async (args, extra) => {
    try {
      const newWorkspace = await workspace.create({
        name: args.name,
        description: args.description,
        owned_by: args.owned_by || currentUser?.id,
      });
      // Automatically add the creator as an admin member
      if (newWorkspace.owned_by) {
        await workspace_membership.create({
          workspace_id: newWorkspace.id,
          user_id: newWorkspace.owned_by,
          role: "admin",
        });
      }
      return {
        content: [{ type: "text", text: `Workspace created successfully with ID: ${newWorkspace.id}` }],
        data: { id: newWorkspace.id, name: newWorkspace.name }
      };
    } catch (error) {

      return {
        content: [{ type: "text", text: `Failed to create workspace: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Add a tool to list workspaces
server.tool(
  "list_workspaces",
  "List workspaces for the current user",
  {},
  async (args, extra) => {
    // Logic is handled in the route handler below for this simple implementation
    return { content: [{ type: "text", text: "Function restricted to route handler." }] };
  }
);

// Add a tool to create a note
server.tool(
  "create_note",
  "Create a new note in Benote",
  {
    title: z.string().describe("The title of the note"),
    content: z.string().optional().describe("The content of the note"),
    workspace_id: z.string().uuid().optional().describe("The ID of the workspace this note belongs to"),
  },
  async (args, extra) => {
    try {
      const userId = currentUser?.id;
      const newNote = await note.create({
        title: args.title,
        content: args.content || "",
        workspace_id: args.workspace_id,
        user_id: userId,
      });
      return {
        content: [{ type: "text", text: `Note created successfully with ID: ${newNote.id}` }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Failed to create note: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Add a tool to create a mindmap
server.tool(
  "create_mindmap",
  "Create a new mindmap in Benote",
  {
    title: z.string().describe("The title of the mindmap"),
    description: z.string().optional().describe("The description of the mindmap"),
    workspace_id: z.string().uuid().optional().describe("The ID of the workspace this mindmap belongs to"),
  },
  async (args, extra) => {
    try {
      const userId = currentUser?.id;
      const newMindmap = await mindmap.create({
        title: args.title,
        description: args.description || "",
        workspace_id: args.workspace_id,
        user_id: userId,
      });
      return {
        content: [{ type: "text", text: `Mindmap created successfully with ID: ${newMindmap.id}` }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Failed to create mindmap: ${error.message}` }],
        isError: true,
      };
    }
  }
);


const setupMcpRoutes = (app, authMiddleware) => {
  app.post("/mcp/messages", authMiddleware, async (req, res) => {
    // Determine which tools to run based on the request body (JSON-RPC)
    // Note: This is a simplified direct execution instead of full MCP protocol over SSE
    // because the @modelcontextprotocol/sdk's SSEServerTransport is designed for persistent connections
    // and we are doing a stateless REST-like call from the chatbot.
    
    try {
      const { method, params, id } = req.body;
      
      if (method === "tools/call") {
        const toolName = params.name;
        const toolArgs = params.arguments;
        
        console.log(`[MCP] Received tool call: ${toolName}`, JSON.stringify(toolArgs, null, 2));

        let result;
        
        // Manually dispatch to tools since we aren't using the full Server class transport loop
        // We can access the tools directly from the server instance if exposed, or recreate logic
        // But server.tool() registers them internally.
        
        // Better approach for stateless HTTP: execute the tool logic directly if possible
        // OR simpler: just re-implement the simple logic here since we only have 2 tools
        
        // Re-using the tool definitions via the server instance would be ideal but internal API might be tricky.
        // Let's look at how we can use the server instance directly.
        
        // Actually, we can just use the McpServer instance to handle the call if we can mock a transport
        // OR we can just implement the logic here for simplicity given the constraints.
        
        // Let's check which tool is requested:
        if (toolName === "create_task") {
            const userId = req.user?.id;
            console.log(`[MCP] Creating task for user ${userId}...`);
            try {
                const newTask = await task.create({
                    title: toolArgs.title,
                    description: toolArgs.description,
                    status: toolArgs.status || "todo",
                    workspace_id: toolArgs.workspace_id,
                    assigned_to: toolArgs.assigned_to || userId,
                });
                console.log(`[MCP] Task created successfully: ID ${newTask.id}`);
                result = {
                    content: [{ type: "text", text: `Task created successfully with ID: ${newTask.id}` }],
                };
            } catch (createError) {
                console.error(`[MCP] Error creating task:`, createError);
                throw createError;
            }
        } else if (toolName === "create_workspace") {
             const userId = req.user?.id;
             console.log(`[MCP] Creating workspace for user ${userId}...`);
             try {
                const newWorkspace = await workspace.create({
                    name: toolArgs.name,
                    description: toolArgs.description,
                    owned_by: toolArgs.owned_by || userId,
                });
                console.log(`[MCP] Workspace created successfully: ID ${newWorkspace.id} ("${newWorkspace.name}")`);

                // Create membership record
                console.log(`[MCP] Adding user ${newWorkspace.owned_by} as admin member to workspace ${newWorkspace.id}...`);
                await workspace_membership.create({
                    workspace_id: newWorkspace.id,
                    user_id: newWorkspace.owned_by,
                    role: "admin",
                });
                
                result = {
                    content: [{ type: "text", text: `Workspace created successfully with ID: ${newWorkspace.id}` }],
                };
             } catch (createError) {
                console.error(`[MCP] Error creating workspace:`, createError);
                throw createError;
             }
        } else if (toolName === "list_workspaces") {
             const userId = req.user?.id;
             console.log(`[MCP] Listing workspaces for user ${userId}...`);
             try {
                // Find workspaces where the user is a member or owner
                // Using the specific association defined in workspace.js:
                // this.belongsToMany(models.user, { through: "workspace_membership", ... as: "users" })
                
                // We use the include to filter.
                // Note: user must be available in scope. We destructured it at the top.
                const workspaces = await workspace.findAll({
                    include: [{
                        model: user,
                        as: 'users',
                        where: { id: userId },
                        attributes: [], // We don't need user details in the result, just the filter
                        through: { attributes: [] } // Don't need join table attributes
                    }],
                    order: [['createdAt', 'DESC']]
                });
                
                console.log(`[MCP] Found ${workspaces.length} workspaces.`);
                
                // Return a JSON structure that the frontend can parse
                // We put the raw data in a "data" property so the frontend can check for it
                result = {
                    content: [{ 
                        type: "text", 
                        text: `Found ${workspaces.length} workspaces: ${workspaces.map(w => w.name).join(", ")}` 
                    }],
                    data: workspaces // Sending raw data for frontend rendering
                };
             } catch (error) {
                console.error(`[MCP] Error listing workspaces:`, error);
                throw new Error(`Failed to list workspaces: ${error.message}`);
             }
        } else if (toolName === "create_note") {
             const userId = req.user?.id;
             console.log(`[MCP] Creating note for user ${userId}...`);
             try {
                const newNote = await note.create({
                    title: toolArgs.title,
                    content: toolArgs.content || "",
                    workspace_id: toolArgs.workspace_id,
                    user_id: userId,
                });
                console.log(`[MCP] Note created successfully: ID ${newNote.id}`);
                result = {
                    content: [{ type: "text", text: `Note created successfully with ID: ${newNote.id}` }],
                };
             } catch (createError) {
                console.error(`[MCP] Error creating note:`, createError);
                throw createError;
             }
        } else if (toolName === "create_mindmap") {
             const userId = req.user?.id;
             console.log(`[MCP] Creating mindmap for user ${userId}...`);
             try {
                const newMindmap = await mindmap.create({
                    title: toolArgs.title,
                    description: toolArgs.description || "",
                    workspace_id: toolArgs.workspace_id,
                    user_id: userId,
                });
                console.log(`[MCP] Mindmap created successfully: ID ${newMindmap.id}`);
                result = {
                    content: [{ type: "text", text: `Mindmap created successfully with ID: ${newMindmap.id}` }],
                };
             } catch (createError) {
                console.error(`[MCP] Error creating mindmap:`, createError);
                throw createError;
             }
        } else {
            console.warn(`[MCP] Unknown tool requested: ${toolName}`);

            throw new Error(`Tool not found: ${toolName}`);
        }

        return res.json({
            jsonrpc: "2.0",
            id: id,
            result: result
        });
      }
      
      res.status(400).json({ error: "Method not supported" });
      
    } catch (error) {
       console.error("MCP Execution Error:", error);
       res.status(500).json({
         jsonrpc: "2.0",
         id: req.body.id,
         error: {
           code: -32603,
           message: error.message
         }
       });
    }
  });
};

module.exports = { setupMcpRoutes };
