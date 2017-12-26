#! /usr/bin/env node
const jsonfile = require("jsonfile");
const got = require("got");
const meow = require("meow");
const chalk = require("chalk");
const yosay = require("yosay");

const cwd = process.cwd();
const fileName = `package.json`;
const filePath = `${cwd}/${fileName}`;
const URL = `https://raw.githubusercontent.com/deadcoder0904/expo-updater/master/expo.json`;

function getRemainingDeps(expectedPkgs, dependencies) {
	const deps = Object.keys(dependencies).filter(
		key => !expectedPkgs.includes(key)
	);
	const depsVersions = {};
	deps.forEach(dep => {
		depsVersions[dep] = dependencies[dep];
	});
	return depsVersions;
}

function replacePackageJSON(newDeps, option) {
	const config = jsonfile.readFileSync(filePath);

	const deps = ["expo", "react-native", "react", "react-navigation"];
	const { dependencies = {}, devDependencies = {} } = config;
	const remainingDeps = getRemainingDeps(deps, dependencies);

	config["dependencies"] = Object.assign(
		newDeps["dependencies"],
		remainingDeps
	);

	const devDeps = ["jest-expo", "sentry-expo"];
	let remainingDevDeps,
		tempDevDeps = newDeps["devDependencies"];
	if (option === 1) {
		remainingDevDeps = config["devDependencies"];
		tempDevDeps = {};
	} else if (option === 2) {
		remainingDevDeps = getRemainingDeps(["jest-expo"], devDependencies);
		delete tempDevDeps["sentry-expo"];
	} else if (option === 3) {
		remainingDevDeps = getRemainingDeps(["sentry-expo"], devDependencies);
		delete tempDevDeps["jest-expo"];
	} else remainingDevDeps = getRemainingDeps(devDeps, devDependencies);

	config["devDependencies"] = Object.assign(tempDevDeps, remainingDevDeps);
	jsonfile.writeFile(filePath, config, { spaces: 2 }, function(err) {
		if (err) console.error(err);
		console.log(
			yosay(
				chalk.blue(
					`\nExpo SDK updated to Version ${newDeps["dependencies"][
						"expo"
					].slice("1")}\n`
				)
			)
		);
	});
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

	{green.bold Options}
		1 - Install {dim minimum required packages}
		2 - Install 1 with {dim jest-expo}
		3 - Install 1 with {dim sentry-expo}
		4 - Install {dim all of the above}
	`
	);

	const option = parseInt(cli.input[0]) || 0;
	if (!option || option < 1 || option > 4) cli.showHelp([(code = 2)]);
	fetchLatestExpoSDK(option);
}

main();
