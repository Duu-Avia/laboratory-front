/**
 * User-related types
 */

import { LabType } from "./sample";

export type SeniorEngineer = {
  id: number;
  email: string;
};

export type UserProfile = {
  id: number;
  email: string;
  role_name: string;
  created_at: string;
};

export type UpdateProfilePayload = {
  email: string;
};

export type ChangePasswordPayload = {
  old_password: string;
  new_password: string;
};

export type Employee = {
  id: number;
  email: string;
  role_id: number;
  role_name: string;
  is_active: boolean;
  created_at: string;
  lab_types: LabType[];
};

export type Roles = {
  id: number;
  role_name: string;
  description: string;
};
