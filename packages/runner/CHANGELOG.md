# @cyclist/runner

## 0.6.0

### Minor Changes

- 282602e: Allow setting the default output mode for an entire stage in config
- ed5a789: Add --list command to show available lifecycles
- 3988292: Remove background stages support
- 0bcb5ac: Allow an array of stages to be provided as a shorthand lifecycle configuration

### Patch Changes

- 80266d6: Fix unhandled promise rejections when running failed commands and improve logging

## 0.5.0

### Minor Changes

- adb3259: Allow changing the output mode for tasks via config.
- adb3259: Log info about lifecycle execution

## 0.4.0

### Minor Changes

- 9efd5f7: Added support to have stages be run in the background while the rest of the lifecycle continues.

## 0.3.0

### Minor Changes

- bb42878: Added support for specifying lifecycle stages that run multiple tasks in parallel

## 0.2.0

### Minor Changes

- 605e5b7: Running cyclist without a given stage will now run all stages in the lifecycle

## 0.1.1

### Minor Changes

- Added basic support for running defined lifecycle steps
