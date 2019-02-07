import { isFunction } from '../libs/get-type-of';

class APIMethod {
  constructor(url, methodType) {
    this._url = url;
    this.methodType = methodType;
  }

  getUrl(payload) {
    let url = this._url;
    if (isFunction(url)) {
      url = this._url(payload);
    }

    return url;
  }
}

const zip = 'http://localhost/api/v1/';
export const GET_ADDRESS_BY_ZIP = new APIMethod(payload => `${zip}?zipcode=${payload.zipcode}`, 'get');
