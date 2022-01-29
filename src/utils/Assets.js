const gameAssets = {
  spritesheet: [
    {
      json: require('assets/ziga/main_screen.json'),
      image: require('assets/ziga/main_screen.png')
    }, {
      json: require('assets/ziga/main_screen_big_item.json'),
      image: require('assets/ziga/main_screen_big_item.png')
    }
  ],
  bitmapfont: [
    {
      fnt: require('assets/bmfonts/Tahoma').default,
      image: require('assets/bmfonts/Tahoma.png')
    }
  ],
  sound: [
    {
      name: 'click',
      file: require('assets/sounds/ButtonClick.mp3')
    }, {
      name: 'maintheme',
      file: require('assets/sounds/theme.mp3')
    }
  ]
};


export const getGameAssets = () => {
  return gameAssets;
};
