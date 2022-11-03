export interface Message {
  message: string;
}

export interface StoreGetQuery {
  query?: string,
  page?: number,
  page_size?: number,
  sort?: string,
  fields?: string
}