import { MongoClient, Db, Collection } from "mongodb"; // mongodb classes
import { User, Post, Comment } from "../types";

// connection URL
const MONGOURI = "mongodb://localhost:27017";
const dbName = "swift_assignment";

let client: MongoClient;
let db: Db;

// db collections
export let usersCollection: Collection<User>;
export let postsCollection: Collection<Post>;
export let commentsCollection: Collection<Comment>;

// connect to db
export async function connectToDatabase(): Promise<void> {
  if (db) return;

  try {
    // creating new MongoDB client
    client = new MongoClient(MONGOURI);

    // connect to the MongoDB server
    await client.connect();
    console.log("Connected to MongoDB server");

    // referencing to the db
    db = client.db(dbName);

    // referencing to collections
    usersCollection = db.collection<User>("users");
    postsCollection = db.collection<Post>("posts");
    commentsCollection = db.collection<Comment>("comments");

    console.log("Database and collections initialized");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

// close the db connection
export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

// get db instance
export function getDb(): Db {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
}
