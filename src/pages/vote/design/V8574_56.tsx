import type { VoteListContent } from '../VoteRows';
const img111021 = new URL('./art/0091a317-b255-4af6-b63b-bd9ff0b635a6.png', import.meta.url).href;
const img = new URL('./art/096a03a8-58f2-4d22-b8ff-d4f611143fea.png', import.meta.url).href;
const imgListFlag = new URL('./art/1349424b-d90f-4ccf-9471-11df46794167.png', import.meta.url).href;
const imgListLighthouse = new URL('./art/0d200122-b701-4419-817b-d46ea4a17d3d.png', import.meta.url).href;
const img2 = new URL('./art/044db354-dc67-4e36-9b7e-43bca37e5298.png', import.meta.url).href;
const imgListUnderline = new URL('./art/078681f7-5065-4a6c-bd4a-588ec288fe5d.png', import.meta.url).href;
const imgChatGpt2026111600083411 = new URL('./art/2707b4cc-f458-42f7-a844-8b4e24bafd7b.png', import.meta.url).href;
const imgGroup = new URL('./art/7c359131-22ff-4b26-be73-37848796ea92.svg', import.meta.url).href;

export default function Component667375({ cards, activeTab = 0 }: VoteListContent) {
  return (
    <div className="bg-[#d1dbe5] relative h-full w-full" data-node-id="8574:56" data-name="移动端 667×375 / 投票列表">
      <div className="absolute h-[375px] left-0 top-0 w-[667px]" data-node-id="8574:57" data-name="1110_2 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none h-full w-full" src={img111021} />
      </div>
      <div className="absolute bg-[#23324b] h-[375px] left-0 opacity-[26%] top-0 w-[667px]" data-node-id="8574:58" data-name="遮罩" />
      <div className="absolute [background-size:100px_100px] bg-top-left border-2 border-[#ead5b9] border-solid h-[342px] left-[18px] rounded-[25px] top-[20px] w-[631px]" data-node-id="8574:59" style={{ backgroundImage: `url("${img}")` }} data-name="夹板 / 移动端容器" />
      <div className="absolute bg-[#cad3e1] h-[324px] left-[27px] rounded-[17px] top-[29px] w-[613px]" data-node-id="8574:60" data-name="蓝灰衬纸" />
      <div className="absolute bg-[#faf7f1] h-[314px] left-[32px] rounded-[16px] top-[32px] w-[603px]" data-node-id="8574:61" data-name="相纸内容底" />
      <div className="absolute h-[76px] left-[27px] top-[23px] w-[78px]" data-node-id="8571:6604" data-name="装饰 / list-flag">
        <img alt="" className="absolute inset-0 max-w-none object-cover opacity-[30%] pointer-events-none h-full w-full" src={imgListFlag} />
      </div>
      <div className="absolute h-[106px] left-[428px] opacity-[50%] top-[43px] w-[199px]" data-node-id="8571:6601" data-name="装饰 / list-lighthouse">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none h-full w-full" src={imgListLighthouse} />
      </div>
      <button type="button" className="absolute block cursor-pointer left-[585px] overflow-hidden h-[44px] w-[44px] top-[31px]" data-node-id="8574:62" data-name="关闭 / 44×44触控区" aria-label="关闭">
        <div className="[word-break:break-word] absolute font-['Noto_Sans_SC:Regular'] font-normal leading-[0] left-[12px] text-[#44546e] text-[30px] text-left top-0 whitespace-nowrap" data-node-id="8574:63">
          <p className="leading-[45px]">×</p>
        </div>
      </button>
      <p className="[word-break:break-word] absolute font-['Noto_Serif_SC:Bold'] font-bold leading-[36px] left-[48px] text-[#2b4269] text-[24px] top-[37px] whitespace-nowrap" data-node-id="8574:64">
        心意征集簿
      </p>
      <p className="school-vote-signature [word-break:break-word] absolute font-['Caveat:Regular'] font-normal leading-[21px] left-[178px] text-[#829cc0] text-[14px] top-[51px] whitespace-nowrap" data-node-id="8574:65">
        OSBORN
      </p>
      <p className="[word-break:break-word] absolute font-['Noto_Sans_SC:Regular'] font-normal leading-[21px] left-[48px] text-[#44546e] text-[14px] top-[75px] whitespace-nowrap" data-node-id="8574:66">
        不是命运选择了我们，而是你选择了我。
      </p>
      <button type="button" aria-pressed={activeTab === 0} className="absolute bg-[#6689ba] h-[44px] left-[48px] overflow-hidden rounded-[12px] top-[99px] w-[132px]" data-node-id="8574:67" data-name="筛选 / 全部投票">
        <p className="[word-break:break-word] absolute font-['Noto_Sans_SC:Regular'] font-normal leading-[22.5px] left-[36px] text-[15px] text-white top-[10px] whitespace-nowrap" data-node-id="8574:68">
          全部投票
        </p>
      </button>
      <button type="button" className="absolute bg-[#e9eaf0] block cursor-pointer h-[44px] left-[188px] overflow-hidden rounded-[12px] top-[99px] w-[132px]" data-node-id="8574:69" aria-pressed={activeTab === 1} data-name="筛选 / 进行中">
        <p className="[word-break:break-word] absolute font-['Noto_Sans_SC:Regular'] font-normal leading-[22.5px] left-[43.5px] text-[#55627b] text-[15px] text-left top-[10px] whitespace-nowrap" data-node-id="8574:70">
          进行中
        </p>
      </button>
      <button type="button" className="absolute bg-[#e9eaf0] block cursor-pointer h-[44px] left-[328px] overflow-hidden rounded-[12px] top-[99px] w-[132px]" data-node-id="8574:71" aria-pressed={activeTab === 2} data-name="筛选 / 已参与">
        <p className="[word-break:break-word] absolute font-['Noto_Sans_SC:Regular'] font-normal leading-[22.5px] left-[43.5px] text-[#55627b] text-[15px] text-left top-[10px] whitespace-nowrap" data-node-id="8574:72">
          已参与
        </p>
      </button>
      <button type="button" className="absolute bg-[#e9eaf0] block cursor-pointer h-[44px] left-[468px] overflow-hidden rounded-[12px] top-[99px] w-[132px]" data-node-id="8574:73" aria-pressed={activeTab === 3} data-name="筛选 / 已结束">
        <p className="[word-break:break-word] absolute font-['Noto_Sans_SC:Regular'] font-normal leading-[22.5px] left-[43.5px] text-[#55627b] text-[15px] text-left top-[10px] whitespace-nowrap" data-node-id="8574:74">
          已结束
        </p>
      </button>
      <div className="absolute h-[180px] left-[48px] overflow-x-clip overflow-y-auto top-[151px] w-[571px]" data-node-id="8574:75" data-name="投票列表 / 上下滑动">
        <div className="school-vote-cards">{cards}</div>
      </div>
      <div className="absolute bg-[#e0e3e8] h-[172px] left-[623px] rounded-[2px] top-[155px] w-[3px]" data-node-id="8574:104" data-name="滚动条底轨" />
      <div className="absolute bg-[#9bafcb] h-[88px] left-[623px] rounded-[2px] top-[155px] w-[3px]" data-node-id="8574:105" data-name="滚动条" />
      <div className="absolute drop-shadow-[0.32px_0.64px_0.32px_rgba(77,69,61,0.13)] h-[56px] left-[573px] overflow-hidden top-[315px] w-[86px]" data-node-id="8574:260" data-name="装饰 / 小乌龟线稿便签">
        <div className="absolute flex inset-[0.15%_1.57%_6.11%_0.66%] items-center justify-center" data-node-id="8574:261" style={{ containerType: "size" }}>
          <div className="flex-none h-[hypot(9.37591cqw,64.9301cqh)] rotate-[-13.58deg] skew-x-[-0.56deg] w-[hypot(90.6241cqw,-35.0699cqh)]">
            <div className="relative h-full w-full" data-name="Group">
              <div className="absolute inset-[-0.68%_-0.21%_-0.7%_-0.31%]">
                <img alt="" className="block max-w-none h-full w-full" src={imgGroup} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex items-center justify-center left-[-5px] h-[107.457px] w-[107.457px] top-[285px]" data-node-id="8571:6602">
        <div className="flex-none rotate-[10.37deg]">
          <div className="relative h-[92.338px] w-[92.338px]" data-name="蓝色复古帆船徽章贴纸 1">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none h-full w-full" src={img2} />
          </div>
        </div>
      </div>
      <div className="absolute flex h-[18.237px] items-center justify-center left-[49px] top-[65px] w-[129.336px]" data-node-id="8571:6605">
        <div className="flex-none rotate-[1.44deg]">
          <div className="h-[15px] relative w-[129px]" data-name="装饰 / list-underline">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none h-full w-full" src={imgListUnderline} />
          </div>
        </div>
      </div>
      <div className="absolute aspect-[421/194] left-[36.88%] right-[39.58%] top-0" data-node-id="8571:6607" data-name="ChatGPT 图像 2026年11月16日 00_08_34-1 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[217.01%] left-0 max-w-none top-[-64.43%] w-full" src={imgChatGpt2026111600083411} />
        </div>
      </div>
    </div>
  );
}
