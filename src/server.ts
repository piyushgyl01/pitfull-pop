import http from "http";
import { URL } from "url";
import { connectToDatabase, closeDatabaseConnection } from "./db/connection";
import { loadData } from "./controllers/dataController";
import {
  deleteAllUsers,
  deleteUserById,
  getUserById,
  createUser,
} from "./controllers/userController";

// parse request body
async function parseBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    const bodyChunks: any[] = [];

    req.on("data", (chunk) => {
      bodyChunks.push(chunk);
    });

    req.on("end", () => {
      try {
        if (bodyChunks.length > 0) {
          const bodyString = Buffer.concat(bodyChunks).toString();
          const body = JSON.parse(bodyString);
          resolve(body);
        } else {
          resolve({});
        }
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", (error) => {
      reject(error);
    });
  });
}

// start the server
async function startServer(): Promise<void> {
  try {
    // connect to MongoDB
    await connectToDatabase();

    // create HTTP server
    const server = http.createServer(async (req, res) => {
      try {
        // parse URL
        const url = new URL(req.url || "/", `http://${req.headers.host}`);
        const path = url.pathname;
        const method = req.method || "GET";

        console.log(`${method} ${path}`);

        // starting route
        if (path === "/" && method === "GET") {
          try {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                message: "REST API implementation completed successfully",
                author: "Piyush Goyal",
                portfolio: "https://build-with-piyush.vercel.app/",
              })
            );
          } catch (error) {
            console.error("Server data:", error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Internal server error" }));
          }
          return;
        }

        // GET /load - Load data
        if (path === "/load" && method === "GET") {
          try {
            await loadData();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({}));
          } catch (error) {
            console.error("Error loading data:", error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to load data" }));
          }
          return;
        }

        // DELETE /users - Delete all users
        if (path === "/users" && method === "DELETE") {
          try {
            await deleteAllUsers();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "All users deleted" }));
          } catch (error) {
            console.error("Error:", error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to delete users" }));
          }
          return;
        }

        // DELETE /users/:userId - Delete user by ID
        if (path.match(/^\/users\/\d+$/) && method === "DELETE") {
          try {
            const userId = path.split("/")[2];
            await deleteUserById(userId);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: `User ${userId} deleted` }));
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";

            if (errorMessage === "User not found") {
              res.writeHead(404, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "User not found" }));
              return;
            }

            if (errorMessage === "Invalid user ID format") {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Invalid user ID format" }));
              return;
            }

            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to delete user" }));
          }
          return;
        }

        // GET /users/:userId - Get user by ID with posts and comments
        if (path.match(/^\/users\/\d+$/) && method === "GET") {
          try {
            const userId = path.split("/")[2];
            const user = await getUserById(userId);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(user));
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";

            // handle specific errors
            if (errorMessage === "User not found") {
              res.writeHead(404, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "User not found" }));
              return;
            }

            if (errorMessage === "Invalid user ID format") {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Invalid user ID format" }));
              return;
            }

            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to get user" }));
          }
          return;
        }

        // PUT /users - Create new user
        if (path === "/users" && method === "PUT") {
          try {
            const userData = await parseBody(req);
            const newUser = await createUser(userData);

            const locationHeader = `http://localhost:${PORT}/users/${newUser.id}`;

            res.writeHead(201, {
              "Content-Type": "application/json",
              Location: locationHeader,
            });
            res.end(JSON.stringify(newUser));
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";

            // handle specific errors
            if (errorMessage === "User already exists") {
              res.writeHead(409, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "User already exists" }));
              return;
            }

            if (errorMessage === "Missing required user fields") {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({ error: "Missing required user fields" })
              );
              return;
            }

            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to create user" }));
          }
          return;
        }

        // non existing route error
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Route not found" }));
      } catch (error) {
        console.error("Server error:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    });

    const PORT = process.env.PORT || 3002;
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });

    process.on("SIGINT", async () => {
      console.log("Shutting down server...");
      await closeDatabaseConnection();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
