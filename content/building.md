---
bookCollapseSection: true
weight: 20
type: docs
---

# Build and install AFL++

Download the lastest devel version with:

```shell
$ git clone https://github.com/AFLplusplus/AFLplusplus
$ cd AFLplusplus
```

AFL++ has many build options.
The easiest is to build and install everything:

```shell
$ make distrib
$ sudo make install
```

Note that "make distrib" also builds llvm_mode, qemu_mode, unicorn_mode and
more. If you just want plain afl then do "make all", however compiling and
using at least llvm_mode is highly recommended for much better results -
hence in this case 

```shell
$ make source-only
```
is what you should choose.

These build options exist:

* all: just the main AFL++ binaries
* binary-only: everything for binary-only fuzzing: qemu_mode, unicorn_mode, libdislocator, libtokencap, radamsa
* source-only: everything for source code fuzzing: llvm_mode, libdislocator, libtokencap, radamsa
* distrib: everything (for both binary-only and source code fuzzing)
* install: installs everything you have compiled with the build options above
* clean: cleans everything. for qemu_mode and unicorn_mode it means it deletes all downloads as well
* code-format: format the code, do this before you commit and send a PR please!
* tests: runs test cases to ensure that all features are still working as they should
* help: shows these build options

[Unless you are on Mac OS X](https://developer.apple.com/library/archive/qa/qa1118/_index.html) you can also build statically linked versions of the 
AFL++ binaries by passing the STATIC=1 argument to make:

```shell
$ make all STATIC=1
```

Note that AFL++ is faster and better the newer the compilers used are.
Hence gcc-9 and especially llvm-9 should be the compilers of choice.
If your distribution does not have them, you can use the Dockerfile:

```shell
$ docker build -t aflplusplus
```
