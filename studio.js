const concat = require("ffmpeg-concat");

(async () => {
  await concatenate("./sample1.mp4", "./sample2.mp4");
})();

async function concatenate(...videos) {
  await concat({
    videos,
    output: "haha.mp4",
    transition: {
      name: "directionalWipe",
      duration: 500
    }
  });
}

module.exports = {
  concatenate
};
