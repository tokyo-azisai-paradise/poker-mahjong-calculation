import { memo } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

// eslint-disable-next-line react/display-name
const ShowRoomId = memo<{ roomID: string }>(({ roomID }) => {
  return (
    <div className="py-6 tracking-widest flex flex-row">
      {/* navigator.clipboard.writeTextがhttpsでないと使えないため代用 */}
      <CopyToClipboard text={roomID}>
        <button className="px-2 py-1 border-gold-button transition-colors duration-300 transform rounded-md">
          copy
        </button>
      </CopyToClipboard>

      <h1 className="flex justify-center items-center ml-5 text-2xl sm:text-3xl">
        Id : {roomID}
      </h1>
    </div>
  );
});

export default ShowRoomId;
