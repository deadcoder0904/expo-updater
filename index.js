const jsonfile = require("@expo/json-file");
const got = require("got");
const ghGot = require("gh-got");
const packageJson = require("package-json");
const waterfall = require("async/waterfall");

const cwd = process.cwd();

waterfall(
	[
		function(callback) {
			got(`https://raw.githubusercontent.com/expo/expo-sdk/master/package.json`)
				.then(res => {
					const { body } = res;
					const { version } = JSON.parse(body);
					const pkgVersions = {
						expo: version,
						"react-native": `https://github.com/expo/react-native/archive/sdk-${version}.tar.gz`
					};
					callback(null, pkgVersions);
				})
				.catch(err => {
					console.log(`Couldn't fetch 'expo' & 'react-native' versions`);
					callback(err, null);
				});
		},
		function(pkgVersions, callback) {
			// arg1 now equals 'one' and arg2 now equals 'two'
			got(
				`https://raw.githubusercontent.com/deadcoder0904/expo-updater/master/temp.json`
			)
				.then(res => {
					const { body } = res;
					const { react, reactNavigation } = JSON.parse(body);
					pkgVersions["react"] = react;
					pkgVersions["react-navigation"] = reactNavigation;
					callback(null, pkgVersions);
				})
				.catch(err => {
					console.log(`Couldn't fetch 'react' & 'react-navigation' versions`);
					callback(err, null);
				});
		},
		function(pkgVersions, callback) {
			const npmRepos = [`jest-expo`, `sentry-expo`];
			let len = npmRepos.length;

			npmRepos.map(repo => {
				packageJson(repo)
					.then(({ version }) => {
						pkgVersions[repo] = version;
						len = len - 1;
						if (len === 0) callback(null, pkgVersions);
					})
					.catch(err => {
						console.log(
							`Couldn't fetch 'jest-expo' & 'sentry-expo' versions`,
							err
						);
						callback(err, null);
					});
			});
		}
	],
	function(err, pkgVersions) {
		jsonfile
			.readAsync(`${cwd}/a.json`, { cantReadFileDefault: {} })
			.then(config => {
				const pkgs = [
					"expo",
					"react-native",
					"jest-expo",
					"sentry-expo",
					"react",
					"react-navigation"
				];

				const deps = Object.keys(config.dependencies).filter(
					key => !pkgs.includes(key)
				);
				const depsVersions = {};
				deps.forEach(dep => {
					depsVersions[dep] = config.dependencies[dep];
				});
				jsonfile.setAsync(`${cwd}/a.json`, "dependencies", {
					...pkgVersions,
					...depsVersions
				});
			});
	}
);
