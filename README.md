# Hacking Spree
Phaser and Socket.io demo. Uses a [boilerplate by rroylance](https://github.com/rroylance/phaser-npm-webpack-typescript-starter-project) and [socket.io functionality by Jason Yang](http://gojasonyang.com/post/phaserMultiplayerGamePart1.html). Below is setup information provided by rroylance.

# Setup:
To use this you’ll need to install a few things before you have a working copy of the project. But once you have node.js installed it only takes a few seconds and a couple commands to get going.

## 0. Install Git

## 1. Download or Clone this repo

## 2. Install node.js and npm (npm is included and installed with node.js)

## 3. Install dependencies:

Navigate to the cloned repo’s directory.

Run:

```npm install```

## 4. Run the dev server:

Run to use the dev build while developing:

```npm run server:dev```

Run to use the dist build while developing

```npm run server:dist```

This will run a server that serves your built game straight to the browser and will be built and reloaded automatically anytime a change is detected.

## Build for testing/developing/debugging:

Run:

```npm run build:dev```

This will build the game with a few caveats;
- A compile time flag, DEBUG, set to true; allowing you to include or not include certain code depending on if it's DEBUG build or not.
- The resulting game.js will not be minified

## Build for release:

Run:

```npm run build:dist```

This will build the game with a few caveats;
- The compile time flag, DEBUG, set to false; allowing you to include or not include certain code depending on if it's DEBUG build or not.
- The resulting game.min.js will be minified

## Generate Assets Class:

This project will manage your assets for you! All you need to do is drop your assets in assets/ (subdirectories do not matter) and run (you need to run this manually if you change assets while the server is running, otherwise it's run automatically when running a build);

```npm run assets```

or (if your dev GOOGLE_WEB_FONTS is different from your dist);

```npm run assets:dev```

src/assets.ts will be generated which contains sections for all your asset types (the generator is smart enough to distinguish what assets are what !) and classes for every asset, it will also generate an enum containing every frame and sprite in Atlases and AudioSprites respectively!

No need to remember keys, frames, or sprites anymore; which means no more typos resulting in asset not found errors. Just use, for example, Assets.Images.ImagesBackgroundTemplate.getName() or Assets.Audiosprites.AudiospritesSfx.Sprites.Laser1. This also allows the compiler to warn you if you are trying to use an asset that doesn't exist!

The preloader will use this class to load everything, **you don't have to do anything in code to get your assets loading and available (except for any assets you need for your loading screen...)**!

Supports:

- Images:
  - bmp, gif, jpg, jpeg, png, webp
- Spritesheets:
  - bmp, gif, jpg, jpeg, png, webp
  - \[frameWidth, frameHeight, frameMax, margin, spacing\] - frameWidth & frameHeight are required.
  - Example: spritesheet.\[100, 100\].png
- Atlases:
  - bmp, gif, jpg, jpeg, png, webp
  - json (the loader figures out if it's a JSONArray or JSONHash, no need to remember or care), xml
- Audio:
  - aac, ac3, caf, flac, m4a, mp3, mp4, ogg, wav, webm
- Audiosprites:
  - aac, ac3, caf, flac, m4a, mp3, mp4, ogg, wav, webm
  - json
- Local Fonts:
  - eot, otf, svg, ttf, woff, woff2
  - css
- Bitmap Font:
  - bmp, gif, jpg, jpeg, png, webp
  - xml, fnt
- JSON:
  - json
- XML:
  - xml
- Text:
  - txt
- Scripts:
  - js
- Shaders:
  - frag

Which version of the audio to load is defined in the webpack.dev.config.js and webpack.dist.config.js under the DefinePlugin 'SOUND_EXTENSIONS_PREFERENCE' section;
- Currently I set the order to: webm, ogg, m4a, mp3, aac, ac3, caf, flac, mp4, wav
- The loader will load the audio using this as the preference; the first supported file that is found is used using the order of this list as most preferred to least preferred

## Change the game size and generate a template background:

Note: This is automatically run after running npm install, however you may want to run it again (if you deleted the background.png and want it back, or if you want to change the game size from the default).

Run:

```npm run setupGameSize```

This will run a script that will generate a template background showing the safe and decoration area of your game when it is sized or scaled for different devices as well as updating a couple global values in the webpack configs so that the game knows about the new size when built.

If you do not want the default 800 x 500 with this scaling style, run the following and all will be updated.

**DO NOT MODIFY THE (DEFAULT or MAX)\_GAME\_(WIDTH or HEIGHT) OR SCALE_MODE PLUGINS DEFINED IN THE WEBPACK CONFIGS, OR THIS WILL NOT WORK**;

Run the following for descriptions and default values for all possible options;

```npm run setupGameSize -- -h```

Run the following specifying some or all of the options;

```npm run setupGameSize -- --width [whatever width you want] --height [whatever height you want] --aspect-ratio [If you want a different default aspect ratio] --scale-mode [one of the Phaser Scale Modes] [--no-png]```

**The '--' after setupGameSize is not a mistake; it is required to pass arguments along to the script.**

You can either provide the width **and** height (defaults 800 and 500 respectively) and as long as they result in an aspect ratio of what's set in the script or by --aspect-ratio (default 1.6 or 16:10), or you can provide the width **or** height and the one you didn't provide will be calculated for you.

Providing --scale-mode will set this.game.scale.scaleMode to the corresponding Phaser.ScaleManager.SCALE_MODE (default USER_SCALE).

If you do not want the background to be created just add the flag --no-png (not putting this will let the background generate).

## Google Web Fonts:

Add your desired Google Web Fonts to the webpack.dev.config.js and/or webpack.dist.config.js in the DefinePlugin 'GOOGLE_WEB_FONTS' section and they will then be loaded and available via Assets.GoogleWebFonts.

## Custom/Local Web Fonts:

Add your desired Custom/Local Web Fonts to your assets folder and they will then be loaded and available via Assets.CustomWebFonts
- The various font files, and the css MUST share the same name
- One CSS file per font

Use one of the following generators for generating your font files;
- [Font Squirrel Webfont Generator][fontsquirrel]
- [Everything Fonts font-face generator][everythingfonts]

## Plugin management:

Drop the .js file (or .min.js) of the plugin in the assets/script folder.
Your script(s) will be loaded in the Preloader state with the `AssetUtils.Loader.loadAllAssets` call.
If you want the typescript support, you need to drop the `.d.ts` file somewhere (not in assets) and add it to the `files` array in `tsconfig.json`.

Here is an example of how to include your plugin in a state:
```
export default class MyState extends Phaser.State {

    myPlugin: Phaser.Plugin.MyPlugin;

    public preload(): void {
        this.myPlugin = new Phaser.Plugin.MyPlugin(this.game);
        this.game.plugins.add(this.myPlugin as any);
    }
}

```



## Desktop Build via Electron


You can test your game via Electron by running;

```npm run electron:dev```

or

```npm run electron:dist```

To build the dev or dist version of your game, respectively, and then open up your game in an Electron instance.

## Package Desktop App via Electron


You can package your game for Windows (win32 ia32/x64), OSX (darwin ia32/x64), Mac App Store (mas ia32/x64), Linux (linux ia32/x64/armv7l) using the following script;

```npm run electron:pack:dev```

or

```npm run electron:pack:dist```

To package the dev or dist version of your game, respectively, for the current platform you are on. You can provide many options to build specific platforms, for specific architectures, provide an icon, etc.

Refer to the [API Documentation][electron-pack-api] for a full list and details; the boilerplate developer used it kind of oddly in that he used the API from the command line and not the command line version. To provide options append ' -- ' to the npm run command and then also append '--' to the option name and then either put the value after a space or '=', either way. Examples;

```npm run electron:pack:dist -- --platform win32 --arch=ia32 //32 bit Windows exe```

```npm run electron:pack:dist -- --platform win32,darwin --arch=ia32,x64 //32 and 64 bit Windows exe and OSX app```

All builds will be in the builds/ folder in appropriately named folders.

###### Note that building for Windows from a non windows device requires a  little bit of extra setup; refer to [Building Windows apps from non-Windows platforms][electron-pack-windows].

###### Also note that for OSX / MAS target bundles: the .app bundle can only be signed when building on a host OSX platform.
