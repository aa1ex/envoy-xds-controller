# client

A small CLI client primarily used for validating configuration files (YAML) using built-in validators. Useful for CI checks to ensure there are no duplicates or basic schema issues before applying configs.

## Features
- validate: scan a directory for YAML files and run a set of validators (e.g., DuplicateValidator) to report errors.

## Usage
```bash
envoy-xds-controller validate --path <dir> [--recursive]
```

## Configuration
Flags:
- --path, -p: directory to scan (required)
- --recursive, -r: recurse into subdirectories

## Exit codes
- 0 on success; non-zero if validation fails or arguments are incorrect.
