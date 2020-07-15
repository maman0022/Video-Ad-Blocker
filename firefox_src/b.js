browser.runtime.onMessage.addListener(startMonitor)

function nbcURL(requestDetails) {
  if (requestDetails.url.includes('.m3u8')) {
    browser.webRequest.onBeforeRequest.removeListener(nbcURL);
    fetch(requestDetails.url)
      .then(a => {
        a.text()
          .then(b => {
            let final;
            let highestRes = 0;
            let highestBand = 0;
            let all = b.match(/BANDWIDTH=(.+\n)+?#/mg);
            let last = b.match(/BANDWIDTH=.+/mg);
            let lastOne = last.pop();
            all.push(lastOne);
            all.forEach(v => {
              if (parseInt(v.match(/\d+/)[0]) > highestBand && parseInt(v.match(/RESOLUTION=(\d+)/)[1]) >= highestRes) {
                highestBand = parseInt(v.match(/\d+/)[0]);
                highestRes = parseInt(v.match(/RESOLUTION=(\d+)/)[1]);
                final = v.match(/https:.+/)[0].replace('"', '');
              }
            })
            fetch(final)
              .then(c => {
                c.text()
                  .then(d => {
                    var removeOthers=d.replace(/#EXTINF.+\n.+(?:tvessai|akamaihd\.net\/i\/ads).+/gm, '');
                    var str2 = URL.createObjectURL(new Blob([removeOthers]));
                    browser.storage.local.set({ url: str2, drm: false, cbs: false })
                      .then(() => {
                        browser.tabs.query({ active: true, currentWindow: true }, function (tabs) { browser.tabs.sendMessage(tabs[0].id, {}); });
                        browser.tabs.create({ url: "player.html" })
                      })
                  })
              })
          })
      })
  }
}

function foxURL(requestDetails) {

  if (/\/(\w)\.m3u8\?pbs/.test(requestDetails.url)) {
    browser.webRequest.onBeforeRequest.removeListener(foxURL);
    manifest = requestDetails.url.replace(/\/(\w)\.m3u8\?pbs/, '/k.m3u8?pbs');
    fetch(manifest)
      .then(a => {
        a.text()
          .then(b => {
            var str = b.replace(/htt.+H00.+/g, '').replace(/htt.+E00.+/g, '').replace(/htt.+I00.+/g, '').replace(/htt.+si(=|%3D)2./g, '').replace(/https.+\/\/.+\/check\?.+/g, '').replace(/#EXTINF.+\n[^h]/g, '');
            var str2 = URL.createObjectURL(new Blob([str]))
            browser.storage.local.set({ url: str2, drm: false, cbs: false })
              .then(() => {
                browser.tabs.query({ active: true, currentWindow: true }, function (tabs) { browser.tabs.sendMessage(tabs[0].id, {}); });
                browser.tabs.create({ url: "player.html" })
              })
          })
      })
  }

  if (/https:\/\/content\.uplynk\.com\/ext\/.+?\.mpd\?cqs=.+/.test(requestDetails.url)) {
    browser.webRequest.onBeforeRequest.removeListener(foxURL);
    fetch(requestDetails.url).then(a => {
      a.text().then(b => {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(b, "text/xml");
        liurl = xmlDoc.getElementsByTagName('ms:laurl')[0].getAttribute('licenseUrl');
        browser.storage.local.set({ url: requestDetails.url, drm: true, lurl: liurl, cbs: false })
          .then(() => {
            browser.tabs.query({ active: true, currentWindow: true }, function (tabs) { browser.tabs.sendMessage(tabs[0].id, {}); });
            browser.tabs.create({ url: "player.html" })
          })
      })
    })
  }

}

function cbsAuthURL(requestDetails) {
  for (let header of requestDetails.requestHeaders) {
    if (header.name.toLowerCase() === 'authorization') {
      browser.webRequest.onBeforeSendHeaders.removeListener(cbsAuthURL);
      browser.storage.local.set({ cbsAuth: header.value, drm: false, cbsWvUrl: requestDetails.url, cbs: true })
        .then(() => {
          browser.tabs.query({ active: true, currentWindow: true }, function (tabs) { browser.tabs.sendMessage(tabs[0].id, {}); });
          browser.tabs.create({ url: "player.html" })
        })
    }
  }
}

function cbsURL(requestDetails) {
  if (requestDetails.url.includes('stream.mpd')) {
    browser.webRequest.onBeforeRequest.removeListener(cbsURL);
    browser.storage.local.set({ url: requestDetails.url })
  }
}

function startMonitor() {
  browser.webRequest.onBeforeRequest.addListener(
    foxURL,
    { urls: ["*://*.uplynk.com/*", "*://*.fox.com/*", "*://*.abc.com/*"] }
  );

  browser.webRequest.onBeforeRequest.addListener(
    nbcURL,
    { urls: ["*://*.theplatform.com/*"] }
  );

  browser.webRequest.onBeforeSendHeaders.addListener(
    cbsAuthURL,
    { urls: ["https://cbsi.live.ott.irdeto.com/widevine/*"] },
    ["requestHeaders"]
  );

  browser.webRequest.onBeforeRequest.addListener(
    cbsURL,
    { urls: ["https://vod-gcs-cedexis.cbsaavideo.com/*"] }
  );
}

startMonitor();