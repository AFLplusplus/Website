---
bookCollapseSection: true
weight: 20
type: docs
---

# AFL++ Features

Many improvements were made over the official afl release - which did not
get any feature improvements since November 2017.

Among other changes afl++ has a more performant llvm_mode, supports
llvm up to version 11, QEMU 5.1, more speed and crashfixes for QEMU,
better *BSD and Android support and much, much more.

  Additionally the following features and patches have been integrated:

  * AFLfast's power schedules by Marcel Böhme: [https://github.com/mboehme/aflfast](https://github.com/mboehme/aflfast)

  * The new excellent MOpt mutator: [https://github.com/puppet-meteor/MOpt-AFL](https://github.com/puppet-meteor/MOpt-AFL)

  * InsTrim, a very effective CFG llvm_mode instrumentation implementation for large targets: [https://github.com/csienslab/instrim](https://github.com/csienslab/instrim)

  * C. Holler's afl-fuzz Python mutator module and llvm_mode whitelist support: [https://github.com/choller/afl](https://github.com/choller/afl)

  * Custom mutator by a library (instead of Python) by kyakdan

  * Unicorn mode which allows fuzzing of binaries from completely different platforms (integration provided by domenukk)

  * LAF-Intel or CompCov support for llvm_mode, qemu_mode and unicorn_mode

  * NeverZero patch for afl-gcc, llvm_mode, qemu_mode and unicorn_mode which prevents a wrapping map value to zero, increases coverage
  
  * Persistent mode and deferred forkserver for qemu_mode
  
  * Win32 PE binary-only fuzzing with QEMU and Wine

  * Radamsa mutator (enable with `-R` to add or `-RR` to run it exclusively).

  * QBDI mode to fuzz android native libraries via QBDI framework

  * The new CmpLog instrumentation for LLVM and QEMU inspired by [Redqueen](https://www.syssec.ruhr-uni-bochum.de/media/emma/veroeffentlichungen/2018/12/17/NDSS19-Redqueen.pdf)

  * LLVM mode Ngram coverage by Adrian Herrera [https://github.com/adrianherrera/afl-ngram-pass](https://github.com/adrianherrera/afl-ngram-pass)

  A more thorough list is available in the PATCHES file.

  | Feature/Instrumentation | afl-gcc | llvm_mode | gcc_plugin | qemu_mode        | unicorn_mode |
  | ----------------------- |:-------:|:---------:|:----------:|:----------------:|:------------:|
  | NeverZero               |    x    |     x(1)  |      (2)   |         x        |       x      |
  | Persistent mode         |         |     x     |     x      | x86[_64]/arm[64] |       x      |
  | LAF-Intel / CompCov     |         |     x     |            | x86[_64]/arm[64] | x86[_64]/arm |
  | CmpLog                  |         |     x     |            | x86[_64]/arm[64] |              |
  | Whitelist               |         |     x     |     x      |        (x)(3)    |              |
  | Non-colliding coverage  |         |     x(4)  |            |        (x)(5)    |              |
  | InsTrim                 |         |     x     |            |                  |              |
  | Ngram prev_loc coverage |         |     x(6)  |            |                  |              |
  | Context coverage        |         |     x     |            |                  |              |
  | Snapshot LKM support    |         |     x     |            |        (x)(5)    |              |

  neverZero:

  (1) default for LLVM >= 9.0, env var for older version due an efficiency bug in llvm <= 8

  (2) GCC creates non-performant code, hence it is disabled in gcc_plugin

  (3) partially via AFL_CODE_START/AFL_CODE_END

  (4) Only for LLVM >= 9 and not all targets compile

  (5) upcoming, development in the branch

  (6) not compatible with LTO and InsTrim and needs at least LLVM >= 4.1

So all in all this is the best-of afl that is currently out there :-)

