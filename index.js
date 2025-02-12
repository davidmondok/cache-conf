'use strict';
const Conf = require('conf');

class CacheConf extends Conf {

	constructor(options) {
		super(options);

		this.version = options.version;
	}

	get(key, options) {
		options = options || {};

		if (options.ignoreMaxAge !== true && this.isExpired(key)) {
			super.delete(key);
			return;
		}

		const item = super.get(key);

		return item && item.data;
	}

	set(key, val, opts) {
		opts = opts || {};

		if (typeof key === 'object') {
			opts = val || {};

			const timestamp = typeof opts.maxAge === 'number' ? Date.now() + opts.maxAge : undefined;

			Object.keys(key).forEach(k => {
				super.set(k, {
					timestamp,
					version: this.version,
					data: key[k]
				});
			});
		} else {
			super.set(key, {
				timestamp: typeof opts.maxAge === 'number' ? Date.now() + opts.maxAge : undefined,
				version: this.version,
				data: val
			});
		}
	}

	has(key) {
		if (!super.has(key)) {
			return false;
		}

		if (this.isExpired(key)) {
			super.delete(key);
			return false;
		}

		return true;
	}

	isExpired(key) {
		const item = super.get(key);

		if (!item) {
			return false;
		}

		const invalidTimestamp = item.timestamp && item.timestamp < Date.now();
		const invalidVersion = item.version !== this.version;

		return Boolean(invalidTimestamp || invalidVersion);
	}
}

module.exports = CacheConf;
