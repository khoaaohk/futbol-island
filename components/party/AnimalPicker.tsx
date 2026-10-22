'use client';
import { useState } from 'react';
import { NAME_ANIMALS, PICKER_ANIMALS } from '../../multiplayer/protocol';
import { animalGlyph } from '@/lib/multiplayer/names';
import styles from './animalPicker.module.css';

/** The kid's animal for this page visit: memory only (never stored), null = "Surprise me" (the game picks one). */
let chosen: number | null = null;
export const getAnimalChoice = (): number | null => chosen;
export const setAnimalChoice = (n: number | null): void => { chosen = n; };

/**
 * Pick an animal icon from a fixed list (no typing). The colour is chosen by the game so friends are always told apart.
 * Big round buttons (56px): glyph + a tiny name; "Surprise me" lets the game choose.
 */
export default function AnimalPicker({ onChange }: { onChange?: (animal: number | null) => void }) {
  const [value, setValue] = useState<number | null>(chosen);
  const pick = (n: number | null) => { chosen = n; setValue(n); onChange?.(n); };
  return (
    <div className={styles.wrap} data-animal-picker>
      <div className={styles.head}>
      <p className={styles.title} id="animal-picker-title">Pick your animal</p>
  <button type="button" className={styles.surprise} data-animal-surprise aria-pressed={value === null} aria-label="Surprise me, the game picks an animal" onClick={() => pick(null)}>Surprise me</button>
      </div>
      <div className={styles.grid} role="group" aria-labelledby="animal-picker-title">
        {PICKER_ANIMALS.map((idx) => {
          const name = NAME_ANIMALS[idx];
          return (
            <button key={idx} type="button" className={styles.animal} data-animal-option={idx} aria-pressed={value === idx} aria-label={`Be a ${name}`} onClick={() => pick(idx)}>
              <span className={styles.glyph} aria-hidden="true">{animalGlyph(idx)}</span>
              <span className={styles.label} aria-hidden="true">{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
