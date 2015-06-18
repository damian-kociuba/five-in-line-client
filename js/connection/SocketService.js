FiveInRowGameApp.service('Socket', ['CommandManager', function (CommandManager) {
        var connected = false;
        var socket;
        var keepConnection = false;
        var onOpenEvent;
        var connectionRefresher = new ConnectionRefresher(this);

        this.setKeepConnection = function (keepConnectionArg) {
            keepConnection = keepConnectionArg;
        };
        console.log('konstukcja soketa');
        this.connect = function () {
            console.log('proba otwarcia');
            console.log(connected);
            if (connected) {
                return;
            }
            socket = new WebSocket(REMOTE_ADDR);
            console.log('new connection');

            socket.onmessage = function (msg) {
                console.log(msg);
                CommandManager.onMessage(msg);
                if (keepConnection) {
                    connectionRefresher.restart();
                }
            };
            socket.onclose = function () {
                console.log('close');
                connected = false;
                CommandManager.onClose();
                if (keepConnection) {
                    connectionRefresher.stop();
                }
            };

            socket.onopen = function () {
                if (typeof (onOpenEvent) === 'function') {
                    onOpenEvent();
                }
                if (keepConnection) {
                    connectionRefresher.start();
                }
            };

            connected = true;
        };

        this.disconnect = function () {
            if (!connected) {
                return;
            }
            socket.close();
            connected = false;

        };

        this.setWorkScope = function (scope) {
            CommandManager.setScope(scope);
        };

        this.setOnOpenEvent = function (fun) {
            onOpenEvent = fun;
        };
        this.send = function (msg) {
            socket.send(msg);
        };
    }]);
