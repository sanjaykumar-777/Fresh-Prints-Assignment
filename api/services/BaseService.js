/**
 * What every service under this folder is built on.
 *
 * A service gathers the calls for one subject the API deals with and names them
 * after what they do, so a test reads as steps rather than as a list of URLs.
 * There is one class per subject, each extending this.
 *
 * Paths come from endpoints.js and the talking is done by ApiClient, so no
 * service holds an address of its own.
 */
class BaseService {
  constructor(client) {
    this.client = client;
  }
}

module.exports = BaseService;