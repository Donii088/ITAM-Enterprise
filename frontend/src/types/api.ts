// Mirrors Itam.Application.Responses.ApiResponse<T> and Itam.Application.Common.PagedResult<T>

export interface ApiResponse<TData = unknown> {
  success: boolean;
  message: string;
  errors: string[];
  data: TData;
  timestamp: string;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PagedQuery {
  pageNumber?: number;
  pageSize?: number;
}

export interface ApiError {
  status: number;
  message: string;
  errors: string[];
}
