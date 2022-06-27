// Copyright 2022 Anthony Mugendi
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const fs = require('fs'),
	path = require('path');

async function init(opts) {
	// pick values
	let = { app, prefix, dir } = opts;

	// get routes directory or default
	dir = dir || module.parent.path || __dirname;

	// read directory if exists
	if (fs.existsSync(dir) === false)
		throw new Error(`The path '${dir}' does not exist!`);

	// format prefix
	if (
		typeof prefix == 'string' &&
		prefix.length &&
		/^\//.test(prefix) === false
	) {
		prefix = '/' + prefix;
	} else if (prefix && typeof prefix !== 'string') {
		throw new Error(`Prefix provided must be a string`);
	}

	let hasPrefix = typeof prefix == 'string' ? prefix.length > 0 : false,
		allRoutes = [];

	if (hasPrefix) {
		//set /__info route
		app.get(`${prefix}/__info!`, async (req, res, next) => {
			res.json(allRoutes);
		});
	}

	// get all files in directory
	let files = getFiles('' + dir);

	files
		.map((f) => {
			// load router file
			let router = require(f);
			return { f, router };
		})
		.filter(({ router, f }) => {
			// filter out any loaded files that do not export an Express Router Instance
			return router instanceof Function && router.stack;
		})
		.forEach(({ router, f }) => {
			// no prefix so we default to directory
			if (!hasPrefix) {
				// first get relative path of directory containing file
				let relative = path.relative(dir, path.dirname(f));
				// ensure unix styled path as routes use the forward slash
				prefix = path
					.join('/', relative)
					.split(path.sep)
					.join(path.posix.sep);
			} else {
				// add to all routes
				// this only works when we have a prefix
				allRoutes.push({
					file: f,
					routes: list_routes(router).map((o) => {
						o.path = prefix + o.path;
						return o;
					}),
				});
			}

			// console.log({ f, prefix });
			app.use(prefix, router);
		});
}

function list_routes(router) {
	return router.stack.map(function (r) {
		// console.log(r);
		if (r.route && r.route.path) {
			return {
				methods: Object.keys(r.route.methods).map((m) =>
					m.toUpperCase()
				),
				path: r.route.path,
			};
		}
	});
}

function getFiles(dir) {
	const subdirs = fs.readdirSync(dir);

	// console.log(module.parent.filename)

	let files = [],
		res,
		isDir;

	for (let subdir of subdirs) {
		res = path.resolve(dir, subdir);
		isDir = fs.statSync(res).isDirectory();

		if (
			isDir ||
			// load only js files
			// ignore the requiring file
			(path.extname(res) == '.js' && res !== module.parent.filename)
		) {
			files.push(isDir ? getFiles(res) : res);
		}
	}

	return files.reduce((a, f) => a.concat(f), []);
}

module.exports = init;
