import React from 'react';
import {Sequence} from 'remotion';
import videoData from './data.json';
import {ArchitectureScene} from './scenes/ArchitectureScene';
import {ResultImpactScene} from './scenes/ResultImpactScene';
import {TextScene} from './scenes/TextScene';
import {TitleScene} from './scenes/TitleScene';
import type {SceneData, VideoData} from './types';

const data = videoData as VideoData;

const sceneComponent = (scene: SceneData) => {
  switch (scene.type) {
    case 'title':
      return <TitleScene text={scene.text} />;
    case 'problem':
      return <TextScene label="Problem" text={scene.text} />;
    case 'method':
      return <TextScene label="Method" text={scene.text} />;
    case 'architecture':
      return <ArchitectureScene steps={scene.steps ?? []} />;
    case 'result_impact':
      return (
        <ResultImpactScene
          result={scene.result ?? scene.text}
          impact={scene.impact ?? ''}
        />
      );
    default:
      return <TextScene label="Insight" text={scene.text} />;
  }
};

export const getDurationInFrames = (): number => {
  // Total composition duration is derived from backend-generated scene JSON.
  return data.scenes.reduce((sum, scene) => sum + scene.duration, 0);
};

export const ResearchVideo: React.FC = () => {
  let from = 0;

  return (
    <>
      {data.scenes.map((scene, index) => {
        const start = from;
        from += scene.duration;

        return (
          <Sequence key={`${scene.type}-${index}`} from={start} durationInFrames={scene.duration}>
            {sceneComponent(scene)}
          </Sequence>
        );
      })}
    </>
  );
};
