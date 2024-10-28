export class RequestParamsDTO {
  page?: number;
  limit?: number;
  search?: string;
  order_by?: string;
  order?: 'asc' | 'desc';
}
