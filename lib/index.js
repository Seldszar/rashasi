const { Emitter } = require("event-kit");
const lodash = require("lodash");
const {
  createOverride,
  findFragment,
  isFragmentExists,
  removeFragment,
} = require("./helpers");

/**
 * Create an overriden store client.
 *
 * @param {Object|Promise<Object>} store The store client.
 * @param {Object} [options={}] The store options.
 * @param {Array<Object>} [options.overrides=[]] The initial store overrides.
 * @return {Object} The overrided store client.
 */
async function rashasi(store, options = {}) {
  /**
   * The emitter.
   *
   * @type {Emitter}
   */
  const emitter = new Emitter();

  /**
   * The overriden fragments.
   *
   * @type {Set<Object>}
   */
  const overrides = new Set(options.overrides);

  /**
   * Broadcast the parent store changes.
   */
  store.onChange(({ oldFragment, newFragment }) => {
    const fragment = newFragment || oldFragment;

    if (isFragmentExists([...overrides.values()], fragment.key)) {
      return;
    }

    emitter.emit("did-change", {
      oldFragment,
      newFragment,
    });
  });

  /**
   * Expose the public properties.
   */
  return {
    /**
     * The parent store client.
     *
     * @type {Object}
     */
    get store() {
      return store;
    },

    /**
     * The overrides.
     *
     * @type {Array<Object>}
     */
    get overrides() {
      return lodash.cloneDeep([...overrides.values()]);
    },

    /**
     * The fragments.
     *
     * @type {Array<Object>}
     */
    get fragments() {
      const fragments = this.overrides;

      for (const fragment of store.fragments) {
        if (!isFragmentExists(fragments, fragment.key)) {
          fragments.push(fragment);
        }
      }

      return fragments;
    },

    /**
     * The store value.
     *
     * @return {Object}
     */
    get value() {
      return lodash
        .sortBy(this.fragments, "key.length")
        .reduce(
          (result, fragment) =>
            lodash.set(result, fragment.key, fragment.value),
          {},
        );
    },

    /**
     * Attach a callback called after each store change.
     *
     * @param {Function} callback Function invoked after each store change.
     * @return {Disposable} The disposable.
     */
    onChange(callback) {
      return emitter.on("did-change", callback);
    },

    /**
     * Close the store client.
     */
    async close() {
      await store.close();
    },

    /**
     * Return a fragment.
     *
     * @param {String|Array<String>} key The fragment key.
     * @return {?Object} The fragment.
     */
    get(key) {
      return findFragment(this.fragments, key);
    },

    /**
     * Check if a fragment exists.
     *
     * @param {String|Array<String>} key The fragment key.
     * @return {Boolean} Return `true` if the fragment exists, otherwise `false`.
     */
    has(key) {
      return isFragmentExists(this.fragments, key);
    },

    /**
     * Set the value of a local fragment.
     *
     * @param {String|Array<String>} key The fragment key.
     * @param {*} value The fragment value.
     */
    set(key, value) {
      const oldFragment = this.get(key);
      const newFragment = createOverride(key, value);

      if (oldFragment) {
        removeFragment(overrides, oldFragment.key);
      }

      overrides.add(newFragment);

      emitter.emit("did-change", {
        oldFragment,
        newFragment,
      });

      return this;
    },

    /**
     * Perform an update on a fragment.
     *
     * @param {String|Array<String>} key The fragment key.
     * @param {Function} updater The updater function.
     */
    update(key, updater) {
      const fragment = lodash.cloneDeep(this.get(key));
      const value = lodash.get(fragment, "value");

      return this.set(key, updater(value, fragment));
    },

    /**
     * Delete a fragment.
     *
     * @param {String|Array<String>} key The fragment key.
     */
    delete(key) {
      const oldFragment = this.get(key);
      const newFragment = store.get(key);

      if (oldFragment) {
        removeFragment(overrides, oldFragment.key);
      }

      emitter.emit("did-change", {
        oldFragment,
        newFragment,
      });
    },

    /**
     * Remove all fragments.
     */
    clear() {
      overrides.forEach(override => {
        const oldFragment = override;
        const newFragment = store.get(override.key);

        emitter.emit("did-change", {
          oldFragment,
          newFragment,
        });
      });

      overrides.clear();
    },
  };
}

module.exports = rashasi;
