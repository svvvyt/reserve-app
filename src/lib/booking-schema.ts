import * as z from 'zod';

export const bookingSchema = z.object({
  branch: z.string().min(1, 'Выберите филиал'),
  specialist: z.string().min(1, 'Выберите специалиста'),
  service: z.string().min(1, 'Выберите услугу'),
  date: z.date({ required_error: 'Выберите дату' }),
  time: z.string().min(1, 'Выберите время'),
  fullName: z.string().min(2, 'Введите ваше имя (не менее 2 символов)'),
  phone: z
    .string()
    .min(7, 'Введите ваш номер телефона (без доп. символов)')
    .regex(
      /^\+?\d{7,15}$/,
      'Введите корректный номер телефона (7–15 цифр, без доп. символов)'
    ),
  telegram: z.string().optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;
