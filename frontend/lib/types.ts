export type StructuredScript = {
  title: string;
  problem: string;
  method: string;
  architecture_steps: string[];
  result: string;
  impact: string;
};

export type Scene = {
  type: string;
  text: string;
  duration: number;
  steps?: string[];
  result?: string;
  impact?: string;
};

export type VideoScript = {
  scenes: Scene[];
};

export type UploadResponse = {
  structured_script: StructuredScript;
  video_script: VideoScript;
  source: string;
  message: string;
};
