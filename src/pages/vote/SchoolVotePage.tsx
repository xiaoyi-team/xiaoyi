import { useEffect, useState, type MouseEvent } from 'react';
import VoteRows from './VoteRows';
import { demoVote } from './voteConfig';
import V8296_5677 from './design/V8296_5677';
import V8312_8 from './design/V8312_8';
import V8312_59 from './design/V8312_59';
import V8547_49 from './design/V8547_49';
import V8550_50 from './design/V8550_50';
import V8550_116 from './design/V8550_116';
import V8613_978 from './design/V8613_978';
import V8574_56 from './design/V8574_56';
import V8574_106 from './design/V8574_106';
import V8574_136 from './design/V8574_136';
import V8574_175 from './design/V8574_175';
import V8574_210 from './design/V8574_210';
import V8575_1662 from './design/V8575_1662';
import V8575_1723 from './design/V8575_1723';
import V8575_1784 from './design/V8575_1784';
import V8613_501 from './design/V8613_501';
import V8613_647 from './design/V8613_647';
import V8613_793 from './design/V8613_793';
import './vote.css';

const lists = [
  [V8312_8, V8574_56], [V8613_501, V8575_1662],
  [V8613_647, V8575_1723], [V8613_793, V8575_1784],
] as const;
const tabs = ['全部投票', '进行中', '已参与', '已结束'];

function viewSize() {
  return { width: window.innerWidth, height: window.innerHeight };
}

export default function SchoolVotePage() {
  const { mode, title, description } = demoVote;
  const [view, setView] = useState<'entrance' | 'list' | 'detail' | 'result'>('entrance');
  const [tab, setTab] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [ballot, setBallot] = useState<number[] | null>(null);
  const [size, setSize] = useState(viewSize);
  const mobile = size.width < 1024;
  const wideEntrance = view === 'entrance' && !mobile;
  const width = mobile ? 667 : 1920;
  const height = mobile ? 375 : 1080;
  const scale = Math.min(size.width / width, size.height / height);
  const variant = mobile ? 1 : 0;
  const Frame = view === 'entrance' ? (wideEntrance ? V8296_5677 : V8613_978)
    : view === 'list' ? lists[tab][variant]
    : view === 'detail' ? (mode === 'multi' ? [V8550_50, V8574_175] : [V8312_59, V8574_106])[variant]
    : (mode === 'multi' ? [V8550_116, V8574_210] : [V8547_49, V8574_136])[variant];

  useEffect(() => {
    const resize = () => setSize(viewSize());
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  function close() {
    setView(view === 'list' ? 'entrance' : 'list');
  }

  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && view !== 'entrance') setView(view === 'list' ? 'entrance' : 'list');
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [view]);

  function interact(event: MouseEvent) {
    if (!(event.target instanceof Element)) return;
    const target = event.target.closest('[data-name^="关闭"], [data-name^="分类标签 /"], [data-name^="筛选 /"], [data-name="返回列表"], button');
    const label = target?.getAttribute('data-name') ?? '';
    if (view === 'entrance') {
      if (target) { setTab(0); setView('list'); }
      return;
    }
    if (label.startsWith('关闭') || target?.textContent?.trim() === '×') {
      close();
      return;
    }
    if (view === 'list') {
      const filter = tabs.indexOf(label.split(' / ')[1]);
      if (filter >= 0) { setTab(filter); return; }
      if (target?.hasAttribute('data-vote-entry')) {
        if (ballot) setView('result');
        else { setPicked([]); setView('detail'); }
      }
      return;
    }
    if (view === 'result') {
      if (label === '返回列表' || target?.textContent?.trim() === '返回列表') setView('list');
      return;
    }
    if (label === '提交投票') {
      if (picked.length) { setBallot(picked); setView('result'); }
      return;
    }
  }

  function selectOption(index: number) {
    setPicked(current => mode === 'single' ? [index]
      : current.includes(index) ? current.filter(i => i !== index) : [...current, index]);
  }

  return <main className="school-vote" aria-label="海事高中 · 心意征集簿">
    <div className="school-vote-window" style={{ width: width * scale, height: height * scale }}>
      <div className="school-vote-canvas" data-view={view} data-mode={mode} data-mobile={mobile} data-has-selection={picked.length > 0}
        style={{ width, height, transform: `scale(${scale})` }} onClick={interact}>
        <Frame title={title} description={description} participated={ballot !== null} rows={
          <VoteRows vote={demoVote} selected={view === 'result' ? ballot ?? [] : picked}
            showResult={view === 'result'} onSelect={selectOption} />
        } />
      </div>
    </div>
  </main>;
}
