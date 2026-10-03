import { Dropdown } from '../../../components/Dropdown/Dropdown';
import type { DropdownOption } from '../../../components/Dropdown/Dropdown';
import { FONT_SIZES } from '../../editor/constants/editorConstants';

const OPTIONS: DropdownOption<number>[] = FONT_SIZES.map((size) => ({ value: size, label: String(size) }));

export interface FontSizeSelectProps {
  value: number;
  onChange: (value: number) => void;
}

export function FontSizeSelect({ value, onChange }: FontSizeSelectProps) {
  return <Dropdown label="Font Size" value={value} options={OPTIONS} onChange={onChange} width={62} />;
}
