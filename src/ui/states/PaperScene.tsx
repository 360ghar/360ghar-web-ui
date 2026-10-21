import { PaperArt } from '@/ui/paper/PaperArt';
import { SCENE_H, SCENE_W, sceneLayers, type SceneName } from './scenes';

export function PaperScene({ name, className }: { name: SceneName; className?: string }) {
  return <PaperArt layers={sceneLayers(name)} width={SCENE_W} height={SCENE_H} bg="var(--color-kesar-50)" cutEdge={`scene-${name}`} className={className} />;
}
