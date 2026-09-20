import { config, fields, collection } from '@keystatic/core';

// Uploaded filenames (e.g. macOS screenshots like "Screenshot 2026-08-14 at
// 10.30.45 (2).png") often contain spaces and parentheses. Parentheses are
// especially dangerous: CommonMark image syntax uses unescaped "(" / ")" to
// delimit the URL, so a literal paren in the filename can silently truncate
// the image reference. Strip anything that isn't alphanumeric down to a
// single hyphen so this class of bug can't recur.
function sanitizeUploadedFilename(originalFilename: string) {
  const lastDot = originalFilename.lastIndexOf('.');
  const ext = lastDot > 0 ? originalFilename.slice(lastDot) : '';
  const base = lastDot > 0 ? originalFilename.slice(0, lastDot) : originalFilename;
  const safeBase = base.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'image';
  return `${safeBase}${ext}`;
}

export default config({
  storage: {
    kind: 'cloud',
  },
  cloud: {
    project: 'iims/personal-site',
  },
  collections: {
    posts: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        date: fields.date({ label: 'Date' }),
        description: fields.text({ label: 'Description', multiline: true }),
        coverImage: fields.image({
          label: 'Cover Image',
          description:
            'Used for social sharing previews (Open Graph/Twitter). Recommended 1200x630px. Falls back to the site default if unset.',
          directory: 'src/content/blog',
          publicPath: '.',
          validation: { isRequired: false },
        }),
        // Kept as a plain sibling field (rather than nesting it under
        // coverImage) so the site build can enforce "required whenever a
        // cover image is set" via a Zod .refine() in src/content/config.ts —
        // Keystatic's own field-level validation can't express a
        // required-if-sibling-is-set rule, and forcing it unconditionally
        // would block posts that intentionally have no custom cover image.
        coverImageAlt: fields.text({
          label: 'Cover Image Alt Text',
          description:
            'Describe what\'s in the cover image, for screen readers and platforms that read image alt text. Required if a cover image is set above — the site build fails without it.',
        }),
        content: fields.markdoc({
          label: 'Content',
          extension: 'md',
          options: {
            // Astro's content-collection markdown renderer only optimizes
            // images referenced by a *relative* path resolved against the
            // .md file's own directory — an absolute "/src/..." publicPath
            // is left untouched and 404s at runtime. Since posts are flat
            // files directly in src/content/blog, the image directory must
            // be that same folder, and publicPath must stay relative
            // (slug-namespaced) so different posts' uploads can't collide.
            image: {
              directory: 'src/content/blog',
              publicPath: '.',
              transformFilename: sanitizeUploadedFilename,
              // Keystatic's markdoc image insert already has a built-in
              // (optional-by-default) alt text field in its upload dialog;
              // this just makes it mandatory so it can't be skipped.
              schema: {
                alt: fields.text({
                  label: 'Alt Text',
                  description: 'Describe what\'s in the image, for screen readers and search engines.',
                  validation: { isRequired: true },
                }),
              },
            },
          },
        }),
      },
    }),
  },
});
