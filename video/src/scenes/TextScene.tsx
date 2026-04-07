import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Frame} from '../components/Frame';

export const TextScene: React.FC<{label: string; text: string}> = ({label, text}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const translateX = interpolate(frame, [0, 20], [-50, 0], {extrapolateRight: 'clamp'});
  const labelOpacity = interpolate(frame, [6, 22], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <Frame>
      <div style={{width: '100%', maxWidth: 900}}>
        <div
          style={{
            marginBottom: 24,
            fontSize: 24,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            opacity: labelOpacity,
          }}
        >
          {label}
        </div>
        <div
          style={{
            opacity,
            transform: `translateX(${translateX}px)`,
            fontSize: 52,
            lineHeight: 1.2,
            fontWeight: 500,
          }}
        >
          {text}
        </div>
      </div>
    </Frame>
  );
};
