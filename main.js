chrome.app.runtime.onLaunched.addListener(
    function() {
        var screenWidth = screen.width;
        var screenHeight = screen.height;
        var width = 500;
        var height = 500;

        chrome.app.window.create(
            'index.html',
            {
                bounds: {
                    width: screenWidth/2,
                    height: screenHeight/2,
                    left: screenWidth/4,
                    top: screenHeight/4
                },
                frame       : 'none'
            }
        );
    }
);
