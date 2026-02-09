import { z } from "zod";

// ─── Reusable rules ───────────────────────────────────────────
export const rules = {
  email: z
    .string()
    .min(1, "Имэйл оруулна уу")
    .email("Имэйл буруу байна"),
  password: z
    .string().min(1, "Нууц үг оруулна уу").min(6, "Хамгийн багадаа 6 тэмдэгт"),
  requiredString: (msg = "Заавал бөглөнө үү") => z.string().min(1, msg),
  requiredNumber: (msg = "Заавал сонгоно уу") =>
    z.number({ message: msg }).min(1, msg),
};

// ─── Login ────────────────────────────────────────────────────
export const loginValidation = z.object({
  email: rules.requiredString("Имэйл оруулна уу"),
  password: rules.requiredString("Нууц үг оруулна уу"),
});
export type LoginForm = z.infer<typeof loginValidation>;

// ─── Employee ─────────────────────────────────────────────────
export const employeeValidation = z.object({
  email: rules.email,
  password: rules.password,
  fullName: z.string().trim().min(4, "Дууддаг хочоо оруулааач???"),
  roleId: z.number().min(1, "Шинэ хэрэглэгчийн эрхээ сонгоно уу"),
  position_name: z.string().trim().min(1, "Албан тушаал оруулна уу"),
});
export type EmployeeForm = z.infer<typeof employeeValidation>;

// ─── Report ───────────────────────────────────────────────────
export const reportValidation = z.object({
  reportTitle: z.string().optional(),
  labTypeId: rules.requiredNumber("Сорьцын төрөл сонгоно уу"),
  sampled_by: rules.requiredString("Сорьц авчирсан хүний нэр оруулна уу"),
  sample_amount:rules.requiredString("Сорьцын хэмжээ оруулна уу"),
  indicatorNames:z.array(z.number()).min(1, "Дор хаяж нэг үзүүлэлт сонгоно уу"),
  sampleNames: z
    .array(z.string())
    .refine((names) => names.some((n) => n.trim() !== ""), {
      message: "Дор хаяж нэг Сорьц нэмнэ үү",
    }),
});
export type ReportForm = z.infer<typeof reportValidation>;

// ─── Lab Type ─────────────────────────────────────────────
export const labTypeValidation = z.object({
  type_name: z
    .string()
    .trim()
    .min(1, "Төрлийн нэр оруулна уу")
    .min(2, "Төрлийн нэр хамгийн багадаа 2 тэмдэгт байх ёстой")
    .max(100, "Төрлийн нэр хэтэрхий урт байна"),
  standard: z
    .string()
    .trim()
    .min(1, "Стандарт оруулна уу")
    .min(2, "Стандарт хамгийн багадаа 2 тэмдэгт байх ёстой")
    .max(200, "Стандарт хэтэрхий урт байна"),
});
export type LabTypeForm = z.infer<typeof labTypeValidation>;

// ─── Location Package ─────────────────────────────────────────
export const locationPackageValidation = z.object({
  package_name: z
    .string()
    .trim()
    .min(1, "Багцын нэр оруулна уу")
    .min(2, "Багцын нэр хамгийн багадаа 2 тэмдэгт байх ёстой")
    .max(100, "Багцын нэр хэтэрхий урт байна"),
  lab_type_id: z.number().min(1, "Сорьцын төрөл сонгоно уу"),
});
export type LocationPackageForm = z.infer<typeof locationPackageValidation>;

// ─── Location Sample ──────────────────────────────────────────
export const locationSampleValidation = z.object({
  location_name: z
    .string()
    .trim()
    .min(1, "Байршлын нэр оруулна уу")
    .min(2, "Байршлын нэр хамгийн багадаа 2 тэмдэгт байх ёстой")
    .max(100, "Байршлын нэр хэтэрхий урт байна"),
  sort_order: z.number().min(0, "Дараалал 0-ээс их байх ёстой"),
});
export type LocationSampleForm = z.infer<typeof locationSampleValidation>;
