#! /usr/bin/env node

const jsonfile = require("@expo/json-file");
const got = require("got");

const cwd = process.cwd();
const fileName = `a.json`;
const URL = `https://raw.githubusercontent.com/deadcoder0904/expo-updater/master/expo.json`;

function main() {
	got(URL)
		.then(res => {
			const { body } = res;
			const pkgVersions = JSON.parse(body);
			replacePackageJSON(pkgVersions);
		})
		.catch(err => {
			console.log(`Couldn't fetch 'expo' versions`);
		});
}

function replacePackageJSON(pkgVersions) {
	jsonfile
		.readAsync(`${cwd}/${fileName}`, { cantReadFileDefault: {} })
		.then(config => {
			const pkgs = [
				"expo",
				"react-native",
				"jest-expo",
				"sentry-expo",
				"react",
				"react-navigation"
			];
			const { dependencies = [] } = config;
			const deps = Object.keys(dependencies).filter(key => !pkgs.includes(key));
			const depsVersions = {};
			deps.forEach(dep => {
				depsVersions[dep] = dependencies[dep];
			});
			jsonfile
				.setAsync(
					`${cwd}/${fileName}`,
					"dependencies",
					Object.assign(pkgVersions, depsVersions)
				)
				.then(res => {
					console.log(`Expo SDK updated to Version ${pkgVersions["expo"]} 🎉`);
				})
				.catch(err => {
					console.error(`Error setting dependencies in '${fileName}'`);
				});
		})
		.catch(err => {
			console.error(`Error reading '${fileName}'`);
		});
}
