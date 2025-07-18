-- Migration: Create audio metadata tables for ElevenLabs integration
-- This migration creates tables to store detailed audio metadata including
-- word-level emotion analysis, location data, and voice cloning information

-- Create audio_recordings table
CREATE TABLE IF NOT EXISTS audio_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    duration DECIMAL(10, 3) NOT NULL, -- Duration in seconds
    sample_rate INTEGER NOT NULL,
    channels INTEGER NOT NULL,
    format VARCHAR(10) NOT NULL, -- wav, mp3, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create audio_metadata table for overall recording metadata
CREATE TABLE IF NOT EXISTS audio_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recording_id UUID NOT NULL REFERENCES audio_recordings(id) ON DELETE CASCADE,
    overall_sentiment DECIMAL(5, 3), -- Overall sentiment score
    overall_emotion_data JSONB, -- Store complex emotion data
    recording_location JSONB, -- GPS coordinates and location info
    recording_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    processing_version VARCHAR(50), -- Version of processing algorithm used
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create word_metadata table for word-level analysis
CREATE TABLE IF NOT EXISTS word_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recording_id UUID NOT NULL REFERENCES audio_recordings(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    start_time DECIMAL(10, 3) NOT NULL, -- Start time in seconds
    end_time DECIMAL(10, 3) NOT NULL, -- End time in seconds
    confidence DECIMAL(5, 4) NOT NULL, -- Confidence score 0-1
    sentiment_score DECIMAL(5, 3), -- Word-level sentiment
    emotion_joy DECIMAL(5, 4) DEFAULT 0,
    emotion_sadness DECIMAL(5, 4) DEFAULT 0,
    emotion_anger DECIMAL(5, 4) DEFAULT 0,
    emotion_fear DECIMAL(5, 4) DEFAULT 0,
    emotion_surprise DECIMAL(5, 4) DEFAULT 0,
    emotion_disgust DECIMAL(5, 4) DEFAULT 0,
    word_location JSONB, -- Location when this word was spoken (if available)
    word_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create cloned_voices table for voice cloning management
CREATE TABLE IF NOT EXISTS cloned_voices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    elevenlabs_voice_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'cloned',
    preview_url TEXT,
    settings JSONB, -- Voice settings like stability, similarity_boost
    source_recordings JSONB, -- References to original recordings used for cloning
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create voice_conversions table to track speech-to-speech conversions
CREATE TABLE IF NOT EXISTS voice_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_recording_id UUID REFERENCES audio_recordings(id) ON DELETE SET NULL,
    target_voice_id UUID REFERENCES cloned_voices(id) ON DELETE SET NULL,
    elevenlabs_voice_id VARCHAR(255), -- Direct ElevenLabs voice ID if not using cloned voice
    converted_file_path TEXT NOT NULL,
    conversion_settings JSONB, -- Settings used for conversion
    processing_time_ms INTEGER, -- Time taken for conversion
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audio_recordings_user_id ON audio_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_recordings_created_at ON audio_recordings(created_at);
CREATE INDEX IF NOT EXISTS idx_audio_metadata_recording_id ON audio_metadata(recording_id);
CREATE INDEX IF NOT EXISTS idx_word_metadata_recording_id ON word_metadata(recording_id);
CREATE INDEX IF NOT EXISTS idx_word_metadata_start_time ON word_metadata(start_time);
CREATE INDEX IF NOT EXISTS idx_word_metadata_word ON word_metadata(word);
CREATE INDEX IF NOT EXISTS idx_cloned_voices_user_id ON cloned_voices(user_id);
CREATE INDEX IF NOT EXISTS idx_cloned_voices_elevenlabs_id ON cloned_voices(elevenlabs_voice_id);
CREATE INDEX IF NOT EXISTS idx_voice_conversions_user_id ON voice_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_conversions_source_recording ON voice_conversions(source_recording_id);

-- Create GIN indexes for JSONB columns for efficient querying
CREATE INDEX IF NOT EXISTS idx_audio_metadata_emotion_data ON audio_metadata USING GIN (overall_emotion_data);
CREATE INDEX IF NOT EXISTS idx_audio_metadata_location ON audio_metadata USING GIN (recording_location);
CREATE INDEX IF NOT EXISTS idx_word_metadata_location ON word_metadata USING GIN (word_location);
CREATE INDEX IF NOT EXISTS idx_cloned_voices_settings ON cloned_voices USING GIN (settings);
CREATE INDEX IF NOT EXISTS idx_voice_conversions_settings ON voice_conversions USING GIN (conversion_settings);

-- Create triggers to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_audio_recordings_updated_at 
    BEFORE UPDATE ON audio_recordings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cloned_voices_updated_at 
    BEFORE UPDATE ON cloned_voices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE OR REPLACE VIEW audio_recordings_with_metadata AS
SELECT 
    ar.*,
    am.overall_sentiment,
    am.overall_emotion_data,
    am.recording_location,
    am.recording_timestamp,
    COUNT(wm.id) as word_count,
    AVG(wm.confidence) as avg_confidence
FROM audio_recordings ar
LEFT JOIN audio_metadata am ON ar.id = am.recording_id
LEFT JOIN word_metadata wm ON ar.id = wm.recording_id
GROUP BY ar.id, am.id;

CREATE OR REPLACE VIEW user_voice_library AS
SELECT 
    cv.*,
    u.username,
    COUNT(vc.id) as conversion_count
FROM cloned_voices cv
JOIN users u ON cv.user_id = u.id
LEFT JOIN voice_conversions vc ON cv.id = vc.target_voice_id
GROUP BY cv.id, u.username;

-- Add comments for documentation
COMMENT ON TABLE audio_recordings IS 'Stores basic information about uploaded/recorded audio files';
COMMENT ON TABLE audio_metadata IS 'Stores AI-generated metadata for audio recordings including sentiment and location';
COMMENT ON TABLE word_metadata IS 'Stores word-level analysis including timing, emotions, and confidence scores';
COMMENT ON TABLE cloned_voices IS 'Manages user-created voice clones from ElevenLabs';
COMMENT ON TABLE voice_conversions IS 'Tracks speech-to-speech conversions and their settings';

COMMENT ON COLUMN word_metadata.confidence IS 'Speech recognition confidence score (0.0 to 1.0)';
COMMENT ON COLUMN word_metadata.sentiment_score IS 'Word-level sentiment score (-5.0 to +5.0)';
COMMENT ON COLUMN audio_metadata.overall_sentiment IS 'Overall recording sentiment score (-5.0 to +5.0)';
COMMENT ON COLUMN audio_metadata.recording_location IS 'JSON object containing GPS coordinates, city, country, etc.';
COMMENT ON COLUMN cloned_voices.settings IS 'JSON object containing ElevenLabs voice settings like stability and similarity_boost';