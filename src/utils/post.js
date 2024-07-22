import axios from 'axios';

export const post = (options, env, logging) => {
    return new Promise((resolve, reject) => {
      if (logging && env !== 'PROD') {
        console.log('*** REQUEST ***');
        console.log(options.body);
      }
  
      const config = {
        method: options.method,
        url: options.uri,
        headers: {...options.headers, ...options.body.header},
        data: options.body
      };
  
      axios(config)
        .then((response) => {
          resolve({
            statusCode: response.status || response.statusCode,
            headers: response.headers,
            data: response.data
          });
        })
        .catch((error) => {
          if (error.response == undefined) {
            console.log('*** RESPONSE ***');
            console.log(error);
            reject(error);
          } else {
            console.log('*** RESPONSE ***');
            console.log(error.response.data);
            resolve({
              statusCode: error.response?.status || error.response?.statusCode,
              headers: error.response?.headers,
              data: error.response?.data
            });
          }
        });
    });
  };
