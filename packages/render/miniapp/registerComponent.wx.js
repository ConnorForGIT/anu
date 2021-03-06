import { registeredComponents, usingComponents, refreshComponent, detachComponent } from './utils';
import { dispatchEvent } from './eventSystem';
const defer = Promise.resolve().then.bind(Promise.resolve());

export function registerComponent (type, name) {
    type.wxInstances = {};
    registeredComponents[name] = type;
    let reactInstances = type.reactInstances = [];
    let config = {
        data: {
            props: {},
            state: {},
            context: {}
        },
        lifetimes: {
            // 微信需要lifetimes, methods
            attached: function attached () {
                // 微信小程序的组件的实例化可能先于页面的React render,需要延迟
                // https://github.com/RubyLouvre/anu/issues/531
                let wx = this;
                defer(() => {
                    usingComponents[name] = type;
                    let uuid = wx.dataset.instanceUid || null;
                    refreshComponent(reactInstances, wx, uuid);
                });
            },
            detached: detachComponent
        },
        methods: {
            dispatchEvent: dispatchEvent
        }
    };
    Object.assign(config, config.lifetimes);
    return config;
}
