-- Add admin role management policies
-- Only admins can assign/modify roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add admin policies to sensitive tables for future use
-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all forms
CREATE POLICY "Admins can view all forms"
ON public.forms
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all logs
CREATE POLICY "Admins can view all logs"
ON public.logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
ON public.payments
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));