import { Option, defaultOption, LogLevel, OutputType } from "./config";
import UNodeMQ, { Queue, Exchange } from "u-node-mq";
import { getUUID, isFunction } from "./tools";
import { onListener } from "./listener";

type WechatLogType = WechatMiniprogram.Error | WechatMiniprogram.GeneralCallbackResult;

function proxyConsle(content: unknown, payload: unknown) {
  console.log("----consle 日志---");
  console.log(content, payload);
}

function proxyRealtime(content: unknown, payload: unknown) {
  console.log("----realtime 日志---");
  console.log(content, payload);
}

function proxyRequest(content: unknown, payload: unknown) {
  console.log("----request 日志---");
  console.log(content, payload);
}

const list = {
  [OutputType.Console]: proxyConsle,
  [OutputType.Realtime]: proxyRealtime,
  [OutputType.Request]: proxyRequest,
};

function proxyWxApi(api: keyof WechatMiniprogram.Wx) {
  return wx.canIUse(api);
}

const p = proxyWxApi;
type T = typeof wx;
const t: WechatMiniprogram.Wx = {
  ...wx,
};
function getMiniprogramInfo() {
  return {
    system: {
      // w: p.getWindowInfo(),
      s: wx.getSystemSetting(),
      S: wx.getSkylineInfoSync(),
      d: wx.getDeviceInfo(),
      a: wx.getAppBaseInfo(),
      A: wx.getAppAuthorizeSetting(),
    },
    life: {
      l: wx.getLaunchOptionsSync(),
      a: wx.getApiCategory(),
    },
  };
}
type Message = {
  type: LogLevel;
  uuid: string;
  content?: unknown;
};
/**
 * 1. 基础库版本检测
 * 2. 系统信息检查
 * 3. 最小调用api
 */
export class Logs {
  /**
   * u-node-mq
   */
  private readonly unmq = new UNodeMQ(
    Object.fromEntries(Object.entries(LogLevel).map((item) => [item[1], new Exchange<Message>()])),
    Object.fromEntries(Object.entries(OutputType).map((item) => [item[1], new Queue<Message>()]))
  );
  /**
   * 初始化获取当前系统信息
   */
  private readonly systemInfo = getMiniprogramInfo();
  /**
   * uuid
   */
  private readonly uuid = getUUID();
  /**
   *
   * @param option
   */
  constructor(option: Option = defaultOption) {
    if (!isFunction(wx.canIUse)) throw new Error("基础库低于 1.1.1");

    /**
     * 设置交换机路由
     */
    Object.entries(option).forEach((item) => {
      const e = this.unmq.getExchange(item[0]);
      if (e === null) return e;
      e.setRoutes(item[1]);
    });

    /**
     * 添加默认的监听器
     */
    Object.values(OutputType).forEach((item) => {
      this.unmq.on(item, list[item], { uuid: this.uuid });
    });

    onListener();
  }
  /**
   * 获取当前页面环境
   * @returns
   */
  private getCurrentPage() {
    return getCurrentPages()[getCurrentPages().length - 1];
  }
  info(content: unknown) {
    this.unmq.emit("info", {
      type: LogLevel.Info,
      uuid: this.uuid,
      content,
    });
  }
  warn(content: unknown) {
    this.unmq.emit("warn", {
      type: LogLevel.Warn,
      uuid: this.uuid,
      content,
    });
  }
  error(content: unknown) {
    this.unmq.emit("error", {
      type: LogLevel.Error,
      uuid: this.uuid,
      content,
    });
  }
  private onError(error: WechatLogType) {
    this.error(error);
  }
  /**
   *
   */
  off() {
    wx.offError(this.onError);
  }
}
