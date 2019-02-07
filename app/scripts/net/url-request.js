import axios from 'axios';

class URLRequest {
  get(url, payload) {
    return new Promise((resolve, reject) => {
      axios({
        url,
        method: 'get',
        params: payload
      })
        .then(response => {
          const data = response.data;
          if (response.status === 200) {
            return resolve(data);
          } else {
            return reject({
              message: data.message,
              status: data.status
            });
          }
          return null;
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

export default new URLRequest();
