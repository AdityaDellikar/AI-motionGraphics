export type SceneData = {
  type: string;
  text: string;
  duration: number;
  steps?: string[];
  result?: string;
  impact?: string;
};

export type VideoData = {
  scenes: SceneData[];
};
