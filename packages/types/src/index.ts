export interface Paste {
  id: string;
  code: string;
  title?: string;
  content: string;
  language?: string;
  expiresAt?: string | null;
  burnAfterRead: boolean;
  createdAt: string;
}

export interface CreatePasteRequest {
  title?: string;
  content: string;
  language?: string;
  expiresIn?: '1h' | '24h' | '7d' | 'never';
  burnAfterRead?: boolean;
  password?: string;
}

export interface CreatePasteResponse {
  code: string;
  url: string;
}

export interface PasteExistsResponse {
  exists: boolean;
  passwordProtected: boolean;
  burnAfterRead: boolean;
}

export interface ApiError {
  error: string;
  message: string;
}