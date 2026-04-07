import React from 'react';
import {Composition} from 'remotion';
import {getDurationInFrames, ResearchVideo} from './ResearchVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ResearchVideo"
      component={ResearchVideo}
      durationInFrames={getDurationInFrames()}
      fps={30}
      width={1080}
      height={1080}
    />
  );
};
