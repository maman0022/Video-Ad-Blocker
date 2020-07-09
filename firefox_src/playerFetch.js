fetch('https://content.jwplatform.com/libraries/KB5zFt7A.js')
    .then(a => {
        a.text()
            .then(b => {
                let filteredScript = b.replace(/(\/\/ssl\.p\.jwpcdn\.com\/)/g, 'https:$1')
                let s1 = document.createElement('script');
                let s2 = document.createElement('script');
                let s3 = document.createElement('script');
                s1.innerHTML = filteredScript;
                document.body.appendChild(s1);
                s2.src = 'playerSetup.js';
                s3.src = 'playerCustomization.js';
                document.body.appendChild(s2);
                document.body.appendChild(s3);
            })
    })