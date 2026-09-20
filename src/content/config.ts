import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        date: z.coerce.date(),
        description: z.string().optional().default(''),
        coverImage: image().optional(),
        coverImageAlt: z.string().optional(),
      })
      .refine((post) => !post.coverImage || !!post.coverImageAlt?.trim(), {
        message: 'coverImageAlt is required whenever coverImage is set',
        path: ['coverImageAlt'],
      }),
});

export const collections = { blog };
