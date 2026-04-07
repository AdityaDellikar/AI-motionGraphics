import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Frame} from '../components/Frame';

export const ResultImpactScene: React.FC<{result: string; impact: string}> = ({result, impact}) => {
  const frame = useCurrentFrame();

  const resultOpacity = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});
  const impactOpacity = interpolate(frame, [18, 30], [0, 1], {extrapolateRight: 'clamp'});
  const impactSlide = interpolate(frame, [18, 34], [40, 0], {extrapolateRight: 'clamp'});

  return (
    <Frame>
      <div style={{width: '100%', maxWidth: 920}}>
        <div style={{fontSize: 24, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 24}}>
          Results & Impact
        </div>
        <div style={{opacity: resultOpacity, fontSize: 42, lineHeight: 1.2, marginBottom: 20}}>
          {result}
        </div>
        <div
          style={{
            opacity: impactOpacity,
            transform: `translateX(${impactSlide}px)`,
            fontSize: 38,
            lineHeight: 1.2,
            borderTop: '1px solid #ffffff',
            paddingTop: 18,
          }}
        >
          {impact}
        </div>
      </div>
    </Frame>
  );
};
