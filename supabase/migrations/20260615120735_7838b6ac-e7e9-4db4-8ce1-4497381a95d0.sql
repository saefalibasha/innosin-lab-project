CREATE OR REPLACE FUNCTION public.slugify(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT trim(both '-' from regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '-', 'g'));
$$;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug text;

UPDATE public.products
SET slug = public.slugify(name)
WHERE is_series_parent = true
  AND (slug IS NULL OR slug = '');

WITH dupes AS (
  SELECT id, slug,
         row_number() OVER (PARTITION BY slug ORDER BY created_at) AS rn
  FROM public.products
  WHERE is_series_parent = true AND slug IS NOT NULL
)
UPDATE public.products p
SET slug = p.slug || '-' || substring(p.id::text, 1, 6)
FROM dupes d
WHERE p.id = d.id AND d.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_parent_unique
  ON public.products (slug)
  WHERE is_series_parent = true AND slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS products_slug_idx ON public.products (slug);