-- Fix 1: Update database functions to use secure search_path settings
-- This prevents SQL injection attacks through search_path manipulation

-- Fix the is_admin function to use a secure search_path
CREATE OR REPLACE FUNCTION public.is_admin(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE admin_roles.user_email = $1 
    AND is_active = true
  );
$function$;

-- Fix the update_updated_at_column function to use secure search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Create a secure function to get current user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $function$
  SELECT role FROM public.admin_roles 
  WHERE user_email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ) AND is_active = true
  LIMIT 1;
$function$;

-- Create audit table for admin role changes
CREATE TABLE IF NOT EXISTS public.admin_role_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_by_email text NOT NULL,
  target_user_email text NOT NULL,
  old_role text,
  new_role text,
  action text NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'activated', 'deactivated')),
  created_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Enable RLS on audit table
ALTER TABLE public.admin_role_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs" ON public.admin_role_audit
FOR SELECT USING (
  public.is_admin((SELECT email FROM auth.users WHERE id = auth.uid())::text)
);

-- Create trigger function for admin role auditing
CREATE OR REPLACE FUNCTION public.audit_admin_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  current_user_email text;
BEGIN
  -- Get current user email
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.admin_role_audit (
      changed_by_email, target_user_email, new_role, action
    ) VALUES (
      COALESCE(current_user_email, 'system'), NEW.user_email, NEW.role, 'created'
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log role changes
    IF OLD.role != NEW.role THEN
      INSERT INTO public.admin_role_audit (
        changed_by_email, target_user_email, old_role, new_role, action
      ) VALUES (
        COALESCE(current_user_email, 'system'), NEW.user_email, OLD.role, NEW.role, 'updated'
      );
    END IF;
    
    -- Log activation/deactivation
    IF OLD.is_active != NEW.is_active THEN
      INSERT INTO public.admin_role_audit (
        changed_by_email, target_user_email, old_role, new_role, action
      ) VALUES (
        COALESCE(current_user_email, 'system'), NEW.user_email, NEW.role, NEW.role, 
        CASE WHEN NEW.is_active THEN 'activated' ELSE 'deactivated' END
      );
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.admin_role_audit (
      changed_by_email, target_user_email, old_role, action
    ) VALUES (
      COALESCE(current_user_email, 'system'), OLD.user_email, OLD.role, 'deleted'
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$;

-- Create trigger for admin role auditing
DROP TRIGGER IF EXISTS audit_admin_roles_trigger ON public.admin_roles;
CREATE TRIGGER audit_admin_roles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_admin_role_changes();

-- Strengthen admin_roles RLS policies to prevent privilege escalation
DROP POLICY IF EXISTS "Admins can read admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Super admins can manage admin roles" ON public.admin_roles;

-- Only allow reading own role + admins can see all roles
CREATE POLICY "Users can read admin roles" ON public.admin_roles
FOR SELECT USING (
  user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR public.is_admin((SELECT email FROM auth.users WHERE id = auth.uid())::text)
);

-- Only super admins can manage admin roles, but cannot escalate themselves
CREATE POLICY "Super admins can manage admin roles" ON public.admin_roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles admin_roles_1
    WHERE admin_roles_1.user_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
    AND admin_roles_1.role = 'super_admin'
    AND admin_roles_1.is_active = true
  )
  -- Prevent self-escalation: cannot modify own role
  AND user_email != (SELECT email FROM auth.users WHERE id = auth.uid())::text
);

-- Create rate limiting table for sensitive operations
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text,
  operation text NOT NULL,
  ip_address inet,
  created_at timestamp with time zone DEFAULT now(),
  success boolean DEFAULT true
);

-- Enable RLS on rate limit table
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read rate limit logs
CREATE POLICY "Admins can read rate limit logs" ON public.rate_limit_log
FOR SELECT USING (
  public.is_admin((SELECT email FROM auth.users WHERE id = auth.uid())::text)
);

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  operation_name text,
  max_attempts integer DEFAULT 5,
  time_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT (
    SELECT COUNT(*) 
    FROM public.rate_limit_log 
    WHERE operation = operation_name
    AND (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    AND created_at > (now() - (time_window_minutes || ' minutes')::interval)
  ) < max_attempts;
$function$;