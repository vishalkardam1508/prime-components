import { Dropdown } from '../../../components/Dropdown/Dropdown';
import type { DropdownOption } from '../../../components/Dropdown/Dropdown';
import { FONT_FAMILIES } from '../../editor/constants/editorConstants';

const OPTIONS: DropdownOption<string>[] = FONT_FAMILIES.map((font) => ({ value: font, label: font }));

export interface FontFamilySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function FontFamilySelect({ value, onChange }: FontFamilySelectProps) {
  return (
    <Dropdown
      label="Font Family"
      value={value}
      options={OPTIONS}
      onChange={onChange}
      width={104}
      renderOption={(opt) => <span style={{ fontFamily: opt.value }}>{opt.label}</span>}
    />
  );
}
