/**
 * Location-related types
 */

export type LocationPackage = {
  id: number;
  package_name: string;
  sample_type_id: number;
};

export type LocationSample = {
  id: number;
  location_name: string;
  sort_order: number;
};
