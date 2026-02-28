const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SPLASH_DIR = path.join(__dirname, "..", "public", "splash");
const LOGO_SRC = path.join(__dirname, "..", "public", "assets", "logo_web.png");

if (!fs.existsSync(SPLASH_DIR)) {
  fs.mkdirSync(SPLASH_DIR, { recursive: true });
}

// All Apple Device specifications from pwa-asset-generator
const iOSScreens = [
  { width: 2048, height: 2732, id: "12.9__iPad_Pro" },
  { width: 1668, height: 2388, id: "11__iPad_Pro__10.5__iPad_Pro" },
  { width: 1536, height: 2048, id: "9.7__iPad_Pro__7.9__iPad_mini" },
  { width: 1640, height: 2360, id: "10.9__iPad_Air" },
  { width: 1668, height: 2224, id: "10.5__iPad_Air" },
  { width: 1620, height: 2160, id: "10.2__iPad" },
  { width: 1320, height: 2868, id: "iPhone_15_Pro_Max__iPhone_15_Plus" },
  { width: 1179, height: 2556, id: "iPhone_15_Pro__iPhone_15__iPhone_14_Pro" },
  { width: 1290, height: 2796, id: "iPhone_14_Pro_Max" },
  { width: 1284, height: 2778, id: "iPhone_14_Plus__13_Pro_Max__12_Pro_Max" },
  { width: 1170, height: 2532, id: "iPhone_14__13_Pro__13__12_Pro__12" },
  { width: 1125, height: 2436, id: "iPhone_13_mini__12_mini__11_Pro__XS__X" },
  { width: 1242, height: 2688, id: "iPhone_11_Pro_Max__XS_Max" },
  { width: 828, height: 1792, id: "iPhone_11__XR" },
  { width: 1242, height: 2208, id: "iPhone_8_Plus__7_Plus__6s_Plus__6_Plus" },
  { width: 750, height: 1334, id: "iPhone_8__7__6s__6__4.7__iPhone_SE" },
  { width: 640, height: 1136, id: "4__iPhone_SE__iPod_touch_5th_generation" },
];

async function generate() {
  console.log("Generating exact iOS splash screens...");
  try {
    const logoBuffer = await fs.promises.readFile(LOGO_SRC);

    // Scale logo down roughly 30% padding-equivalent (approx 200-300px based on screen size)
    for (const screen of iOSScreens) {
      // iOS actually needs exact pixel matches, both in portrait and landscape
      const resolutions = [
        { w: screen.width, h: screen.height, suffix: "portrait" },
        { w: screen.height, h: screen.width, suffix: "landscape" },
      ];

      for (const res of resolutions) {
        const logoSize = Math.max(
          200,
          Math.floor(Math.min(res.w, res.h) * 0.3),
        );

        const resizedLogo = await sharp(logoBuffer)
          .resize(logoSize, logoSize, {
            fit: "contain",
            background: { r: 255, g: 255, b: 255, alpha: 0 },
          })
          .toBuffer();

        const filename = `apple-splash-${res.w}-${res.h}.jpg`;
        const filepath = path.join(SPLASH_DIR, filename);

        await sharp({
          create: {
            width: res.w,
            height: res.h,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 }, // White background
          },
        })
          .composite([{ input: resizedLogo, gravity: "center" }])
          .jpeg({ quality: 90 })
          .toFile(filepath);

        console.log(`Generated ${filename}`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

generate();
