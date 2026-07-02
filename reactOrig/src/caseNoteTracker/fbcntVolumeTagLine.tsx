import type { CntStore, CntVolume } from './cntStore';
import { volumeTagTooltip } from './fbcntPageComponents';
import { TagTooltipLine } from './fbcntTagTooltipLine';

export function VolumeTagLine({ store, volume }: { store: CntStore; volume: CntVolume }) {
  const tooltip = volumeTagTooltip(store, volume);
  if (!tooltip) return null;
  const abbreviated = store.tags
    .filter((tag) => tag.volumeUuid === volume.uuid && tag.status === 'active')
    .map((tag) => tag.purpose.slice(0, 18))
    .join('; ');
  return <TagTooltipLine text={`Tags: ${abbreviated}`} tooltip={tooltip} />;
}
