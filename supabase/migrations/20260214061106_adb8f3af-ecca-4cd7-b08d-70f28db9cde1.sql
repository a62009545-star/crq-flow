
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('engineer', 'cfm', 'domain_head', 'cab', 'change_manager', 'noc');

-- Create CRQ state enum
CREATE TYPE public.crq_state AS ENUM (
  'draft', 'impact_analysis', 'approval_pending', 'cab_review', 
  'scheduled', 'pre_validation', 'implemented', 'closed', 'rejected'
);

-- Create change type enum
CREATE TYPE public.change_type AS ENUM ('standard', 'normal', 'emergency', 'latent');

-- Create file type enum
CREATE TYPE public.attachment_type AS ENUM ('mop', 'backout', 'other');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  domain TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- CRQ table
CREATE TABLE public.crqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  domain TEXT NOT NULL,
  change_type change_type NOT NULL DEFAULT 'standard',
  state crq_state NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  scheduled_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.crqs ENABLE ROW LEVEL SECURITY;

-- CRQ attachments table
CREATE TABLE public.crq_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crq_id UUID REFERENCES public.crqs(id) ON DELETE CASCADE NOT NULL,
  file_type attachment_type NOT NULL DEFAULT 'other',
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.crq_attachments ENABLE ROW LEVEL SECURITY;

-- Audit log table (immutable)
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crq_id UUID REFERENCES public.crqs(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  previous_state TEXT,
  new_state TEXT,
  performed_by UUID REFERENCES auth.users(id) NOT NULL,
  details JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get user domain
CREATE OR REPLACE FUNCTION public.get_user_domain(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT domain FROM public.profiles WHERE user_id = _user_id
$$;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_crqs_updated_at
  BEFORE UPDATE ON public.crqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), NEW.email);
  -- Default role: engineer
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'engineer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Profiles: authenticated users can read all profiles
CREATE POLICY "Users can read all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- User roles: users can read all roles, only change_manager can insert/update
CREATE POLICY "Users can read roles" ON public.user_roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Change managers can manage roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'change_manager'));

CREATE POLICY "Change managers can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'change_manager'));

CREATE POLICY "Change managers can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'change_manager'));

-- CRQs: role-based visibility
CREATE POLICY "Engineers see own CRQs" ON public.crqs
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR public.has_role(auth.uid(), 'change_manager')
    OR (public.has_role(auth.uid(), 'cfm') AND domain = public.get_user_domain(auth.uid()))
    OR (public.has_role(auth.uid(), 'domain_head') AND domain = public.get_user_domain(auth.uid()))
    OR (public.has_role(auth.uid(), 'cab') AND state = 'cab_review')
    OR (public.has_role(auth.uid(), 'noc') AND state = 'scheduled')
  );

CREATE POLICY "Authenticated users can create CRQs" ON public.crqs
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "CRQ state updates" ON public.crqs
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR public.has_role(auth.uid(), 'change_manager')
    OR (public.has_role(auth.uid(), 'cfm') AND domain = public.get_user_domain(auth.uid()))
    OR (public.has_role(auth.uid(), 'domain_head') AND domain = public.get_user_domain(auth.uid()))
    OR (public.has_role(auth.uid(), 'cab') AND state = 'cab_review')
    OR (public.has_role(auth.uid(), 'noc') AND state = 'scheduled')
  );

-- Attachments: tied to CRQ access
CREATE POLICY "Attachment access follows CRQ access" ON public.crq_attachments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.crqs WHERE id = crq_id AND (
        created_by = auth.uid()
        OR public.has_role(auth.uid(), 'change_manager')
        OR (public.has_role(auth.uid(), 'cfm') AND domain = public.get_user_domain(auth.uid()))
        OR (public.has_role(auth.uid(), 'domain_head') AND domain = public.get_user_domain(auth.uid()))
        OR (public.has_role(auth.uid(), 'cab') AND crqs.state = 'cab_review')
        OR (public.has_role(auth.uid(), 'noc') AND crqs.state = 'scheduled')
      )
    )
  );

CREATE POLICY "Users can upload attachments to accessible CRQs" ON public.crq_attachments
  FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

-- Audit log: append only, read follows CRQ access
CREATE POLICY "Audit log read follows CRQ access" ON public.audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.crqs WHERE id = crq_id AND (
        created_by = auth.uid()
        OR public.has_role(auth.uid(), 'change_manager')
        OR (public.has_role(auth.uid(), 'cfm') AND domain = public.get_user_domain(auth.uid()))
        OR (public.has_role(auth.uid(), 'domain_head') AND domain = public.get_user_domain(auth.uid()))
        OR (public.has_role(auth.uid(), 'cab') AND crqs.state = 'cab_review')
        OR (public.has_role(auth.uid(), 'noc') AND crqs.state = 'scheduled')
      )
    )
  );

CREATE POLICY "Authenticated can insert audit logs" ON public.audit_log
  FOR INSERT TO authenticated
  WITH CHECK (performed_by = auth.uid());

-- No update or delete on audit_log (immutable)
