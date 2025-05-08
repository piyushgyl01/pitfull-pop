// import {
//   usersCollection,
//   postsCollection,
//   commentsCollection,
// } from "../db/connection";
// import { User, Post, Comment } from "../types";

// // load data from JSONPlaceholder
// export async function loadData(): Promise<void> {
//   try {
//     // fetch 10 users
//     console.log("Fetching users from JSONPlaceholder...");
//     const usersResponse = await fetch(
//       "https://jsonplaceholder.typicode.com/users"
//     );
//     const allUsers: User[] = await usersResponse.json();
//     const users = allUsers.slice(0, 10); // Get only 10 users

//     // clear existing collections
//     await usersCollection.deleteMany({});
//     await postsCollection.deleteMany({});
//     await commentsCollection.deleteMany({});

//     // insert users
//     if (users.length > 0) {
//       await usersCollection.insertMany(users);
//     }

//     // fetch posts for these users
//     const userIds = users.map((user) => user.id);
//     let allPosts: Post[] = [];

//     console.log("Fetching posts for users...");
//     for (const userId of userIds) {
//       const postsResponse = await fetch(
//         `https://jsonplaceholder.typicode.com/posts?userId=${userId}`
//       );
//       const userPosts: Post[] = await postsResponse.json();
//       allPosts = [...allPosts, ...userPosts];
//     }

//     // insert posts
//     if (allPosts.length > 0) {
//       await postsCollection.insertMany(allPosts);
//     }

//     // fetch comments for these posts
//     const postIds = allPosts.map((post) => post.id);
//     let allComments: Comment[] = [];

//     console.log("Fetching comments for posts...");
//     for (const postId of postIds) {
//       const commentsResponse = await fetch(
//         `https://jsonplaceholder.typicode.com/comments?postId=${postId}`
//       );
//       const postComments: Comment[] = await commentsResponse.json();
//       allComments = [...allComments, ...postComments];
//     }

//     // insert comments
//     if (allComments.length > 0) {
//       await commentsCollection.insertMany(allComments);
//     }

//     console.log(
//       `Data loaded: ${users.length} users, ${allPosts.length} posts, ${allComments.length} comments`
//     );
//   } catch (error) {
//     console.error("Error loading data:", error);
//     throw error;
//   }
// }
import {
  usersCollection,
  postsCollection,
  commentsCollection,
} from "../db/connection";
import { User, Post, Comment } from "../types";

// Generic fetch function
async function fetchData<T>(baseUrl: string, queryParam?: { key: string; value: string }): Promise<T[]> {
  let url = baseUrl;
  if (queryParam) {
    url += `?${queryParam.key}=${queryParam.value}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch from ${url}`);
  }
  return response.json();
}

// loadData function
export async function loadData(): Promise<void> {
  try {
    // Fetch 10 users
    console.log("Fetching users from JSONPlaceholder...");
    const allUsers: User[] = await fetchData<User>("https://jsonplaceholder.typicode.com/users");
    const users = allUsers.slice(0, 10); // Get only 10 users

    // Clear existing collections
    await usersCollection.deleteMany({});
    await postsCollection.deleteMany({});
    await commentsCollection.deleteMany({});

    // Insert users
    if (users.length > 0) {
      await usersCollection.insertMany(users);
    }

    // Fetch posts for all users in parallel
    console.log("Fetching posts for users in parallel...");
    const postPromises = users.map(user =>
      fetchData<Post>("https://jsonplaceholder.typicode.com/posts", { key: "userId", value: user.id.toString() })
    );
    const postsArrays: Post[][] = await Promise.all(postPromises);
    const allPosts = postsArrays.flat();

    // Insert posts
    if (allPosts.length > 0) {
      await postsCollection.insertMany(allPosts);
    }

    // Fetch comments for all posts in parallel
    console.log("Fetching comments for posts in parallel...");
    const commentPromises = allPosts.map(post =>
      fetchData<Comment>("https://jsonplaceholder.typicode.com/comments", { key: "postId", value: post.id.toString() })
    );
    const commentsArrays: Comment[][] = await Promise.all(commentPromises);
    const allComments = commentsArrays.flat();

    // Insert comments
    if (allComments.length > 0) {
      await commentsCollection.insertMany(allComments);
    }

    console.log(`Data loaded: ${users.length} users, ${allPosts.length} posts, ${allComments.length} comments`);
  } catch (error) {
    console.error("Error loading data:", error);
    throw error;
  }
}