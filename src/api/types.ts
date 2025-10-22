export interface PaginationQuery {
  cursor?: string;
  limit?: number;
}

export interface SortingQuery {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterQuery {
  [key: string]: string | number | boolean | undefined;
}

export interface ApiListRequest {
  pagination?: PaginationQuery;
  sorting?: SortingQuery;
  filters?: FilterQuery;
  fields?: string[];
}

export interface ApiListResponse<T> {
  items: T[];
  nextCursor?: string;
  previousCursor?: string;
}

export interface ApiBulkResponse<T> {
  processed: number;
  successful: number;
  failed: number;
  results: Array<{ item: Partial<T>; status: 'success' | 'failed'; error?: string }>;
}

export interface ApiError {
  statusCode: number;
  message: string;
  details?: Record<string, unknown>;
}
