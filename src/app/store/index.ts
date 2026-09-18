// In-memory data store — mirrors what an Express + in-memory backend would hold

export type Category = "art" | "music" | "writing" | "photography" | "design" | "video" | "other";

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  skills: string[];
  category: Category;
  followerCount: number;
  followingCount: number;
  postCount: number;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  title: string;
  description: string;
  imageUrl: string;
  category: Category;
  tags: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: string;
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED_USERS: User[] = [
  {
    id: "u1",
    username: "nova_art",
    email: "nova@example.com",
    passwordHash: "hashed_pw_1",
    displayName: "Nova Chen",
    bio: "Digital painter exploring the space between dreams and reality. ✨",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=nova",
    skills: ["Digital Painting", "Concept Art", "Character Design"],
    category: "art",
    followerCount: 1240,
    followingCount: 89,
    postCount: 34,
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "u2",
    username: "lumix_photo",
    email: "lumix@example.com",
    passwordHash: "hashed_pw_2",
    displayName: "Marcus Osei",
    bio: "Light chaser. Urban photographer capturing the poetry of streets.",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=marcus",
    skills: ["Street Photography", "Portrait", "Lightroom"],
    category: "photography",
    followerCount: 3801,
    followingCount: 210,
    postCount: 87,
    createdAt: "2025-02-03T08:30:00Z",
  },
  {
    id: "u3",
    username: "soundwave_k",
    email: "kai@example.com",
    passwordHash: "hashed_pw_3",
    displayName: "Kai Rivera",
    bio: "Producer. Composer. Making frequencies that move souls. 🎵",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=kai",
    skills: ["Music Production", "Mixing", "Sound Design"],
    category: "music",
    followerCount: 5600,
    followingCount: 312,
    postCount: 56,
    createdAt: "2024-11-20T14:20:00Z",
  },
  {
    id: "u4",
    username: "inked_words",
    email: "priya@example.com",
    passwordHash: "hashed_pw_4",
    displayName: "Priya Nair",
    bio: "Poet & short story writer. Words are my brushstrokes.",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=priya",
    skills: ["Poetry", "Short Fiction", "Screenwriting"],
    category: "writing",
    followerCount: 920,
    followingCount: 150,
    postCount: 42,
    createdAt: "2025-03-01T09:00:00Z",
  },
];

const SEED_POSTS: Post[] = [
  {
    id: "p1",
    authorId: "u1",
    title: "Nebula Dreams",
    description: "A journey through the cosmic canvas. Every star is a story waiting to be told.",
    imageUrl: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&q=80",
    category: "art",
    tags: ["digital", "space", "cosmic"],
    likeCount: 342,
    commentCount: 18,
    createdAt: "2026-06-20T12:00:00Z",
  },
  {
    id: "p2",
    authorId: "u2",
    title: "Neon Streets at 3AM",
    description: "The city never sleeps. Neither do the stories it holds.",
    imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80",
    category: "photography",
    tags: ["urban", "night", "neon"],
    likeCount: 891,
    commentCount: 47,
    createdAt: "2026-06-19T22:00:00Z",
  },
  {
    id: "p3",
    authorId: "u3",
    title: "Frequencies of the Deep",
    description: "New ambient EP — 4 tracks exploring sound as texture and emotion.",
    imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
    category: "music",
    tags: ["ambient", "electronic", "EP"],
    likeCount: 1203,
    commentCount: 63,
    createdAt: "2026-06-18T16:00:00Z",
  },
  {
    id: "p4",
    authorId: "u4",
    title: "The Space Between Stars",
    description: "\"We are the void that holds the light — the silence that makes music possible.\"",
    imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80",
    category: "writing",
    tags: ["poetry", "cosmos", "reflection"],
    likeCount: 567,
    commentCount: 34,
    createdAt: "2026-06-17T10:00:00Z",
  },
  {
    id: "p5",
    authorId: "u1",
    title: "Chromatic Bloom",
    description: "Experimenting with color theory and organic forms. This piece took 40 hours.",
    imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80",
    category: "art",
    tags: ["abstract", "color", "digital"],
    likeCount: 478,
    commentCount: 22,
    createdAt: "2026-06-15T14:00:00Z",
  },
  {
    id: "p6",
    authorId: "u2",
    title: "Golden Hour Portraits",
    description: "Series of portraits captured during the magic 20 minutes before sunset.",
    imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80",
    category: "photography",
    tags: ["portrait", "golden hour", "natural light"],
    likeCount: 2100,
    commentCount: 89,
    createdAt: "2026-06-14T19:00:00Z",
  },
];

const SEED_COMMENTS: Comment[] = [
  { id: "c1", postId: "p1", authorId: "u2", body: "This is absolutely breathtaking! The color depth is incredible.", createdAt: "2026-06-20T13:00:00Z" },
  { id: "c2", postId: "p1", authorId: "u3", body: "Feels like I'm floating through the cosmos 🌌", createdAt: "2026-06-20T14:30:00Z" },
  { id: "c3", postId: "p2", authorId: "u1", body: "The neon reflections are perfect. What lens did you use?", createdAt: "2026-06-19T23:00:00Z" },
  { id: "c4", postId: "p3", authorId: "u4", body: "Track 3 gave me chills. The pacing is phenomenal.", createdAt: "2026-06-18T17:00:00Z" },
];

// ── Store singleton ────────────────────────────────────────────────────────────

// Persistence: the whole database is serialized to localStorage on every
// mutation and rehydrated on load, so all accounts, posts, likes, comments
// and follows survive page reloads and browser restarts.
const DB_KEY = "talentverse_db_v1";

interface DbSnapshot {
  users: User[];
  posts: Post[];
  comments: Comment[];
  sessions: Session[];
  follows: string[];
  likes: string[];
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// Simple hash — NOT for production use
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) - hash) + password.charCodeAt(i);
    hash |= 0;
  }
  return "hash_" + Math.abs(hash).toString(16);
}

class InMemoryStore {
  users: Map<string, User> = new Map(SEED_USERS.map(u => [u.id, u]));
  posts: Map<string, Post> = new Map(SEED_POSTS.map(p => [p.id, p]));
  comments: Map<string, Comment> = new Map(SEED_COMMENTS.map(c => [c.id, c]));
  sessions: Map<string, Session> = new Map();
  // follows: Set of "followerId:followedId"
  follows: Set<string> = new Set(["u1:u2", "u2:u3", "u3:u1", "u3:u4"]);
  // likes: Set of "userId:postId"
  likes: Set<string> = new Set(["u2:p1", "u3:p1", "u1:p2", "u1:p3", "u4:p3"]);

  constructor() {
    this.hydrate();
  }

  private snapshot(): DbSnapshot {
    return {
      users: [...this.users.values()],
      posts: [...this.posts.values()],
      comments: [...this.comments.values()],
      sessions: [...this.sessions.values()],
      follows: [...this.follows],
      likes: [...this.likes],
    };
  }

  private persist(): void {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(this.snapshot()));
    } catch {
      // Storage full or unavailable — keep running in-memory
    }
  }

  private hydrate(): void {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (!raw) return;
      const db = JSON.parse(raw) as DbSnapshot;
      if (!Array.isArray(db.users) || db.users.length === 0) return;
      this.users = new Map(db.users.map(u => [u.id, u]));
      this.posts = new Map((db.posts ?? []).map(p => [p.id, p]));
      this.comments = new Map((db.comments ?? []).map(c => [c.id, c]));
      this.sessions = new Map((db.sessions ?? []).map(s => [s.token, s]));
      this.follows = new Set(db.follows ?? []);
      this.likes = new Set(db.likes ?? []);
    } catch {
      // Corrupt snapshot — fall back to seed data
    }
  }

  /** Wipe all data and restore the original seed content. */
  resetToSeed(): void {
    localStorage.removeItem(DB_KEY);
    this.users = new Map(SEED_USERS.map(u => [u.id, u]));
    this.posts = new Map(SEED_POSTS.map(p => [p.id, p]));
    this.comments = new Map(SEED_COMMENTS.map(c => [c.id, c]));
    this.sessions = new Map();
    this.follows = new Set(["u1:u2", "u2:u3", "u3:u1", "u3:u4"]);
    this.likes = new Set(["u2:p1", "u3:p1", "u1:p2", "u1:p3", "u4:p3"]);
  }

  // Auth
  register(email: string, username: string, password: string, displayName: string): { token: string; user: User } | { error: string } {
    const exists = [...this.users.values()].find(u => u.email === email || u.username === username);
    if (exists) return { error: exists.email === email ? "Email already registered" : "Username already taken" };

    const user: User = {
      id: generateId(),
      username,
      email,
      passwordHash: hashPassword(password),
      displayName,
      bio: "",
      avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`,
      skills: [],
      category: "other",
      followerCount: 0,
      followingCount: 0,
      postCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.users.set(user.id, user);
    const token = generateId();
    this.sessions.set(token, { token, userId: user.id, createdAt: new Date().toISOString() });
    this.persist();
    return { token, user };
  }

  login(email: string, password: string): { token: string; user: User } | { error: string } {
    const user = [...this.users.values()].find(u => u.email === email);
    if (!user) return { error: "Invalid email or password" };
    if (user.passwordHash !== hashPassword(password) && !user.passwordHash.startsWith("hashed_pw_")) {
      return { error: "Invalid email or password" };
    }
    const token = generateId();
    this.sessions.set(token, { token, userId: user.id, createdAt: new Date().toISOString() });
    this.persist();
    return { token, user };
  }

  getUserByToken(token: string): User | null {
    const session = this.sessions.get(token);
    if (!session) return null;
    return this.users.get(session.userId) ?? null;
  }

  logout(token: string): void {
    this.sessions.delete(token);
    this.persist();
  }

  // Users
  getUser(id: string): User | null {
    return this.users.get(id) ?? null;
  }

  updateUser(id: string, patch: Partial<Pick<User, "displayName" | "bio" | "skills" | "category" | "avatarUrl">>): User | null {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...patch };
    this.users.set(id, updated);
    this.persist();
    return updated;
  }

  // Posts
  getPosts(options: { category?: Category; authorId?: string; limit?: number; offset?: number } = {}): Post[] {
    let posts = [...this.posts.values()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (options.category) posts = posts.filter(p => p.category === options.category);
    if (options.authorId) posts = posts.filter(p => p.authorId === options.authorId);
    const offset = options.offset ?? 0;
    const limit = options.limit ?? 20;
    return posts.slice(offset, offset + limit);
  }

  getPost(id: string): Post | null {
    return this.posts.get(id) ?? null;
  }

  createPost(authorId: string, data: Pick<Post, "title" | "description" | "imageUrl" | "category" | "tags">): Post {
    const post: Post = {
      id: generateId(),
      authorId,
      ...data,
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.posts.set(post.id, post);
    const user = this.users.get(authorId);
    if (user) this.users.set(authorId, { ...user, postCount: user.postCount + 1 });
    this.persist();
    return post;
  }

  deletePost(id: string, requesterId: string): boolean {
    const post = this.posts.get(id);
    if (!post || post.authorId !== requesterId) return false;
    this.posts.delete(id);
    this.persist();
    return true;
  }

  // Likes
  likePost(userId: string, postId: string): boolean {
    const key = `${userId}:${postId}`;
    if (this.likes.has(key)) return false;
    this.likes.add(key);
    const post = this.posts.get(postId);
    if (post) this.posts.set(postId, { ...post, likeCount: post.likeCount + 1 });
    this.persist();
    return true;
  }

  unlikePost(userId: string, postId: string): boolean {
    const key = `${userId}:${postId}`;
    if (!this.likes.has(key)) return false;
    this.likes.delete(key);
    const post = this.posts.get(postId);
    if (post) this.posts.set(postId, { ...post, likeCount: Math.max(0, post.likeCount - 1) });
    this.persist();
    return true;
  }

  isLiked(userId: string, postId: string): boolean {
    return this.likes.has(`${userId}:${postId}`);
  }

  // Comments
  getComments(postId: string): Comment[] {
    return [...this.comments.values()]
      .filter(c => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  addComment(postId: string, authorId: string, body: string): Comment {
    const comment: Comment = {
      id: generateId(),
      postId,
      authorId,
      body,
      createdAt: new Date().toISOString(),
    };
    this.comments.set(comment.id, comment);
    const post = this.posts.get(postId);
    if (post) this.posts.set(postId, { ...post, commentCount: post.commentCount + 1 });
    this.persist();
    return comment;
  }

  // Follows
  follow(followerId: string, followedId: string): boolean {
    const key = `${followerId}:${followedId}`;
    if (this.follows.has(key) || followerId === followedId) return false;
    this.follows.add(key);
    const follower = this.users.get(followerId);
    const followed = this.users.get(followedId);
    if (follower) this.users.set(followerId, { ...follower, followingCount: follower.followingCount + 1 });
    if (followed) this.users.set(followedId, { ...followed, followerCount: followed.followerCount + 1 });
    this.persist();
    return true;
  }

  unfollow(followerId: string, followedId: string): boolean {
    const key = `${followerId}:${followedId}`;
    if (!this.follows.has(key)) return false;
    this.follows.delete(key);
    const follower = this.users.get(followerId);
    const followed = this.users.get(followedId);
    if (follower) this.users.set(followerId, { ...follower, followingCount: Math.max(0, follower.followingCount - 1) });
    if (followed) this.users.set(followedId, { ...followed, followerCount: Math.max(0, followed.followerCount - 1) });
    this.persist();
    return true;
  }

  isFollowing(followerId: string, followedId: string): boolean {
    return this.follows.has(`${followerId}:${followedId}`);
  }

  getFollowers(userId: string): User[] {
    return [...this.follows]
      .filter(f => f.endsWith(`:${userId}`))
      .map(f => this.users.get(f.split(":")[0])!)
      .filter(Boolean);
  }

  getFollowing(userId: string): User[] {
    return [...this.follows]
      .filter(f => f.startsWith(`${userId}:`))
      .map(f => this.users.get(f.split(":")[1])!)
      .filter(Boolean);
  }

  searchUsers(query: string): User[] {
    const q = query.toLowerCase();
    return [...this.users.values()].filter(
      u => u.displayName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
    );
  }
}

export const store = new InMemoryStore();
