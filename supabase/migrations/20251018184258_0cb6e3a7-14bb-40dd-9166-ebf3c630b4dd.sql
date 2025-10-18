-- Add unique constraint to payment_integrations table
ALTER TABLE payment_integrations 
ADD CONSTRAINT payment_integrations_user_provider_unique 
UNIQUE (user_id, provider);