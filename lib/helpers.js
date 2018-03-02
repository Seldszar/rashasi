const lodash = require("lodash");

/**
 * Create a new override.
 *
 * @param {String|Array<String>} key The key.
 * @param {Object} value The value.
 * @return {Object} The override object.
 */
function createOverride(key, value) {
  return {
    key: lodash.toPath(key),
    override: true,
    value,
  };
}

/**
 * Find a fragment matching the given key exists.
 *
 * @param {Set<Object>} overrides The overrides.
 * @param {String|Array<String>} key The key.
 * @return {?Object} Return the override.
 */
function findFragment(overrides, key) {
  return overrides.find(
    override => String(override.key) === String(lodash.toPath(key)),
  );
}

/**
 * Check if a fragment matching the given key exists.
 *
 * @param {Set<Object>} overrides The overrides.
 * @param {String|Array<String>} key The key.
 * @return {Boolean} Return `true` if the override exists, otherwise `false`.
 */
function isFragmentExists(overrides, key) {
  return overrides.some(
    override => String(override.key) === String(lodash.toPath(key)),
  );
}

/**
 * Remove a fragment matching the given key.
 *
 * @param {Set<Object>} overrides The overrides.
 * @param {String|Array<String>} key The key.
 */
function removeFragment(overrides, key) {
  for (const override of overrides.values()) {
    if (String(override.key) === String(lodash.toPath(key))) {
      overrides.delete(override);
    }
  }
}

exports.createOverride = createOverride;
exports.findFragment = findFragment;
exports.isFragmentExists = isFragmentExists;
exports.removeFragment = removeFragment;
