-- Create approval workflows table
CREATE TABLE public.approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  form_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create submission approvals table
CREATE TABLE public.submission_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL,
  workflow_id UUID NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress')),
  approval_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assignment rules table
CREATE TABLE public.assignment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  form_id UUID,
  rule_name TEXT NOT NULL,
  conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  assign_to UUID,
  assign_to_team UUID,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create form assignments table
CREATE TABLE public.form_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL,
  assigned_to UUID NOT NULL,
  assigned_by UUID,
  rule_id UUID,
  status TEXT NOT NULL CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create SLA settings table
CREATE TABLE public.sla_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  form_id UUID,
  name TEXT NOT NULL,
  first_response_hours INTEGER,
  resolution_hours INTEGER,
  business_hours_only BOOLEAN NOT NULL DEFAULT false,
  escalation_rules JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create SLA tracking table
CREATE TABLE public.sla_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL,
  sla_id UUID NOT NULL,
  first_response_due TIMESTAMP WITH TIME ZONE,
  resolution_due TIMESTAMP WITH TIME ZONE,
  first_response_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('on_track', 'at_risk', 'breached')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create internal notes table
CREATE TABLE public.submission_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL,
  user_id UUID NOT NULL,
  note_text TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT true,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for approval_workflows
CREATE POLICY "Users can manage own workflows"
  ON public.approval_workflows FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for submission_approvals
CREATE POLICY "Users can view approvals for their forms"
  ON public.submission_approvals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM approval_workflows w
    WHERE w.id = submission_approvals.workflow_id
    AND w.user_id = auth.uid()
  ));

CREATE POLICY "Users can create submission approvals"
  ON public.submission_approvals FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM approval_workflows w
    WHERE w.id = workflow_id
    AND w.user_id = auth.uid()
  ));

CREATE POLICY "Users can update approvals for their workflows"
  ON public.submission_approvals FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM approval_workflows w
    WHERE w.id = submission_approvals.workflow_id
    AND w.user_id = auth.uid()
  ));

-- RLS Policies for assignment_rules
CREATE POLICY "Users can manage own assignment rules"
  ON public.assignment_rules FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for form_assignments
CREATE POLICY "Users can view assignments for their forms"
  ON public.form_assignments FOR SELECT
  USING (
    auth.uid() = assigned_to OR 
    auth.uid() = assigned_by OR
    EXISTS (
      SELECT 1 FROM assignment_rules r
      WHERE r.id = form_assignments.rule_id
      AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create assignments"
  ON public.form_assignments FOR INSERT
  WITH CHECK (auth.uid() = assigned_by);

CREATE POLICY "Assigned users can update their assignments"
  ON public.form_assignments FOR UPDATE
  USING (auth.uid() = assigned_to);

-- RLS Policies for sla_settings
CREATE POLICY "Users can manage own SLA settings"
  ON public.sla_settings FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for sla_tracking
CREATE POLICY "Users can view SLA tracking for their forms"
  ON public.sla_tracking FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM sla_settings s
    WHERE s.id = sla_tracking.sla_id
    AND s.user_id = auth.uid()
  ));

CREATE POLICY "System can create SLA tracking"
  ON public.sla_tracking FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update SLA tracking"
  ON public.sla_tracking FOR UPDATE
  USING (true);

-- RLS Policies for submission_notes
CREATE POLICY "Team members can view notes"
  ON public.submission_notes FOR SELECT
  USING (true);

CREATE POLICY "Users can create notes"
  ON public.submission_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON public.submission_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON public.submission_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_approval_workflows_user ON public.approval_workflows(user_id);
CREATE INDEX idx_approval_workflows_form ON public.approval_workflows(form_id);
CREATE INDEX idx_submission_approvals_submission ON public.submission_approvals(submission_id);
CREATE INDEX idx_submission_approvals_workflow ON public.submission_approvals(workflow_id);
CREATE INDEX idx_assignment_rules_user ON public.assignment_rules(user_id);
CREATE INDEX idx_assignment_rules_form ON public.assignment_rules(form_id);
CREATE INDEX idx_form_assignments_submission ON public.form_assignments(submission_id);
CREATE INDEX idx_form_assignments_assigned_to ON public.form_assignments(assigned_to);
CREATE INDEX idx_sla_settings_user ON public.sla_settings(user_id);
CREATE INDEX idx_sla_tracking_submission ON public.sla_tracking(submission_id);
CREATE INDEX idx_submission_notes_submission ON public.submission_notes(submission_id);