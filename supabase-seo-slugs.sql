-- 1. Create a function to generate slugs from text
CREATE OR REPLACE FUNCTION generate_slug(value TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        translate(value, 'áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇ', 'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC'),
        '[^a-zA-Z0-9]+', '-', 'g'
      ),
      '^-+|-+$', '', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- 2. Add slug columns (initially allowing NULL so we can backfill)
ALTER TABLE public.product_types ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS slug TEXT;

-- 3. Backfill existing data using the function
UPDATE public.product_types SET slug = generate_slug(name) WHERE slug IS NULL;
UPDATE public.categories SET slug = generate_slug(name) WHERE slug IS NULL;

-- 4. In a real-world scenario with many identical names, we'd need to handle duplicates,
-- but assuming distinct names, we can safely enforce UNIQUE and NOT NULL constraints now.
ALTER TABLE public.product_types ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.product_types ADD CONSTRAINT product_types_slug_unique UNIQUE (slug);

ALTER TABLE public.categories ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.categories ADD CONSTRAINT categories_slug_unique UNIQUE (slug);
