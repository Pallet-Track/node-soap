"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSSLSecurityPFX = void 0;
const fs = __importStar(require("fs"));
const https = __importStar(require("https"));
const _ = __importStar(require("lodash"));
/**
 * activates SSL for an already existing client using a PFX cert
 *
 * @module ClientSSLSecurityPFX
 * @param {Buffer|String}   pfx
 * @param {String}   passphrase
 * @constructor
 */
class ClientSSLSecurityPFX {
    constructor(pfx, passphrase, defaults) {
        if (typeof passphrase === 'object') {
            defaults = passphrase;
        }
        if (pfx) {
            if (Buffer.isBuffer(pfx)) {
                this.pfx = pfx;
            }
            else if (typeof pfx === 'string') {
                this.pfx = fs.readFileSync(pfx);
            }
            else {
                throw new Error('supplied pfx file should be a buffer or a file location');
            }
        }
        if (passphrase) {
            if (typeof passphrase === 'string') {
                this.passphrase = passphrase;
            }
        }
        this.defaults = {};
        _.merge(this.defaults, defaults);
    }
    toXML() {
        return '';
    }
    addOptions(options) {
        options.pfx = this.pfx;
        if (this.passphrase) {
            options.passphrase = this.passphrase;
        }
        _.merge(options, this.defaults);
        options.httpsAgent = new https.Agent(options);
    }
}
exports.ClientSSLSecurityPFX = ClientSSLSecurityPFX;
//# sourceMappingURL=ClientSSLSecurityPFX.js.map