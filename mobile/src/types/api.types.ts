export interface JsonApiResource<T> {
  id: string;
  type: string;
  attributes: T;
}

export interface JsonApiCollection<T> {
  data: JsonApiResource<T>[];
}

export interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_count: number;
}
