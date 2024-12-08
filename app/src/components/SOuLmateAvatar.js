import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const float = keyframes`
  0% {
    transform: translate(-50%, -50%);
  }
  50% {
    transform: translate(-50%, -55%);
  }
  100% {
    transform: translate(-50%, -50%);
  }
`;

const blink = keyframes`
  0% {
    height: 12px;
    transform: scaleY(1);
  }
  4% {
    height: 12px;
    transform: scaleY(0.1);
  }
  8% {
    height: 12px;
    transform: scaleY(1);
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.05) rotate(-2deg);
  }
  75% {
    transform: scale(1.05) rotate(2deg);
  }
`;

const sparkle = keyframes`
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 0.8;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #4CAF50;
  background: linear-gradient(135deg, #e0f2f1 0%, #ffffff 100%);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.2);

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.3);
    
    .character {
      animation: ${bounce} 1s ease infinite;
    }
    .blush {
      opacity: 0.6;
    }
    .sparkles {
      opacity: 1;
    }
  }

  &:active {
    transform: scale(0.98);
  }
`;

const Sparkles = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;

  .sparkle {
    position: absolute;
    width: 10px;
    height: 10px;
    background: #4CAF50;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    animation: ${sparkle} 1.5s ease-in-out infinite;

    &:nth-child(1) { top: 20%; left: 20%; animation-delay: 0s; }
    &:nth-child(2) { top: 15%; right: 20%; animation-delay: 0.3s; }
    &:nth-child(3) { bottom: 20%; left: 15%; animation-delay: 0.6s; }
    &:nth-child(4) { bottom: 15%; right: 15%; animation-delay: 0.9s; }
  }
`;

const AvatarCharacter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  animation: ${float} 3s ease-in-out infinite;
  
  .character {
    width: 100%;
    height: 100%;
    position: relative;
    transition: all 0.3s ease;
  }
  
  .body {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #87CEEB 0%, #ADD8E6 100%);
    border-radius: 50%;
    position: relative;
    overflow: hidden;
    box-shadow: 
      inset -8px -8px 12px rgba(0, 0, 0, 0.1),
      inset 8px 8px 12px rgba(255, 255, 255, 0.2);
  }

  .shine {
    position: absolute;
    top: 15%;
    left: 15%;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.4));
    border-radius: 50%;
    transform: rotate(-45deg);
  }
  
  .eyes {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 20px;
    
    .eye {
      width: 12px;
      height: 12px;
      background: #000;
      border-radius: 50%;
      position: relative;
      animation: ${blink} 4s ease-in-out infinite;
      
      &:before {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 4px;
        height: 4px;
        background: #fff;
        border-radius: 50%;
        filter: blur(0.5px);
      }

      &:after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: -2px;
        width: 16px;
        height: 8px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        filter: blur(2px);
      }
    }
  }

  .blush {
    position: absolute;
    width: 18px;
    height: 8px;
    background: linear-gradient(180deg, rgba(255, 182, 193, 0.6), rgba(255, 182, 193, 0.3));
    border-radius: 50%;
    top: 52%;
    opacity: 0;
    transition: all 0.3s ease;
    filter: blur(1px);

    &.left {
      left: 18%;
      transform: rotate(-10deg);
    }

    &.right {
      right: 18%;
      transform: rotate(10deg);
    }
  }

  .mouth {
    position: absolute;
    bottom: 30%;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 10px;
    border-bottom: 3px solid rgba(0, 0, 0, 0.8);
    border-radius: 50%;
    transition: all 0.3s ease;

    &:after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      height: 4px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      filter: blur(2px);
    }
  }
`;

const SOuLmateAvatar = () => {
  const [isHappy, setIsHappy] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    // Happiness cycle
    const happyInterval = setInterval(() => {
      setIsHappy(prev => !prev);
    }, 5000);

    // Random blinking
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, Math.random() * 2000 + 2000);

    return () => {
      clearInterval(happyInterval);
      clearInterval(blinkInterval);
    };
  }, []);

  return (
    <AvatarContainer>
      <Sparkles className="sparkles">
        <div className="sparkle"></div>
        <div className="sparkle"></div>
        <div className="sparkle"></div>
        <div className="sparkle"></div>
      </Sparkles>
      <AvatarCharacter>
        <div className="character">
          <div className="body">
            <div className="shine"></div>
            <div className="eyes">
              <div className="eye" style={{ 
                transform: isBlinking ? 'scaleY(0.1)' : 'scaleY(1)',
                transition: 'transform 0.1s ease'
              }}></div>
              <div className="eye" style={{ 
                transform: isBlinking ? 'scaleY(0.1)' : 'scaleY(1)',
                transition: 'transform 0.1s ease'
              }}></div>
            </div>
            <div className="blush left"></div>
            <div className="blush right"></div>
            <div className="mouth" style={{ 
              borderRadius: isHappy ? '0 0 50% 50%' : '50%',
              width: isHappy ? '25px' : '20px',
              height: isHappy ? '12px' : '10px',
              borderBottom: isHappy ? '3px solid rgba(0, 0, 0, 0.8)' : '3px solid rgba(0, 0, 0, 0.8)'
            }}></div>
          </div>
        </div>
      </AvatarCharacter>
    </AvatarContainer>
  );
};

export default SOuLmateAvatar;
