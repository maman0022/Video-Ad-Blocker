var setup;
browser.storage.local.get(null).then(a => {
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
  else if (a.cbs) {
    setup = {
      "playlist": [
        {
          "sources": [
            {
              file: a.url,
              drm: {
                widevine: {
                  url: a.cbsWvUrl,
                  "headers": [
                    {
                      "name": "Access-Control-Request-Headers",
                      "value": "authorization"
                    },
                    {
                      "name": "Authorization",
                      "value": a.cbsAuth
                    }
                  ]
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
})