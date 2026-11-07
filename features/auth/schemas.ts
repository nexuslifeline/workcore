import { z } from 'zod'

export const emailSchema = z.email({
  error: (iss) => (iss.input === '' ? 'Please enter your email' : undefined),
})

export const passwordSchema = z
  .string()
  .min(1, 'Please enter your password')
  .min(7, 'Password must be at least 7 characters long')

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })









