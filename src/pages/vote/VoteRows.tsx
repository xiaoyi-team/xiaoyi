import type { ReactNode } from 'react';
import type { VoteConfig } from './voteConfig';

export type VoteFrameContent = Pick<VoteConfig, 'title' | 'description'> & { rows: ReactNode };
export type VoteListContent = Pick<VoteConfig, 'title' | 'description'> & { participated: boolean };

interface VoteRowsProps {
  vote: VoteConfig;
  selected: readonly number[];
  showResult: boolean;
  onSelect: (index: number) => void;
}

export default function VoteRows({ vote, selected, showResult, onSelect }: VoteRowsProps) {
  const sampleCounts = vote.mode === 'multi' ? [155, 97, 74, 48] : [97, 65, 43, 31];

  return vote.options.map((option, index) => {
    const checked = selected.includes(index);
    if (showResult) {
      const count = (sampleCounts[index] ?? 0) + Number(checked);
      const percent = count / 237 * 100;
      return <div className="school-vote-row school-vote-result" data-selected={checked} key={index}>
        <div className="school-vote-result-title">{option}{checked && <span aria-label="已投">✓</span>}</div>
        <div className="school-vote-result-stats">
          <span className="school-vote-result-track" aria-hidden="true"><span style={{ width: `${percent}%` }} /></span>
          <span>{count}票 · {percent.toFixed(1)}%</span>
        </div>
      </div>;
    }
    return <button type="button" className="school-vote-row school-vote-choice" aria-pressed={checked}
      key={index} onClick={() => onSelect(index)}>
      <span className="school-vote-choice-mark" aria-hidden="true">{checked && vote.mode === 'multi' ? '✓' : ''}</span>
      <span>{option}</span>
    </button>;
  });
}
