/**
 * Sample-related types
 */

import { Indicator } from "./indicator";

export type SampleType = {
  id: number;
  type_name: string;
  standard: string;
};

export type SampleIndicatorItem = {
  sample_indicator_id: number;
  indicator_id: number;
  indicator_name: string;
  unit?: string | null;
  avg: string | null;
  input_type: string;
  limit_value?: string | null;
  result?: {
    test_result_id: number;
    result_value?: string | null;
    is_detected?: boolean | null;
    is_within_limit?: boolean | null;
  } | null;
};

export type SampleColumn = {
  sample_id: number;
  sample_name: string;
  sample_amount: string;
  location?: string;
  indicators: SampleIndicatorItem[];
};

export type SampleGroup = {
  sample_type_id: number | null;
  sample_ids: (number | null)[];
  sample_names: string[];
  sample_amount: string;
  location: string;
  sample_date: string;
  sampled_by: string;
  indicators: number[];
  availableIndicators: Indicator[];
};

export type SampleGroupEdit = {
  sample_type_id: number | null;
  sample_ids: (number | null)[];
  sample_names: string[];
  location: string;
  sample_date: string;
  sampled_by: string;
  indicators: number[];
  availableIndicators: Indicator[];
};
