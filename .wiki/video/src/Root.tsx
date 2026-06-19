import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { loadFont as loadCinzel } from '@remotion/google-fonts/Cinzel';
import { loadFont as loadJosefinSans } from '@remotion/google-fonts/JosefinSans';
import { OverviewVideo } from './OverviewVideo';
import { VIDEO, SCENE_DURATIONS } from './theme';

// Load Google Fonts so they are available during rendering.
loadCinzel();
loadJosefinSans();

// Verify scene durations sum to total (sanity check at import time).
const TOTAL =
  SCENE_DURATIONS.title +
  SCENE_DURATIONS.techStack +
  SCENE_DURATIONS.features +
  SCENE_DURATIONS.architecture +
  SCENE_DURATIONS.tools +
  SCENE_DURATIONS.outro;

if (TOTAL !== VIDEO.totalDurationInFrames) {
  // eslint-disable-next-line no-console
  console.warn(
    `Scene durations (${TOTAL}) do not match total duration (${VIDEO.totalDurationInFrames}).`
  );
}

/**
 * Root Remotion composition registration.
 * - 1920x1080, 30fps, 75 seconds (2250 frames total).
 * - Silent video (no audio tracks).
 * - Sequenced via <Series> in OverviewVideo.
 */
const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="OverviewVideo"
        component={OverviewVideo}
        durationInFrames={VIDEO.totalDurationInFrames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
    </>
  );
};

registerRoot(RemotionRoot);
