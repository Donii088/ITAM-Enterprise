export interface SearchItem {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  status: string | null;
  priority: string | null;
  createdAt: string;
}

export interface SearchResults {
  users: SearchItem[];
  assets: SearchItem[];
  tickets: SearchItem[];
  totalMatches: number;
}

export interface GetSearchQuery {
  term: string;
  limit?: number;
}
