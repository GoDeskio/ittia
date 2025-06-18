-- Create voice_libraries table
CREATE TABLE IF NOT EXISTS voice_libraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    api_key VARCHAR(255),
    token TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on owner for faster lookups
CREATE INDEX IF NOT EXISTS idx_voice_libraries_owner ON voice_libraries(owner);

-- Create index on is_public for faster filtering
CREATE INDEX IF NOT EXISTS idx_voice_libraries_is_public ON voice_libraries(is_public);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_voice_libraries_updated_at
    BEFORE UPDATE ON voice_libraries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 