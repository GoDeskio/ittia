import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #64ffda;
  overflow: hidden;
  background: #0a192f;
`;

const BackgroundImage = styled.div<{ progress: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: ${props => props.progress}%;
  background-image: url('/assets/cyborg-background.svg');
  background-size: cover;
  background-position: center;
  transition: height 0.5s ease;
  z-index: -1;
  opacity: 0.8;
`;

const CountdownContainer = styled.div`
  font-size: 4rem;
  font-weight: bold;
  text-shadow: 0 0 20px rgba(100, 255, 218, 0.5);
  background: rgba(10, 25, 47, 0.7);
  padding: 2rem 4rem;
  border-radius: 15px;
  border: 2px solid #64ffda;
  box-shadow: 0 0 30px rgba(100, 255, 218, 0.2);
  backdrop-filter: blur(5px);
`;

const ProgressText = styled.div`
  font-size: 1.5rem;
  margin-top: 2rem;
  color: #64ffda;
  text-shadow: 0 0 10px rgba(100, 255, 218, 0.5);
`;

const CyborgLoadingPage: React.FC = () => {
  const [daysRemaining, setDaysRemaining] = useState(365);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Calculate initial days remaining
    const calculateDaysRemaining = () => {
      const now = new Date();
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      const diff = endOfYear.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setDaysRemaining(days);
      setProgress(((365 - days) / 365) * 100);
    };

    calculateDaysRemaining();
    
    // Update countdown every day
    const interval = setInterval(calculateDaysRemaining, 86400000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <PageContainer>
      <BackgroundImage progress={progress} />
      <CountdownContainer>
        {daysRemaining} Days Remaining
      </CountdownContainer>
      <ProgressText>
        System Loading: {progress.toFixed(2)}%
      </ProgressText>
    </PageContainer>
  );
};

export default CyborgLoadingPage; 