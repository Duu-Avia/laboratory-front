/**
 * Location-related types
 */

export type LocationSample = {
  id: number;
  location_name: string;
  sort_order: number;
};

export type LocationPackage = {
  id: number;
  package_name: string;
  lab_type_id: number;
  created_at?: string;
  samples?: LocationSample[];
};
