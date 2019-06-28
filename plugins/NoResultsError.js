export default class NoResultsError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'NoResults';
  }
}
