import {
  usersCollection,
  postsCollection,
  commentsCollection,
} from "../db/connection";
import { User, Post } from "../types";

//delete all users
export async function deleteAllUsers(): Promise<void> {
  try {
    await usersCollection.deleteMany({});

    // delete all posts and comments
    await postsCollection.deleteMany({});
    await commentsCollection.deleteMany({});

    console.log("All users and their data deleted");
  } catch (error) {
    console.error("Error deleting all users:", error);
    throw error;
  }
}

// delete a specific user
export async function deleteUserById(userId: string): Promise<void> {
  try {
    const userIdNum = parseInt(userId, 10);

    if (isNaN(userIdNum)) {
      throw new Error("Invalid user ID format");
    }

    // find user
    const user = await usersCollection.findOne({ id: userIdNum });
    if (!user) {
      throw new Error("User not found");
    }

    // delete user
    await usersCollection.deleteOne({ id: userIdNum });

    // get user's posts
    const posts = await postsCollection.find({ userId: userIdNum }).toArray();
    const postIds = posts.map((post) => post.id);

    // delete user's posts
    await postsCollection.deleteMany({ userId: userIdNum });

    // delete comments on user's posts
    if (postIds.length > 0) {
      await commentsCollection.deleteMany({ postId: { $in: postIds } });
    }

    console.log(`User ${userId} and their data deleted`);
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
}

// get a specific user by ID
export async function getUserById(userId: string): Promise<User> {
  try {
    const userIdNum = parseInt(userId, 10);

    if (isNaN(userIdNum)) {
      throw new Error("Invalid user ID format");
    }

    // find user
    const user = await usersCollection.findOne({ id: userIdNum });

    if (!user) {
      throw new Error("User not found");
    }

    // find user's posts
    const posts = await postsCollection.find({ userId: userIdNum }).toArray();

    // find comments for each post
    const postsWithComments: Post[] = await Promise.all(
      posts.map(async (post) => {
        const comments = await commentsCollection
          .find({ postId: post.id })
          .toArray();
        return { ...post, comments };
      })
    );

    // add posts to user object
    const userWithData: User = {
      ...user,
      posts: postsWithComments,
    };

    return userWithData;
  } catch (error) {
    console.error(`Error getting user ${userId}:`, error);
    throw error;
  }
}

// create a new user
export async function createUser(userData: User): Promise<User> {
  try {
    // validate data
    if (
      !userData ||
      !userData.id ||
      !userData.name ||
      !userData.username ||
      !userData.email
    ) {
      throw new Error("Missing required user fields");
    }

    // check if user already exists
    const existingUser = await usersCollection.findOne({ id: userData.id });

    if (existingUser) {
      throw new Error("User already exists");
    }

    // insert user
    await usersCollection.insertOne(userData);

    console.log(`User created with ID ${userData.id}`);
    return userData;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}
