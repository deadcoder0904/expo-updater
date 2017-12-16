const jsonfile = require("@expo/json-file");
const got = require("got");
const ghGot = require("gh-got");
const packageJson = require("package-json");
const waterfall = require("async/waterfall");

const cwd = process.cwd();
let pkgVersions = {};

waterfall(
	[
		function(callback) {
			got(`https://raw.githubusercontent.com/expo/expo-sdk/master/package.json`)
				.then(res => {
					const { body } = res;
					const { version } = JSON.parse(body);
					pkgVersions = {
						expo: version,
						"react-native": `https://github.com/expo/react-native/archive/sdk-${version}.tar.gz`
					};
					callback(null, pkgVersions);
				})
				.catch(err => {
					console.log(`Couldn't get 'expo' & 'react-native' versions`);
					console.error(err);
					callback(err, null);
				});
		},
		function(pkg, callback) {
			// arg1 now equals 'one' and arg2 now equals 'two'
			got(
				`https://raw.githubusercontent.com/deadcoder0904/expo-packager/master/temp.json`
			)
				.then(res => {
					const { body } = res;
					const { react, reactNavigation } = JSON.parse(body);
					pkgVersions["react"] = react;
					pkgVersions["react-navigation"] = reactNavigation;
					callback(null, pkgVersions);
				})
				.catch(err => {
					console.log(`Couldn't get 'react' & 'react-navigation' versions`);
					console.error(err);
					callback(err, null);
				});
		},
		function(pkg, callback) {
			const npmRepos = [`jest-expo`, `sentry-expo`];

			npmRepos.map(repo => {
				packageJson(repo)
					.then(({ version }) => {
						pkgVersions[repo] = version;
					})
					.then(res => callback(null, res))
					.catch(err => {
						console.log(`Couldn't get 'jest-expo' & 'sentry-expo' versions`);
						console.error(err);
					});
			});
		}
	],
	function(err, result) {
		let pkg;

		jsonfile
			.readAsync(`${cwd}/package.json`, { cantReadFileDefault: {} })
			.then(config => {
				pkg = config;
			});

		console.log(pkgVersions);
	}
);

// console.log({ pkg });

/*
expo: 24.0.0
react-native: https://github.com/expo/react-native/archive/sdk-24.0.0.tar.gz
jest-expo: 24.0.0
sentry-expo: 1.7.0
react: 16.0.0
react-navigation: 1.0.0-beta.21
*/
