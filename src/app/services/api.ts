/**
 * API service layer — mirrors Express REST routes.
 * All calls simulate async I/O with a small artificial delay.
 *
 * Express equivalents (for local server):
 *   POST   /api/auth/register
 *   POST   /api/auth/login
 *   POST   /api/auth/logout
 *   GET    /api/auth/me
 *   GET    /api/users/:id
 *   PATCH  /api/users/:id
 *   GET    /api/users/:id/followers
 *   GET    /api/users/:id/following
 *   POST   /api/users/:id/follow
 *   DELETE /api/users/:id/follow
 *   GET    /api/users/search?q=
 *   GET    /api/posts
 *   POST   /api/posts
 *   GET    /api/posts/:id
 *   DELETE /api/posts/:id
 *   POST   /api/posts/:id/like
 *   DELETE /api/posts/:id/like
 *   GET    /api/posts/:id/comments
 *   POST   /api/posts/:id/comments
 */

import { store, type Category, type User, type Post, type Comment } from "../store";

const SESSION_KEY = "tv_session_token";

const delay = (ms = 80) => new Promise<void>(r => setTimeout(r, ms));

function getToken(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

function setToken(token: string): void {
  localStorage.setItem(SESSION_KEY, token);
}

function clearToken(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function register(
  email: string,
  username: string,
  password: string,
  displayName: string
): Promise<{ user: User; token: string }> {
  await delay();
  const result = store.register(email, username, password, displayName);
  if ("error" in result) throw new Error(result.error);
  setToken(result.token);
  return result;
}

export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  await delay();
  const result = store.login(email, password);
  if ("error" in result) throw new Error(result.error);
  setToken(result.token);
  return result;
}

export async function logout(): Promise<void> {
  await delay(20);
  const token = getToken();
  if (token) store.logout(token);
  clearToken();
}

export async function getMe(): Promise<User | null> {
  await delay(20);
  const token = getToken();
  if (!token) return null;
  return store.getUserByToken(token);
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function getUser(id: string): Promise<User> {
  await delay();
  const user = store.getUser(id);
  if (!user) throw new Error("User not found");
  return user;
}

export async function updateUser(
  id: string,
  patch: Partial<Pick<User, "displayName" | "bio" | "skills" | "category" | "avatarUrl">>
): Promise<User> {
  await delay();
  const user = store.updateUser(id, patch);
  if (!user) throw new Error("User not found");
  return user;
}

export async function getFollowers(userId: string): Promise<User[]> {
  await delay();
  return store.getFollowers(userId);
}

export async function getFollowing(userId: string): Promise<User[]> {
  await delay();
  return store.getFollowing(userId);
}

export async function followUser(targetId: string): Promise<void> {
  await delay();
  const token = getToken();
  const me = token ? store.getUserByToken(token) : null;
  if (!me) throw new Error("Not authenticated");
  store.follow(me.id, targetId);
}

export async function unfollowUser(targetId: string): Promise<void> {
  await delay();
  const token = getToken();
  const me = token ? store.getUserByToken(token) : null;
  if (!me) throw new Error("Not authenticated");
  store.unfollow(me.id, targetId);
}

export async function isFollowing(targetId: string): Promise<boolean> {
  await delay(10);
  const token = getToken();
  const me = token ? store.getUserByToken(token) : null;
  if (!me) return false;
  return store.isFollowing(me.id, targetId);
}

export async function searchUsers(query: string): Promise<User[]> {
  await delay();
  return store.searchUsers(query);
}

// ── Posts ─────────────────────────────────────────────────────────────────────

export async function getPosts(options: {
  category?: Category;
  authorId?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<Post[]> {
  await delay();
  return store.getPosts(options);
}

export async function getPost(id: string): Promise<Post> {
  await delay();
  const post = store.getPost(id);
  if (!post) throw new Error("Post not found");
  return post;
}

export async function createPost(data: {
  title: string;
  description: string;
  imageUrl: string;
  category: Category;
  tags: string[];
}): Promise<Post> {
  await delay();
  const token = getToken();
  const me = token ? store.getUserByToken(token) : null;
  if (!me) throw new Error("Not authenticated");
  return store.createPost(me.id, data);
}

export async function deletePost(postId: string): Promise<void> {
  await delay();
  const token = getToken();
  const me = token ? store.getUserByToken(token) : null;
  if (!me) throw new Error("Not authenticated");
  const ok = store.deletePost(postId, me.id);
  if (!ok) throw new Error("Unauthorized or post not found");
}

export async function likePost(postId: string): Promise<void> {
  await delay(30);
  const token = getToken();
  const me = token ? store.getUserByToken(token) : null;
  if (!me) throw new Error("Not authenticated");
  store.likePost(me.id, postId);
}

export async function unlikePost(postId: string): Promise<void> {
  await delay(30);
  const token = getToken();
  const me = token ? store.getUserByToken(token) : null;
  if (!me) throw new Error("Not authenticated");
  store.unlikePost(me.id, postId);
}

export async function isPostLiked(postId: string): Promise<boolean> {
  await delay(10);
  const token = getToken();
  const me = token ? store.getUserByToken(token) : null;
  if (!me) return false;
  return store.isLiked(me.id, postId);
}

// ── Comments ──────────────────────────────────────────────────────────────────

export async function getComments(postId: string): Promise<Comment[]> {
  await delay();
  return store.getComments(postId);
}

export async function addComment(postId: string, body: string): Promise<Comment> {
  await delay();
  const token = getToken();
  const me = token ? store.getUserByToken(token) : null;
  if (!me) throw new Error("Not authenticated");
  return store.addComment(postId, me.id, body);
}
