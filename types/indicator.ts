/**
 * Indicator-related types
 */

export type Indicator = {
  id: number;
  indicator_name: string;
  unit?: string;
  method?: string;
  limit?: string;
  is_default?: boolean;
  input_type?: string;
};

export type IndicatorRow = {
  indicator_id: number;
  indicator_name: string;
  unit?: string;
  input_type: string;
  limit_value?: string;
  sample_indicator_ids: number[];
  result_value?: string;
  is_detected?: boolean | null;
  is_within_limit?: boolean | null;
  is_default?: boolean | number | null;
  avg: string | null;
};

export type IndicatorRowForLabSpec = {
  id: number;
  sample_type_id: number;
  indicator_name: string;
  unit?: string | null;
  test_method?: string | null;
  limit_value?: string | null;
  is_default?: boolean | number | null;
};

export type NewIndicatorDraft = {
  sample_type_id: number | null;
  indicator_name: string;
  unit: string;
  test_method: string;
  limit_value: string;
  is_default: boolean;
};
