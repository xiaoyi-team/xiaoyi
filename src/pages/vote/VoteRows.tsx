import type { ReactNode } from 'react';
import type { Vote } from './voteApi';

export type VoteFrameContent = Pick<Vote, 'title' | 'description'> & {
  rows: ReactNode;
  cutoff: string;
  totalVotes: number;
  resultMessage: string;
  ended: boolean;
};
export type VoteListContent = { cards: ReactNode; activeTab?: number };
export type VoteCardContent = Pick<VoteFrameContent, 'title' | 'description' | 'cutoff' | 'totalVotes' | 'ended'> & {
  participated: boolean;
  guest: boolean;
  onOpen: () => void;
};

interface VoteRowsProps {
  vote: Vote;
  selected: readonly number[];
  showResult: boolean;
  pending: boolean;
  onSelect: (id: number) => void;
}

export default function VoteRows({ vote, selected, showResult, pending, onSelect }: VoteRowsProps) {
  return vote.options.map(({ id, content, vote_count }) => {
    const checked = selected.includes(id);
    if (showResult) {
      const percent = vote.total_votes ? Math.min(100, vote_count / vote.total_votes * 100) : 0;
      return <div className="school-vote-row school-vote-result" data-selected={checked} key={id}>
        <div className="school-vote-result-title">{content}{checked && <span aria-label="已投">✓</span>}</div>
        <div className="school-vote-result-stats">
          <span className="school-vote-result-track" aria-hidden="true"><span style={{ width: `${percent}%` }} /></span>
          <span>{vote_count} 人</span>
        </div>
      </div>;
    }
    return <button type="button" className="school-vote-row school-vote-choice" aria-pressed={checked}
      key={id} disabled={pending} onClick={() => onSelect(id)}>
      <span className="school-vote-choice-mark" aria-hidden="true">{checked && vote.selection_mode === 'multiple' ? '✓' : ''}</span>
      <span>{content}</span>
    </button>;
  });
}
