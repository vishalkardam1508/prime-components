import { IconButton } from '../../../components/IconButton/IconButton';

export interface ListButtonsProps {
  bulletActive: boolean;
  numberedActive: boolean;
  onBullet: () => void;
  onNumbered: () => void;
  onIndent: () => void;
  onOutdent: () => void;
}

export function ListButtons({ bulletActive, numberedActive, onBullet, onNumbered, onIndent, onOutdent }: ListButtonsProps) {
  return (
    <>
      <IconButton label="Bulleted List" shortcut="Ctrl+Shift+8" active={bulletActive} onClick={onBullet}>
        <svg viewBox="0 0 16 16" fill="none">
          <circle cx="2.5" cy="4" r="1.2" fill="currentColor" />
          <circle cx="2.5" cy="8" r="1.2" fill="currentColor" />
          <circle cx="2.5" cy="12" r="1.2" fill="currentColor" />
          <path d="M6 4h8M6 8h8M6 12h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </IconButton>
      <IconButton label="Numbered List" shortcut="Ctrl+Shift+7" active={numberedActive} onClick={onNumbered}>
        <svg viewBox="0 0 16 16" fill="none">
          <text x="0.5" y="5.5" fontSize="4.5" fill="currentColor">
            1
          </text>
          <text x="0.5" y="9.5" fontSize="4.5" fill="currentColor">
            2
          </text>
          <text x="0.5" y="13.5" fontSize="4.5" fill="currentColor">
            3
          </text>
          <path d="M6 4h8M6 8h8M6 12h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </IconButton>
      <IconButton label="Outdent" onClick={onOutdent}>
        <svg viewBox="0 0 16 16" fill="none">
          <path d="M2 3h12M6 6.5h8M6 10h8M2 13.5h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path
            d="M4.5 5.5 2 8l2.5 2.5"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </IconButton>
      <IconButton label="Indent" onClick={onIndent}>
        <svg viewBox="0 0 16 16" fill="none">
          <path d="M2 3h12M6 6.5h8M6 10h8M2 13.5h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path
            d="M2 5.5 4.5 8 2 10.5"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </IconButton>
    </>
  );
}
