export type ActivityLogItem = {
  row_num: number;
  id: number;
  full_name: string;
  email: string;
  action: string;
  description: string;
  method: string;
  status_code: number;
  target_id: number;
  user_id: number;
  created_at: Date;
  path: string;
  target_type: string;
};

export type ActivityLogType = {
  data: ActivityLogItem[];
  pagination: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
};
