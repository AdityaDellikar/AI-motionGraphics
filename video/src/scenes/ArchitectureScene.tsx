import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Frame} from '../components/Frame';

export const ArchitectureScene: React.FC<{steps: string[]}> = ({steps}) => {
  const frame = useCurrentFrame();
  const safeSteps = (steps.length > 0 ? steps : ['Architecture details unavailable.']).slice(0, 4);
  const nodes = safeSteps.map((step, index) => {
    const y = 160 + index * 170;
    const x = index % 2 === 0 ? 180 : 500;
    return {step, x, y};
  });

  return (
    <Frame>
      <div style={{width: '100%', maxWidth: 900, height: 820, position: 'relative'}}>
        <div
          style={{
            marginBottom: 18,
            fontSize: 24,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            opacity: interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'}),
          }}
        >
          Architecture Mind Map
        </div>

        <svg width={900} height={760} style={{position: 'absolute', top: 56, left: 0}}>
          {nodes.slice(0, -1).map((node, index) => {
            const next = nodes[index + 1];
            const startX = node.x + 190;
            const startY = node.y + 55;
            const endX = next.x;
            const endY = next.y + 55;
            const delay = 22 + index * 24;
            const progress = interpolate(frame, [delay, delay + 16], [0, 1], {
              extrapolateRight: 'clamp',
            });
            const arrowOpacity = interpolate(frame, [delay + 12, delay + 22], [0, 1], {
              extrapolateRight: 'clamp',
            });
            const currentX = startX + (endX - startX) * progress;
            const currentY = startY + (endY - startY) * progress;

            return (
              <g key={`connector-${index}`} opacity={progress}>
                <line x1={startX} y1={startY} x2={currentX} y2={currentY} stroke="#ffffff" strokeWidth={2} />
                <polygon
                  points={`${currentX},${currentY} ${currentX - 10},${currentY - 5} ${currentX - 10},${currentY + 5}`}
                  fill="#ffffff"
                  opacity={arrowOpacity}
                />
              </g>
            );
          })}
        </svg>

        {nodes.map((node, index) => {
          const delay = index * 24;
          const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {extrapolateRight: 'clamp'});
          const translateY = interpolate(frame, [delay, delay + 16], [22, 0], {
            extrapolateRight: 'clamp',
          });
          const scale = interpolate(frame, [delay, delay + 18], [0.94, 1], {
            extrapolateRight: 'clamp',
          });

          return (
            <div
              key={`node-${index}`}
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                width: 190,
                minHeight: 90,
                border: '1px solid #ffffff',
                padding: '12px 14px',
                boxSizing: 'border-box',
                opacity,
                transform: `translateY(${translateY}px) scale(${scale})`,
                fontSize: 21,
                lineHeight: 1.25,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {node.step}
            </div>
          );
        })}
      </div>
    </Frame>
  );
};
