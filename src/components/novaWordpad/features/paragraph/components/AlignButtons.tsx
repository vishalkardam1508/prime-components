import { IconButton } from '../../../components/IconButton/IconButton';
import type { AlignValue } from '../commands/align';

interface AlignmentOption {
  value: AlignValue;
  label: string;
  d: string;
}

const ALIGNMENTS: AlignmentOption[] = [
  { value: 'left', label: 'Align Left', d: 'M2 3h12M2 6.5h8M2 10h12M2 13.5h8' },
  { value: 'center', label: 'Center', d: 'M2 3h12M4 6.5h8M2 10h12M4 13.5h8' },
  { value: 'right', label: 'Align Right', d: 'M2 3h12M6 6.5h8M2 10h12M6 13.5h8' },
  { value: 'justify', label: 'Justify', d: 'M2 3h12M2 6.5h12M2 10h12M2 13.5h12' }
];

export interface AlignButtonsProps {
  value: AlignValue;
  onChange: (value: AlignValue) => void;
}

export function AlignButtons({ value, onChange }: AlignButtonsProps) {
  return (
    <>
      {ALIGNMENTS.map((a) => (
        <IconButton key={a.value} label={a.label} active={value === a.value} onClick={() => onChange(a.value)}>
          <svg viewBox="0 0 16 16" fill="none">
            <path d={a.d} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </IconButton>
      ))}
    </>
  );
}
