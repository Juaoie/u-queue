var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Tools from "../utils/tools.js";
import Logs from "./Logs.js";
export default class Exchange {
    constructor(option) {
        this.id = Tools.random();
        this.routes = [];
        this.repeater = () => this.getRoutes();
        Object.assign(this, option);
    }
    getId() {
        return this.id;
    }
    getRoutes() {
        return this.routes;
    }
    pushRoutes(routes) {
        this.routes = Array.from(new Set(this.routes.concat(routes)));
    }
    setRoutes(routes) {
        this.routes = routes;
    }
    getRepeater() {
        return this.repeater;
    }
    setRepeater(repeater) {
        this.repeater = repeater;
    }
    removeRoutes(routes) {
        if (routes === undefined)
            this.routes = [];
        else
            this.routes = this.routes.filter((item) => routes.indexOf(item) !== -1);
    }
    getQueueNameList(content) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repeater(content);
            }
            catch (error) {
                Logs.error(`exchange function getstringList exception`);
                return [];
            }
        });
    }
}
