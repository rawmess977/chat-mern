import { z } from "zod";

const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full Name must be at least 2 characters")
    .max(50, "Full name must be at most 50 characters")
    .regex(/^[A-Za-z\s]+$/, "Full name must contain letters and spaces only"),

  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/\d/, "Password must contain at least one number"),
});

export default signupSchema;
