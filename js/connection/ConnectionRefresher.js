function ConnectionRefresher(socket) {
    this.interval = null;
    this.start = function () {
        this.interval = setInterval(function () {
            socket.send(JSON.stringify({
                command: 'RefreshConnection',
                parameters: {}
            }));
            console.log('refresh connection!');
        }, 50000);

    };

    this.stop = function () {

        if (this.interval === null) {
            return;
        }
        clearInterval(this.interval);
        this.interval = null;
    };

    this.restart = function () {

        this.stop();
        this.start();
    };

}