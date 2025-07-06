-- Add api_token column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS api_token VARCHAR(255) UNIQUE;

-- Create index on api_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_api_token ON users(api_token);

-- Add trigger to ensure api_token is always set
CREATE OR REPLACE FUNCTION ensure_api_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.api_token IS NULL THEN
        NEW.api_token := 'vv_' || encode(gen_random_bytes(24), 'base64');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER ensure_api_token_trigger
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION ensure_api_token(); 