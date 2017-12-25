#! /usr/bin/env node

const jsonfile = require("@expo/json-file");
const got = require("got");
const meow = require("meow");
const chalk = require("chalk");
const updateNotifier = require("update-notifier");
const pkg = require("./package.json");

const cwd = process.cwd();
const fileName = `a.json`;
const URL = `https://raw.githubusercontent.com/deadcoder0904/expo-updater/master/expo.json`;

updateNotifier({ pkg }).notify();

function getRemainingDeps(expectedPkgs, dependencies) {
	const deps = Object.keys(dependencies).filter(key => !pkgs.includes(key));
	const depsVersions = {};
	deps.forEach(dep => {
		depsVersions[dep] = dependencies[dep];
	});
	return depsVersions;
}

function readPackageJSON(success = () => null, error = () => null) {
	jsonfile
		.readAsync(`${cwd}/${fileName}`, { cantReadFileDefault: {} })
		.then(success)
		.catch(error);
}

function writePackageJSON(
	key,
	result,
	success = () => null,
	error = () => null
) {
	jsonfile
		.setAsync(`${cwd}/${fileName}`, key, result)
		.then(success)
		.catch(error);
}

function findAndReplaceDeps() {
	const deps = ["expo", "react-native", "react", "react-navigation"];
	const { dependencies = [] } = config;

	const remainingDeps = getRemainingDeps(deps, dependencies);
	writePackageJSON(
		"dependencies",
		Object.assign(newDeps["dependencies"], remainingDeps),
		res => {
			console.log(
				`Expo SDK updated to Version ${newDeps["dependencies"]["expo"].slice(
					"1"
				)} 🎉`
			);
		},
		err => {
			console.error(`Error setting dependencies in '${fileName}'`);
		}
	);
}

function replacePackageJSON(newDeps, option) {
	readPackageJSON(
		config => {
			findAndReplaceDeps();

			const devDeps = ["jest-expo", "sentry-expo"];
			const { devDependencies = [] } = config;

			let remainingDevDeps;
			let tempDevDeps = Object.assign({}, newDeps.devDependencies);

			if (option === 2) {
				remainingDevDeps = replacePackagesDeps(devDeps, [devDependencies[0]]);
				delete tempDevDeps[devDependencies[1]];
			} else if (option === 3) {
				remainingDevDeps = replacePackagesDeps(devDeps, [devDependencies[1]]);
				delete tempDevDeps[devDependencies[0]];
			} else if (option === 4)
				remainingDevDeps = replacePackagesDeps(devDeps, devDependencies);
		},
		err => {
			console.error(`Error reading '${fileName}'`);
		}
	);
}

function fetchLatestExpoSDK(option) {
	got(URL)
		.then(res => {
			const { body } = res;
			const newDeps = JSON.parse(body);
			replacePackageJSON(newDeps, option);
		})
		.catch(err => {
			console.log(`Couldn't fetch 'expo' versions`);
		});
}

function main() {
	const cli = meow(
		chalk`
	{green.bold Usage}
		$ expo-updater <option>

	{green.bold Examples}
		$ expo-updater 1
		Expo SDK updated to Version 24.0.0 🎉

	{green.bold Options}
		1 - Install {dim minimum required packages}
		2 - Install 1 with {dim jest-expo}
		3 - Install 1 with {dim sentry-expo}
		4 - Install 1 with {dim jest-expo} & {dim sentry-expo}
		5 - Install {dim all packages}
	`
	);

	const option = parseInt(cli.input[0]) || 0;
	if (!option || option < 1 || option > 5) cli.showHelp([(code = 2)]);
	fetchLatestExpoSDK(option);
}

main();
