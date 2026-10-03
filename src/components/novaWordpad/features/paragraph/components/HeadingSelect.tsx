import { Dropdown } from '../../../components/Dropdown/Dropdown';
import { HEADING_OPTIONS } from '../../editor/constants/editorConstants';

export interface HeadingSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function HeadingSelect({ value, onChange }: HeadingSelectProps) {
  return <Dropdown label="Paragraph Style" value={value} options={HEADING_OPTIONS} onChange={onChange} width={104} />;
}
