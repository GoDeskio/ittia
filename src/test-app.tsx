import React, { useState } from 'react';
import { Button } from './components/Button';
import { Card } from './components/Card';

const TestApp: React.FC = () => {
  const [buttonClicks, setButtonClicks] = useState(0);
  const [cardClicks, setCardClicks] = useState(0);

  const handleButtonClick = () => {
    setButtonClicks(prev => prev + 1);
  };

  const handleCardClick = () => {
    setCardClicks(prev => prev + 1);
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f2f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '40px' }}>
        🎯 Bit Components Test Environment
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gap: '30px', 
        maxWidth: '800px', 
        margin: '0 auto' 
      }}>
        
        {/* Button Tests */}
        <Card title="🔘 Button Component Tests">
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <Button 
              variant="primary" 
              size="small" 
              onClick={handleButtonClick}
            >
              Small Primary
            </Button>
            
            <Button 
              variant="secondary" 
              size="medium" 
              onClick={handleButtonClick}
            >
              Medium Secondary
            </Button>
            
            <Button 
              variant="danger" 
              size="large" 
              onClick={handleButtonClick}
            >
              Large Danger
            </Button>
            
            <Button 
              variant="primary" 
              disabled
            >
              Disabled
            </Button>
          </div>
          
          <p style={{ color: '#666', fontSize: '14px' }}>
            Button clicks: <strong>{buttonClicks}</strong>
          </p>
        </Card>

        {/* Card Tests */}
        <Card title="🃏 Card Component Tests">
          <div style={{ display: 'grid', gap: '15px' }}>
            
            <Card 
              title="Clickable Card"
              onClick={handleCardClick}
              style={{ cursor: 'pointer' }}
            >
              <p>This card is clickable! Click count: <strong>{cardClicks}</strong></p>
              <p style={{ fontSize: '12px', color: '#666' }}>
                Hover over me to see the neumorphic effect.
              </p>
            </Card>

            <Card 
              title="Pressed State Card"
              isPressed={true}
              noHover={true}
            >
              <p>This card shows the pressed state styling.</p>
              <p style={{ fontSize: '12px', color: '#666' }}>
                Notice the inset shadow effect.
              </p>
            </Card>

            <Card>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Card without title</h3>
              <p>This card doesn't have a title prop, but has custom content.</p>
              <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                <li>✅ Self-contained components</li>
                <li>✅ Neumorphic design</li>
                <li>✅ TypeScript support</li>
                <li>✅ Bit integration</li>
              </ul>
            </Card>

          </div>
        </Card>

        {/* Component Info */}
        <Card title="📊 Component Information">
          <div style={{ display: 'grid', gap: '10px' }}>
            <div>
              <strong>Button Component:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '14px' }}>
                <li>Variants: primary, secondary, danger</li>
                <li>Sizes: small, medium, large</li>
                <li>States: normal, disabled, hover, active</li>
                <li>Neumorphic shadow effects</li>
              </ul>
            </div>
            
            <div>
              <strong>Card Component:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '14px' }}>
                <li>Optional title prop</li>
                <li>Clickable with onClick handler</li>
                <li>Pressed state styling</li>
                <li>Hover effects (can be disabled)</li>
                <li>Neumorphic design with shadows</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Bit Commands */}
        <Card title="⚡ Available Commands">
          <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
            <p><strong>Bit Commands:</strong></p>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li><code>pnpm run bit:status</code> - Check component status</li>
              <li><code>pnpm run bit:list</code> - List all components</li>
              <li><code>pnpm run bit:start</code> - Start Bit dev server</li>
              <li><code>pnpm run bit:build</code> - Build components</li>
              <li><code>pnpm run bit:test</code> - Test components</li>
            </ul>
            
            <p><strong>Development Commands:</strong></p>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li><code>pnpm run dev</code> - Start both client and server</li>
              <li><code>pnpm run dev:client</code> - Start client only</li>
              <li><code>pnpm run dev:server</code> - Start server only</li>
              <li><code>pnpm run test</code> - Run all tests</li>
            </ul>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default TestApp;