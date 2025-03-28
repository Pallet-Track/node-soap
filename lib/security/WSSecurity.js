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
exports.WSSecurity = void 0;
const crypto = __importStar(require("crypto"));
const utils_1 = require("../utils");
const validPasswordTypes = ['PasswordDigest', 'PasswordText'];
class WSSecurity {
    constructor(username, password, options) {
        options = options || {};
        this._username = username;
        this._password = password;
        this._envelopeKey = 'soap';
        // must account for backward compatibility for passwordType String param as well as object options defaults: passwordType = 'PasswordText', hasTimeStamp = true
        if (typeof options === 'string') {
            this._passwordType = options ? options : 'PasswordText';
            options = {};
        }
        else {
            this._passwordType = options.passwordType ? options.passwordType : 'PasswordText';
        }
        if (validPasswordTypes.indexOf(this._passwordType) === -1) {
            this._passwordType = 'PasswordText';
        }
        this._hasTimeStamp = options.hasTimeStamp || typeof options.hasTimeStamp === 'boolean' ? !!options.hasTimeStamp : true;
        /*jshint eqnull:true */
        if (options.hasNonce != null) {
            this._hasNonce = !!options.hasNonce;
        }
        this._hasTokenCreated = options.hasTokenCreated || typeof options.hasTokenCreated === 'boolean' ? !!options.hasTokenCreated : true;
        if (options.actor != null) {
            this._actor = options.actor;
        }
        if (options.mustUnderstand != null) {
            this._mustUnderstand = !!options.mustUnderstand;
        }
        if (options.envelopeKey) {
            this._envelopeKey = options.envelopeKey;
        }
    }
    toXML() {
        // avoid dependency on date formatting libraries
        function getDate(d) {
            function pad(n) {
                return n < 10 ? '0' + n : n;
            }
            return d.getUTCFullYear() + '-'
                + pad(d.getUTCMonth() + 1) + '-'
                + pad(d.getUTCDate()) + 'T'
                + pad(d.getUTCHours()) + ':'
                + pad(d.getUTCMinutes()) + ':'
                + pad(d.getUTCSeconds()) + 'Z';
        }
        const now = new Date();
        const created = getDate(now);
        let timeStampXml = '';
        if (this._hasTimeStamp) {
            const expires = getDate(new Date(now.getTime() + (1000 * 600)));
            timeStampXml = '<wsu:Timestamp wsu:Id="Timestamp-' + created + '">' +
                '<wsu:Created>' + created + '</wsu:Created>' +
                '<wsu:Expires>' + expires + '</wsu:Expires>' +
                '</wsu:Timestamp>';
        }
        let password;
        let nonce;
        if (this._hasNonce || this._passwordType !== 'PasswordText') {
            // nonce = base64 ( sha1 ( created + random ) )
            const nHash = crypto.createHash('sha1');
            nHash.update(created + Math.random());
            nonce = nHash.digest('base64');
        }
        if (this._passwordType === 'PasswordText') {
            password = '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">' + (0, utils_1.xmlEscape)(this._password) + '</wsse:Password>';
            if (nonce) {
                password += '<wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">' + nonce + '</wsse:Nonce>';
            }
        }
        else {
            /* Specific Testcase for passwordDigest calculation cover this code
            /* istanbul ignore next */
            password = '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest">' + (0, utils_1.passwordDigest)(nonce, created, this._password) + '</wsse:Password>' +
                '<wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">' + nonce + '</wsse:Nonce>';
        }
        return '<wsse:Security ' + (this._actor ? `${this._envelopeKey}:actor="${this._actor}" ` : '') +
            (this._mustUnderstand ? `${this._envelopeKey}:mustUnderstand="1" ` : '') +
            'xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
            timeStampXml +
            '<wsse:UsernameToken xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" wsu:Id="SecurityToken-' + created + '">' +
            '<wsse:Username>' + (0, utils_1.xmlEscape)(this._username) + '</wsse:Username>' +
            password +
            (this._hasTokenCreated ? '<wsu:Created>' + created + '</wsu:Created>' : '') +
            '</wsse:UsernameToken>' +
            '</wsse:Security>';
    }
}
exports.WSSecurity = WSSecurity;
//# sourceMappingURL=WSSecurity.js.map