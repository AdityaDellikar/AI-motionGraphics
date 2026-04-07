import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Frame} from '../components/Frame';

export const TitleScene: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: {
      damping: 200,
      stiffness: 120,
      mass: 0.7,
    },
  });

  const opacity = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});
  const translateY = interpolate(frame, [0, 18], [30, 0], {extrapolateRight: 'clamp'});

  return (
    <Frame>
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px) scale(${0.96 + 0.04 * scale})`,
          textAlign: 'center',
          maxWidth: 860,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          fontSize: 76,
          fontWeight: 600,
        }}
      >
        {text}
      </div>
    </Frame>
  );
};
