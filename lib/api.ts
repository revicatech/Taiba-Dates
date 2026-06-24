const API_URL = "";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { credentials: "include", ...options });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (body as { message?: string })?.message || res.statusText;
    throw new ApiError(res.status, msg, body);
  }
  return body as T;
}

function jsonRequest<T>(path: string, method: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function formRequest<T>(path: string, method: string, form: FormData): Promise<T> {
  return request<T>(path, { method, body: form });
}

// ============ Types ============
export type Admin = { _id: string; username: string };

export type SubCategory = { _id: string; nameAR: string; nameEN: string };
export type Category = {
  _id: string;
  nameEN: string;
  nameAR: string;
  subCategories: SubCategory[];  // populated on GET, may be [] if not fetched
};

export type ProductSizeImage = { url: string; publicId: string };
export type ProductSize = {
  subCategoryId: string;
  label: string;
  images: ProductSizeImage[];
};

export type Product = {
  _id: string;
  nameAR: string;
  nameEN: string;
  description: string;
  fullDescription: string;
  category: Category;
  featured: boolean;
  features: string[];
  sizes: ProductSize[];
};

export type Paginated<T> = { items: T[]; page: number; limit: number; total: number; pages: number };

// ============ Auth ============
export const authApi = {
  login: (username: string, password: string) =>
    jsonRequest<{ admin: Admin }>("/api/auth/login", "POST", { username, password }),
  logout: () => jsonRequest<void>("/api/auth/logout", "POST"),
  me: () => jsonRequest<{ admin: Admin }>("/api/auth/me", "GET"),
};

// ============ Categories ============
export const categoriesApi = {
  list: () => jsonRequest<Category[]>("/api/categories", "GET"),
  get: (id: string) => jsonRequest<Category>(`/api/categories/${id}`, "GET"),
  create: (data: { nameAR: string; nameEN?: string; subCategories?: { nameAR: string; nameEN?: string }[] }) =>
    jsonRequest<Category>("/api/categories", "POST", data),
  update: (id: string, data: { nameAR?: string; nameEN?: string; subCategories?: { nameAR: string; nameEN?: string }[] }) =>
    jsonRequest<Category>(`/api/categories/${id}`, "PUT", data),
  remove: (id: string) => jsonRequest<void>(`/api/categories/${id}`, "DELETE"),
};

// ============ Products ============
export const productsApi = {
  list: (params: { page?: number; limit?: number; category?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.category) qs.set("category", params.category);
    const tail = qs.toString() ? `?${qs}` : "";
    return jsonRequest<Paginated<Product>>(`/api/products${tail}`, "GET");
  },
  get: (id: string) => jsonRequest<Product>(`/api/products/${id}`, "GET"),
  create: (form: FormData) => formRequest<Product>("/api/products", "POST", form),
  update: (id: string, form: FormData) => formRequest<Product>(`/api/products/${id}`, "PUT", form),
  remove: (id: string) => jsonRequest<void>(`/api/products/${id}`, "DELETE"),
  toggleFeatured: (id: string, featured: boolean) =>
    jsonRequest<{ featured: boolean }>(`/api/products/${id}`, "PATCH", { featured }),
};
