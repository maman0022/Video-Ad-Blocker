var setup;
chrome.storage.local.get(null,after)
  function after(a){
  if (a.drm) {
    setup = {
      "playlist": [
        {
          "sources": [
            {
              file: a.url,
              drm: {
                widevine: {
                  url: a.lurl,
                }
              }
            }
          ]
        }
      ],
      "autostart": true,
      width: "60%"
    }
  }
  else {
    setup = {
      "playlist": [
        {
          "sources": [
            {
              "file": a.url,
              "type": "hls"
            }
          ]
        }
      ],
      "autostart": true,
      width: "60%"
    }
  }
  jwplayer("videoContainer").setup(setup);
}