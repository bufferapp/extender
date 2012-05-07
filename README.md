# Extender

Browser Extension Development library

At Buffer I've been managing extensions for Chrome, Firefox and Safari, and I've been frustrated by API differences and the challenging of keeping essentially three projects in sync. Extender is an effort to normalise these APIs.

Pull requests gladly accepted.

### Build

It's a bit hacky right now, but I'll improve it soon.

Basic (default) structure of an Extender project:

'''
_config.yml (optional)
extender
extension/
lib/
'''

Running 'extender' will copy the contents of 'extension' into three new directories, 'chrome', 'safari' and 'firefox'.

### Javascript

The JS library is more or less non-functional right now. Coming soon.

### License

MIT Licence