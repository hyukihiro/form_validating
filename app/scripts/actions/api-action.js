import * as ActionTypes from '../constants/action-type';
import * as APIMethod from '../net/api-method';

const onSuccessAddress = data => ({
  type: ActionTypes.SUCCESS_ADDRESS,
  data
});

const onFailedAddress = data => ({
  type: ActionTypes.FAILED_ADDRESS,
  data
});

const loadAddress = payload => ({
  type: ActionTypes.START_ADDRESS_BY_ZIPCODE,
  payload,
  success: onSuccessAddress,
  fail: onFailedAddress,
  apiMethod: APIMethod.GET_ADDRESS_BY_ZIP
});

export const loadAddressByZip = payload => ({
  type: ActionTypes.FETCH_ADDRESS_BY_ZIPCODE,
  action: loadAddress(payload),
  payload
});
