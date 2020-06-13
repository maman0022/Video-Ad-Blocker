browser.runtime.onMessage.addListener(startMonitor)

function nbcURL(requestDetails) {
  if (requestDetails.url.includes('.m3u8')) {
    browser.webRequest.onBeforeRequest.removeListener(nbcURL);
    fetch(requestDetails.url)
      .then(a => {
        a.text()
          .then(b => {
            fetch(b.match(/https:\/\/.+?manifest.+?theplatform\.com.+$/m)[0])
              .then(c => {
                c.text()
                .then(d => {
                  var str = d.replace(/https:\/\/tvessa.+ts/g, '');
                  var str2 = URL.createObjectURL(new Blob([str]))
                  browser.storage.local.set({ url: str2, drm: false })
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
            browser.storage.local.set({ url: str2, drm: false })
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
        browser.storage.local.set({ url: requestDetails.url, drm: true, lurl: liurl })
          .then(() => {
            browser.tabs.query({ active: true, currentWindow: true }, function (tabs) { browser.tabs.sendMessage(tabs[0].id, {}); });
            browser.tabs.create({ url: "player.html" })
          })
      })
    })
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
}

startMonitor();