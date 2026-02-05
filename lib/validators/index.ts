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
});
export type EmployeeForm = z.infer<typeof employeeValidation>;

// ─── Report ───────────────────────────────────────────────────
export const reportValidation = z.object({
  reportTitle: z.string().optional(),
  labTypeId: rules.requiredNumber("Дээжний төрөл сонгоно уу"),
  assignedTo: rules.requiredNumber("Хянах инженер сонгоно уу"),
  sampled_by: rules.requiredString("Дээж авчирсан хүний нэр оруулна уу"),
  sample_amount:rules.requiredString("Дээжний хэмжээ оруулна уу"),
  indicatorNames:z.array(z.number()).min(1, "Дор хаяж нэг үзүүлэлт сонгоно уу"),
  sampleNames: z
    .array(z.string())
    .refine((names) => names.some((n) => n.trim() !== ""), {
      message: "Дор хаяж нэг дээж нэмнэ үү",
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
