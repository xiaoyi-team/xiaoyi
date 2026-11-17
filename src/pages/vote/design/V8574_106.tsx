import type { VoteFrameContent } from '../VoteRows';
const img111021 = new URL('./art/0091a317-b255-4af6-b63b-bd9ff0b635a6.png', import.meta.url).href;
const img = new URL('./art/096a03a8-58f2-4d22-b8ff-d4f611143fea.png', import.meta.url).href;
const imgMegaphone = new URL('./art/2345c4da-2162-4645-a749-c8fe61259a7e.png', import.meta.url).href;
const imgListUnderline = new URL('./art/078681f7-5065-4a6c-bd4a-588ec288fe5d.png', import.meta.url).href;
const img2 = new URL('./art/15ded9e1-38c8-4053-a798-be53ab848bdc.png', import.meta.url).href;
const imgChatGpt2026111600083411 = new URL('./art/2707b4cc-f458-42f7-a844-8b4e24bafd7b.png', import.meta.url).href;
const imgDetailSailSticker = new URL('./art/375ad544-cdf2-466f-8511-131a55a7e75a.png', import.meta.url).href;
const imgListLighthouse = new URL('./art/0d200122-b701-4419-817b-d46ea4a17d3d.png', import.meta.url).href;
const imgChatGpt2026111600085851 = new URL('./art/0527bc48-cc50-46ff-9ded-fcfff9b30fd1.png', import.meta.url).href;

export default function Component667375({ title, description, rows }: VoteFrameContent) {
  return (
    <div className="bg-[#d1dbe5] relative h-full w-full" data-node-id="8574:106" data-name="移动端 667×375 / 单选详情">
      <div className="absolute h-[375px] left-0 top-0 w-[667px]" data-node-id="8574:107" data-name="1110_2 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none h-full w-full" src={img111021} />
      </div>
      <div className="absolute bg-[#23324b] h-[375px] left-0 opacity-[26%] top-0 w-[667px]" data-node-id="8574:108" data-name="遮罩" />
      <div className="absolute [background-size:100px_100px] bg-top-left border-2 border-[#ead5b9] border-solid h-[342px] left-[18px] rounded-[25px] top-[20px] w-[631px]" data-node-id="8574:109" style={{ backgroundImage: `url("${img}")` }} data-name="夹板 / 移动端容器" />
      <div className="absolute bg-[#cad3e1] h-[324px] left-[27px] rounded-[17px] top-[29px] w-[613px]" data-node-id="8574:110" data-name="蓝灰衬纸" />
      <div className="absolute bg-[#faf7f1] h-[314px] left-[32px] rounded-[16px] top-[32px] w-[603px]" data-node-id="8574:111" data-name="相纸内容底" />
      <div className="absolute flex h-[52.532px] items-center justify-center left-[154px] top-[26px] w-[54.976px]" data-node-id="8606:6630">
        <div className="flex-none rotate-[9.83deg]">
          <div className="h-[45px] relative w-[48px]" data-name="装饰 / megaphone">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none h-full w-full" src={imgMegaphone} />
          </div>
        </div>
      </div>
      <div className="absolute flex h-[18.237px] items-center justify-center left-[49px] top-[65px] w-[129.336px]" data-node-id="8597:6622">
        <div className="flex-none rotate-[1.44deg]">
          <div className="h-[15px] relative w-[129px]" data-name="装饰 / list-underline">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none h-full w-full" src={imgListUnderline} />
          </div>
        </div>
      </div>
      <button type="button" className="absolute block cursor-pointer left-[585px] overflow-hidden h-[44px] w-[44px] top-[31px]" data-node-id="8574:112" data-name="关闭 / 44×44触控区" aria-label="关闭">
        <div className="[word-break:break-word] absolute font-['Noto_Sans_SC:Regular'] font-normal leading-[0] left-[12px] text-[#44546e] text-[30px] text-left top-0 whitespace-nowrap" data-node-id="8574:113">
          <p className="leading-[45px]">×</p>
        </div>
      </button>
      <p className="[word-break:break-word] absolute font-['Noto_Serif_SC:Bold'] font-bold leading-[36px] left-[48px] text-[#2b4269] text-[24px] top-[37px] whitespace-nowrap" data-node-id="8574:114">
        投票详情
      </p>
      <div className="absolute bg-[#dce2ea] h-[233px] left-[283px] top-[88px] w-px" data-node-id="8574:115" data-name="左右分隔线" />
      <p className="[word-break:break-word] absolute font-['Noto_Serif_SC:Bold'] font-bold leading-[31.5px] left-[48px] text-[#283c60] text-[21px] top-[90px] w-[218px]" data-node-id="8574:116">
        {title}
      </p>
      <div className="school-vote-description [word-break:break-word] absolute font-['Noto_Sans_SC:Regular'] font-normal leading-[0] left-[48px] text-[#44546e] text-[13px] top-[161px] w-[218px]" data-node-id="8574:117">
        <p className="leading-[19px] mb-0">{description}</p>
        <p className="leading-[19px]">请选择 1 项你最想体验的内容。</p>
      </div>
      <div className="[word-break:break-word] absolute font-['Noto_Sans_SC:Regular'] font-normal leading-[0] left-[177px] text-[#44546e] text-[13px] top-[232px] w-[93px]" data-node-id="8574:118">
        <p className="leading-[19.5px] mb-0">投票截止：</p>
        <p className="leading-[19.5px]">11月30日 23:59</p>
      </div>
      <p className="[word-break:break-word] absolute font-['Noto_Sans_SC:Regular'] font-normal leading-[21px] left-[177px] text-[#44546e] text-[14px] top-[279px] w-[84px]" data-node-id="8574:119">
        已投：236人
      </p>
      <div className="school-vote-rows absolute cursor-pointer flex flex-col gap-[7px] items-start left-[300px] overflow-hidden top-[87px]" data-node-id="8574:120" data-name="选项 / 44px以上触控高度">{rows}</div>
      <button className="absolute bg-[#5b80b6] block cursor-pointer h-[44px] left-[375px] overflow-hidden rounded-[22px] top-[296px] w-[170px]" data-node-id="8574:134" data-name="提交投票">
        <p className="[word-break:break-word] absolute font-['Noto_Serif_SC:Bold'] font-bold leading-[24px] left-[53px] text-[16px] text-left text-white top-[10px] whitespace-nowrap" data-node-id="8574:135">
          提交投票
        </p>
      </button>
      <div className="absolute contents left-[15px] top-[232px]" data-node-id="8571:6600">
        <div className="absolute flex h-[137.034px] items-center justify-center left-[15px] top-[232px] w-[156.003px]" data-node-id="8574:272">
          <div className="flex-none rotate-[-21.31deg]">
            <div className="bg-[#fffbf6] border-[#968c87] border-[0.216px] border-solid h-[96.445px] relative rounded-[2.16px] shadow-[0px_0.54px_0.54px_0px_rgba(51,51,64,0.16)] w-[129.83px]" data-name="白色相纸底 / 可编辑" />
          </div>
        </div>
        <div className="absolute flex h-[109.943px] items-center justify-center left-[26.69px] top-[244.11px] w-[131.02px]" data-node-id="8574:273">
          <div className="flex-none rotate-[-21.31deg]">
            <div className="h-[74.485px] relative w-[111.579px]" data-name="灯塔照片 / 独立可替换图片">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className="absolute h-[259.63%] left-[-28.05%] max-w-none top-[-88.03%] w-[173.44%]" src={img2} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute aspect-[421/194] left-[38.23%] right-[38.23%] top-[4px]" data-node-id="8571:6608" data-name="ChatGPT 图像 2026年11月16日 00_08_34-1 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[217.01%] left-0 max-w-none top-[-64.43%] w-full" src={imgChatGpt2026111600083411} />
        </div>
      </div>
      <div className="absolute h-[71px] left-[571px] top-[291px] w-[81px]" data-node-id="8571:6609" data-name="装饰 / detail-sail-sticker">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none h-full w-full" src={imgDetailSailSticker} />
      </div>
      <div className="absolute h-[106px] left-[436px] opacity-[50%] top-[29px] w-[199px]" data-node-id="8571:6610" data-name="装饰 / list-lighthouse">
        <img alt="" className="absolute inset-0 max-w-none object-cover opacity-[50%] pointer-events-none h-full w-full" src={imgListLighthouse} />
      </div>
      <div className="absolute aspect-[1254/1254] left-[6%] right-[84.11%] top-[229px]" data-node-id="8571:6611" data-name="ChatGPT 图像 2026年11月16日 00_08_58-5 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none h-full w-full" src={imgChatGpt2026111600085851} />
      </div>
    </div>
  );
}
