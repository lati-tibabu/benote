import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

// import "emoji-mart/css/emoji-mart.css";

const EmojiSelector = (handleEmojeSelect) => {
  return (
    <div>
      <Picker data={data} />
    </div>
  );
};

export default EmojiSelector;
