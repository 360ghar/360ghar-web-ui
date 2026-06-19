import React from 'react';
import { Series } from 'remotion';
import { SCENE_DURATIONS } from './theme';
import { TitleScene } from './scenes/TitleScene';
import { TechStackScene } from './scenes/TechStackScene';
import { FeaturesScene } from './scenes/FeaturesScene';
import { ArchitectureScene } from './scenes/ArchitectureScene';
import { ToolsScene } from './scenes/ToolsScene';
import { OutroScene } from './scenes/OutroScene';

/**
 * Main composition that sequences all 6 scenes using <Series>.
 * Total duration: 2250 frames (75 seconds at 30fps).
 */
export const OverviewVideo: React.FC = () => {
  return (
    <Series>
      <Series.Sequence
        durationInFrames={SCENE_DURATIONS.title}
        name="Title"
      >
        <TitleScene />
      </Series.Sequence>

      <Series.Sequence
        durationInFrames={SCENE_DURATIONS.techStack}
        name="TechStack"
      >
        <TechStackScene />
      </Series.Sequence>

      <Series.Sequence
        durationInFrames={SCENE_DURATIONS.features}
        name="Features"
      >
        <FeaturesScene />
      </Series.Sequence>

      <Series.Sequence
        durationInFrames={SCENE_DURATIONS.architecture}
        name="Architecture"
      >
        <ArchitectureScene />
      </Series.Sequence>

      <Series.Sequence
        durationInFrames={SCENE_DURATIONS.tools}
        name="Tools"
      >
        <ToolsScene />
      </Series.Sequence>

      <Series.Sequence
        durationInFrames={SCENE_DURATIONS.outro}
        name="Outro"
      >
        <OutroScene />
      </Series.Sequence>
    </Series>
  );
};

export default OverviewVideo;
