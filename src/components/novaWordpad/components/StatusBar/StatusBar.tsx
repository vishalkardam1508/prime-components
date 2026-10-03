import { Dropdown } from '../Dropdown/Dropdown';
import { ZOOM_LEVELS } from '../../features/editor/constants/editorConstants';
import './StatusBar.css';

export interface StatusBarProps {
  words: number;
  characters: number;
  selectionLength: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

/**
 * Bottom status bar: word/character counts, active selection size, and
 * a zoom control. Numeric readouts use the mono face so digits align
 * as they change, echoing a physical page-ruler readout.
 */
export function StatusBar({ words, characters, selectionLength, zoom, onZoomChange }: StatusBarProps) {
  const zoomOptions = ZOOM_LEVELS.map((z) => ({ value: z, label: `${z}%` }));

  return (
    <div className="nova-wordpad-status-bar" role="status">
      <div className="nova-wordpad-status-bar__group">
        <span className="nova-wordpad-status-bar__item">
          Words: <strong>{words}</strong>
        </span>
        <span className="nova-wordpad-status-bar__tick" aria-hidden="true" />
        <span className="nova-wordpad-status-bar__item">
          Characters: <strong>{characters}</strong>
        </span>
        {selectionLength > 0 && (
          <>
            <span className="nova-wordpad-status-bar__tick" aria-hidden="true" />
            <span className="nova-wordpad-status-bar__item">
              Selection: <strong>{selectionLength}</strong> characters
            </span>
          </>
        )}
      </div>
      <div className="nova-wordpad-status-bar__group">
        <Dropdown label="Zoom" value={zoom} options={zoomOptions} onChange={onZoomChange} width={90} />
      </div>
    </div>
  );
}
