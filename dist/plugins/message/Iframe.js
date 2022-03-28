var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import UNodeMQ, { Queue } from "../../index.js";
import { broadcastMessage, MessageType, singleMessage } from "./PostMessage.js";
import Centralization from "./coordinate/mode/Centralization.js";
import Decentralization from "./coordinate/mode/Decentralization.js";
export function getInternalIframeMessageQueueName(queueName) {
    return queueName + "_Message";
}
export function getInternalIframeCoordinateQueueName(queueName) {
    return queueName + "_Coordinate";
}
var IframeMessageHandle = (function () {
    function IframeMessageHandle(name, selfIframe, otherIframe, selfQueue, routeMode) {
        var _a;
        if (routeMode === void 0) { routeMode = "Decentralization"; }
        this.name = name;
        var defaultQueueCollection = {};
        for (var name_1 in otherIframe) {
            var queueMessageName = getInternalIframeMessageQueueName(name_1);
            defaultQueueCollection[queueMessageName] = new Queue();
            var queueCoordinateName = getInternalIframeCoordinateQueueName(name_1);
            defaultQueueCollection[queueCoordinateName] = new Queue();
        }
        this.unmq = new UNodeMQ(Object.assign(otherIframe, (_a = {},
            _a[name] = selfIframe,
            _a)), Object.assign(selfQueue, defaultQueueCollection));
        if (routeMode === "Decentralization") {
            this.routeTable = new Decentralization();
        }
        else if (routeMode === "Centralization") {
            this.routeTable = new Centralization();
        }
    }
    IframeMessageHandle.prototype.getName = function () {
        return this.name;
    };
    IframeMessageHandle.prototype.getUnmq = function () {
        return this.unmq;
    };
    IframeMessageHandle.prototype.getRouteTable = function () {
        return this.routeTable;
    };
    IframeMessageHandle.createIframe = function (name, selfIframe, otherIframe, selfQueue, routeMode) {
        if (routeMode === void 0) { routeMode = "Decentralization"; }
        if (this.iframeMessage === null) {
            this.iframeMessage = new IframeMessageHandle(name, selfIframe, otherIframe, selfQueue, routeMode);
            broadcastMessage(MessageType.OnlineNotificationMessage, { exchangeName: name, msg: this.name + "\u4E0A\u7EBF\u4E86" });
        }
        return IframeMessageHandle.iframeMessage;
    };
    IframeMessageHandle.getInstance = function () {
        return IframeMessageHandle.iframeMessage;
    };
    IframeMessageHandle.prototype.emit = function (exchangeName) {
        var _a;
        var _this = this;
        var contentList = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            contentList[_i - 1] = arguments[_i];
        }
        if (exchangeName === this.name) {
            (_a = this.unmq).emit.apply(_a, __spreadArray([exchangeName], contentList, false));
            return this;
        }
        this.routeTable
            .getCoordinate(exchangeName)
            .then(function (coordinate) {
            for (var _i = 0, contentList_1 = contentList; _i < contentList_1.length; _i++) {
                var content = contentList_1[_i];
                singleMessage(MessageType.GeneralMessage, coordinate.currentWindow, content, _this.unmq.getExchange(exchangeName).origin);
            }
        })
            .catch(function () {
            _this.unmq.getQueue(getInternalIframeMessageQueueName(exchangeName)).removeAllConsumer();
            for (var _i = 0, contentList_2 = contentList; _i < contentList_2.length; _i++) {
                var content = contentList_2[_i];
                _this.unmq.emitToQueue(getInternalIframeMessageQueueName(exchangeName), content);
            }
        });
        return this;
    };
    IframeMessageHandle.prototype.on = function (queueName, consume, payload) {
        var _this = this;
        this.unmq.on(queueName, consume, payload);
        return function () { return _this.off(queueName, consume); };
    };
    IframeMessageHandle.prototype.off = function (x, y) {
        this.unmq.off(x, y);
        return this;
    };
    IframeMessageHandle.prototype.once = function (queueName, consume, payload) {
        this.once(queueName, consume, payload);
        return this;
    };
    IframeMessageHandle.iframeMessage = null;
    return IframeMessageHandle;
}());
export default IframeMessageHandle;
