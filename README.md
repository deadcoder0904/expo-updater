# expo-updater

> Update `package.json` to use new Expo SDK

## Install

```
$ npm install --global expo-updater
```

## Usage

Goto the project root & run

```
$ expo-updater
```

## :warning: Warning ️

> Original Implementation was made to be automated, but the Expo team changes versions continuously so the original implementation didn't work when version 24.0.1 was published so I've changed the implementation to use a `expo.json` file which will be using a `JSON` file maintained by me until I am using Expo. You can fork this repo to use your own if I stop maintaining. Follow the below steps to use your own local version.

## Symlink

1. If you want to use your own version, just clone it or download it.
2. `cd expo-updater`
3. `npm install`
4. `npm link` to create a symlink to `expo-updater`
5. Now change the `index.js` file or `expo.json` file & then repeat `Step 4` again & it will use your own version.

## Related

[Surrender](https://github.com/tiaanduplessis/react-native-surrender) - CLI script that clears Watchman, removes node_modules and cleans cache using npm or yarn

## Contributing

Contributions are welcome!

1. Fork it.
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

Or open up [a issue](https://github.com/deadcoder0904/expo-updater/issues).

## License

MIT © [Akshay Kadam](https://twitter.com/deadcoder0904)
