import type { CntStore, CntVolume } from './cntStore';
import { FbcntTag } from './fbcntTag';
import { volumeTagTooltip } from './fbcntPageComponents';
import { TagTooltipLine } from './fbcntTagTooltipLine';

export function VolumeTagIcon({ store, volume }: { store: CntStore; volume: CntVolume }) {
  const tooltip = volumeTagTooltip(store, volume);
  if (!tooltip) return <span aria-hidden="true" />;
  return <TagTooltipLine text={<FbcntTag />} tooltip={tooltip} />;
}
