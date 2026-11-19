import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiError, getAccessToken } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { buildLoginPath } from '../../auth/navigation';
import backArrow from './design/art/wishbook-back.svg';
import VoteRows from './VoteRows';
import { formatDeadline, getVotes, submitVote, type Vote } from './voteApi';
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
import V8575_1662, { MobileVoteCard } from './design/V8575_1662';
import V8575_1723 from './design/V8575_1723';
import V8575_1784 from './design/V8575_1784';
import V8613_501, { DesktopVoteCard } from './design/V8613_501';
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
  const location = useLocation();
  const navigate = useNavigate();
  const { isLogin, isLoading } = useAuth();
  const token = isLogin ? getAccessToken() ?? null : null;
  const [view, setView] = useState<'entrance' | 'list' | 'detail' | 'result'>(
    () => new URLSearchParams(location.search).has('voteList') ? 'list' : 'entrance',
  );
  const [tab, setTab] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [snapshot, setSnapshot] = useState<{ token: string | null; votes: Vote[] } | null>(null);
  const [revision, setRevision] = useState(0);
  const [load, setLoad] = useState<{ token: string | null; revision: number; error?: string } | null>(null);
  const [notice, setNotice] = useState('');
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const submission = useRef<AbortController | null>(null);
  const lastToken = useRef(token);
  const votes = snapshot?.token === token ? snapshot.votes : [];
  const active = votes.find(vote => vote.id === activeId);
  const mode = active?.selection_mode === 'multiple' ? 'multi' : 'single';
  const loading = isLoading || load?.token !== token || load?.revision !== revision;
  const loadError = loading ? undefined : load?.error;
  const screen = !active && (view === 'detail' || view === 'result') ? 'list' : view;
  const [size, setSize] = useState(viewSize);
  const mobile = size.width < 1024;
  const wideEntrance = view === 'entrance' && !mobile;
  const width = mobile ? 667 : 1920;
  const height = mobile ? 375 : 1080;
  const scale = Math.min(size.width / width, size.height / height);
  const variant = mobile ? 1 : 0;
  const Entrance = wideEntrance ? V8296_5677 : V8613_978;
  const List = lists[tab][variant];
  const Card = mobile ? MobileVoteCard : DesktopVoteCard;
  const Detail = view === 'detail' ? (mode === 'multi' ? [V8550_50, V8574_175] : [V8312_59, V8574_106])[variant]
    : (mode === 'multi' ? [V8550_116, V8574_210] : [V8547_49, V8574_136])[variant];

  useEffect(() => {
    if (isLoading) return;
    const controller = new AbortController();
    getVotes(Boolean(token), controller.signal).then(votes => {
      if (!controller.signal.aborted) {
        setSnapshot({ token, votes });
        setLoad({ token, revision });
      }
    }).catch((error: unknown) => {
      if (!controller.signal.aborted && !(token && error instanceof ApiError && error.status === 401)) {
        setLoad({ token, revision, error: error instanceof Error ? error.message : '无法加载投票。' });
      }
    });
    return () => controller.abort();
  }, [token, isLoading, revision]);

  useEffect(() => () => submission.current?.abort(), [token]);

  useEffect(() => {
    if (lastToken.current === token) return;
    lastToken.current = token;
    setPicked([]);
    setActiveId(null);
    setSubmittedId(null);
    setView(current => current === 'entrance' ? current : 'list');
  }, [token]);

  useEffect(() => {
    const resize = () => setSize(viewSize());
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  function close() {
    setNotice('');
    setView(screen === 'list' ? 'entrance' : 'list');
  }

  function goLogin() {
    const params = new URLSearchParams(location.search);
    params.set('voteList', '1');
    navigate(buildLoginPath({ ...location, search: `?${params}` }));
  }

  function openVote(vote: Vote) {
    if (submission.current) return;
    setNotice('');
    if (!token && vote.status === 'ongoing' && !vote.has_voted) {
      if (!isLoading) goLogin();
      return;
    }
    setActiveId(vote.id);
    setPicked([]);
    setView(vote.status === 'ended' || vote.has_voted ? 'result' : 'detail');
  }

  async function submit() {
    if (submission.current || !active || !picked.length || active.has_voted || active.status === 'ended') return;
    if (!token || getAccessToken() !== token) { goLogin(); return; }
    const controller = new AbortController();
    submission.current = controller;
    setPending(true);
    setNotice('');
    const updateVote = (fields: Partial<Vote>) => setSnapshot(current => current?.token === token
      ? { token, votes: current.votes.map(vote => vote.id === active.id ? { ...vote, ...fields } : vote) }
      : current);
    try {
      const selected = await submitVote(active.id, picked, controller.signal);
      if (controller.signal.aborted || getAccessToken() !== token) return;
      updateVote({ has_voted: true, selected_option_ids: selected });
      setSubmittedId(active.id);
      setView('result');
      setRevision(value => value + 1);
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error instanceof ApiError && error.status === 401) {
        setView('list');
        setNotice('登录已失效，请重新登录后参与。');
        return;
      }
      if (getAccessToken() !== token) return;
      const code = error instanceof ApiError && error.data && typeof error.data === 'object' && 'biz_code' in error.data
        ? error.data.biz_code : undefined;
      if (code === 'VOTE_ENDED' || code === 'VOTE_ALREADY_SUBMITTED') {
        updateVote(code === 'VOTE_ENDED' ? { status: 'ended' } : { has_voted: true });
        setView('result');
        setNotice(code === 'VOTE_ENDED' ? '这场投票已结束。' : '你已经参与过这场投票。');
        setRevision(value => value + 1);
      } else {
        setNotice(error instanceof Error ? error.message : '提交失败，请稍后重试。');
      }
    } finally {
      submission.current = null;
      setPending(false);
    }
  }

  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && screen !== 'entrance' && !submission.current) {
        setNotice('');
        setView(screen === 'list' ? 'entrance' : 'list');
      }
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [screen]);

  function interact(event: MouseEvent) {
    if (!(event.target instanceof Element)) return;
    const target = event.target.closest('[data-name^="关闭"], [data-name^="分类标签 /"], [data-name^="筛选 /"], [data-name="返回列表"], button');
    const label = target?.getAttribute('data-name') ?? '';
    if (screen === 'entrance') {
      if (target) { setTab(0); setView('list'); }
      return;
    }
    if (label.startsWith('关闭') || target?.textContent?.trim() === '×') {
      if (!submission.current) close();
      return;
    }
    if (screen === 'list') {
      const filter = tabs.indexOf(label.split(' / ')[1]);
      if (filter >= 0) { setTab(filter); return; }
      return;
    }
    if (screen === 'result') {
      if (label === '返回列表' || target?.textContent?.trim() === '返回列表') close();
      return;
    }
    if (label === '提交投票') {
      void submit();
      return;
    }
  }

  function selectOption(id: number) {
    setPicked(current => mode === 'single' ? [id]
      : current.includes(id) ? current.filter(i => i !== id) : [...current, id]);
  }

  const visible = votes.filter(vote => {
    if (tab === 0) return true;
    if (tab === 3) return vote.status === 'ended';
    return vote.status === 'ongoing' && (vote.has_voted === true) === (tab === 2);
  });
  return <main className="school-vote" aria-label="海事高中 · 心意征集簿">
    <div className="school-vote-window" style={{ width: width * scale, height: height * scale }}>
      <div className="school-vote-canvas" data-view={screen} data-mode={mode} data-mobile={mobile} data-has-selection={picked.length > 0 && !pending}
        style={{ width, height, transform: `scale(${scale})` }} onClick={interact}>
        {screen === 'entrance' ? <Entrance /> : screen === 'list' ? <List cards={
          visible.length ? visible.map(vote => <Card key={vote.id} title={vote.title} description={vote.description}
            cutoff={formatDeadline(vote.deadline)} totalVotes={vote.total_votes} participated={vote.has_voted === true}
            ended={vote.status === 'ended'} guest={!token} onOpen={() => openVote(vote)} />)
            : !loading && !loadError ? <p className="school-vote-empty">暂无投票</p> : null
        } /> : active && <Detail title={active.title} description={active.description}
          cutoff={formatDeadline(active.deadline)} totalVotes={active.total_votes} ended={active.status === 'ended'}
          resultMessage={submittedId === active.id && active.has_voted ? '投票成功，谢谢你的参与！'
            : active.has_voted ? '你已参与这场投票。' : ''}
          rows={<VoteRows vote={active} selected={screen === 'result' ? active.selected_option_ids ?? [] : picked}
            showResult={screen === 'result'} pending={pending} onSelect={selectOption} />}
        />}
        {screen !== 'entrance' && (notice || loading || loadError || pending) && (
          <div className="school-vote-notice" role="status">
            {notice && <span>{notice} </span>}
            {pending ? '正在提交…' : loading ? '正在加载投票…' : loadError}
            {loadError && <button type="button" onClick={() => setRevision(value => value + 1)}>重新加载</button>}
          </div>
        )}
        {view === 'entrance' && (
          <Link to="/home" className="school-vote-back" aria-label="返回花园">
            <img src={backArrow} alt="" />
            <span>返回</span>
          </Link>
        )}
      </div>
    </div>
  </main>;
}
