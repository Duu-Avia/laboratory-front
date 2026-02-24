import { env } from "@/lib/config/env";

const normalizeBasePath = (value?: string) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") return "";
  const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeading.replace(/\/+$/, "");
};

const withLeadingSlash = (path: string) =>
  path.startsWith("/") ? path : `/${path}`;

export const APP_BASE_PATH = normalizeBasePath(env.appBasePath);

export const withBasePath = (path: string) => {
  const normalized = withLeadingSlash(path);
  if (!APP_BASE_PATH) return normalized;
  if (normalized === "/") return APP_BASE_PATH;
  return `${APP_BASE_PATH}${normalized}`;
};

const APP_ROUTE_PREFIX = "";

const withAppPrefix = (path: string) => {
  const normalized = withLeadingSlash(path);
  if (normalized === "/") return withBasePath(APP_ROUTE_PREFIX);
  return withBasePath(`${APP_ROUTE_PREFIX}${normalized}`);
};

export const ROUTES = {
  home: () => withBasePath("/"),
  login: () => withBasePath("/login"),
  app: {
    approve: () => withAppPrefix("/approve"),
    archive: () => withAppPrefix("/archive"),
    employees: () => withAppPrefix("/employees"),
    labSpec: () => withAppPrefix("/lab-spec"),
    locations: () => withAppPrefix("/locations"),
    reportDetail: (id: number | string) =>
      withAppPrefix(`/reports/${id}`),
  },
} as const;
