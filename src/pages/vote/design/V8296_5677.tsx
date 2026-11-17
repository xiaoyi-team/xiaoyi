const img111021 = new URL('./art/0091a317-b255-4af6-b63b-bd9ff0b635a6.png', import.meta.url).href;
const imgImg82811 = '/assets/figma/4b0fd9f2-8526-410b-84fe-a8c27364f0d6.png';
const imgFrame13 = new URL('./art/36070bc0-d1e6-481c-86f0-66578b7dafdc.svg', import.meta.url).href;

export default function Component() {
  return (
    <div className="bg-white relative h-full w-full" data-node-id="8296:5677" data-name="投票底图">
      <div className="absolute h-[1080px] left-0 top-0 w-[1920px]" data-node-id="8296:5676" data-name="1110_2 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none h-full w-full" src={img111021} />
      </div>
      <WishbookEntranceLabel />
    </div>
  );
}

export function WishbookEntranceLabel() {
  return (
      <button type="button" aria-label="打开心意征集簿" className="school-vote-entrance-label absolute contents cursor-pointer left-[821px] top-[724px]" data-node-id="8564:6466" data-name="心意征集簿 字牌">
        <div className="absolute h-[19px] left-[830px] top-[780px] w-[128px]" data-node-id="8564:6467">
          <img alt="" className="absolute block inset-0 max-w-none h-full w-full" src={imgFrame13} />
        </div>
        <div className="absolute h-[19px] left-[949px] top-[808px] w-[128px]" data-node-id="8564:6530">
          <img alt="" className="absolute block inset-0 max-w-none h-full w-full" src={imgFrame13} />
        </div>
        <div className="absolute h-[87px] left-[984px] top-[759px] w-[153px]" data-node-id="8564:6593" data-name="IMG_8281 1">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img alt="" className="absolute h-[571.91%] left-[-127.54%] max-w-none top-[-105.02%] w-[230.03%]" src={imgImg82811} />
          </div>
        </div>
        <div className="absolute h-[20px] left-[841px] rounded-[5px] top-[793px] w-[215px]" data-node-id="8564:6594" />
        <div className="-translate-y-full [word-break:break-word] absolute flex flex-col font-['Noto_Serif_SC:Bold'] font-bold h-[84px] justify-end leading-[0] left-[821px] text-[48px] [text-shadow:1px_2px_7.3px_rgba(0,0,0,0.39)] text-white top-[808px] w-[345px]" data-node-id="8564:6595">
          <p className="leading-[64px]">心意征集簿</p>
        </div>
        <div className="absolute bg-white h-px left-[830px] shadow-[1px_2px_7.3px_0px_rgba(0,0,0,0.39)] top-[811px] w-[291px]" data-node-id="8564:6596" />
        <p className="[word-break:break-word] absolute font-['Noto_Serif_SC:Regular'] font-normal h-[40px] leading-[36px] left-[978px] text-[#f4f4f4] text-[20px] [text-shadow:1px_2px_7.3px_rgba(0,0,0,0.39)] top-[818px] w-[155px]" data-node-id="8564:6597">
          The Wishbook
        </p>
      </button>
  );
}
