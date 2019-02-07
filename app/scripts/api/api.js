import { isArray, isObject, isUndefined } from '../libs/get-type-of';
import URLRequest from '../net/url-request';

let isDispatching = false;

const dispatch = action => {
  if (!isObject(action)) {
    throw new Error('action must be an object');
  }

  if (isUndefined(action.type)) {
    throw new Error('action must have type');
  }

  if (isDispatching) {
    throw new Error('may not dispatch actions');
  }

  try {
    isDispatching = true;
  } finally {
    isDispatching = false;
  }
  return action;
};

export const apiRequest = (action, cb) => {
  console.log(action.fail);
  if (action && !isUndefined(action) && !isUndefined(action.apiMethod)) {
    const handleSuccess = response => {
      dispatch(action.success({ response, requestAction: action }));
      cb(action.success({ response, requestAction: action }));
    };

    const onError = error => cb(dispatch(action.fail(error)));
    if (isArray(action.apiMethod) && isUndefined(action.apiMethod)) {
      Promise.all(
        action.apiMethod.map((method, i) => {
          const methodType = method.methodType;
          const url = action.getUrl(action.payload[i]);
          return method ? URLRequest[methodType](url, action.payload[i]) : null;
        })
      )
        .then(handleSuccess)
        .catch(onError);
    } else {
      const method = action.apiMethod;
      URLRequest[method.methodType](method.getUrl(action.payload), action.payload)
        .then(handleSuccess)
        .catch(onError);
    }
    dispatch(action);
  }
};
