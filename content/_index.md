---
title: The AFL++ fuzzing framework
type: docs
bookToc: false
---

# AFL++ Overview

AFLplusplus is the son of the [American Fuzzy Lop](http://lcamtuf.coredump.cx/afl/) fuzzer by Michal "lcamtuf" Zalewski and was created initially to incorporate all the best features developed in the years for the fuzzers in the AFL family and not merged in AFL cause it is not updated since November 2017.

![screen1]({{% rel %}}screenshot1.png{{% /rel %}})

The AFL++ fuzzing framework includes the following:

+ A fuzzer with many mutators and configurations: afl-fuzz.
+ Different source code instrumentation modules: LLVM mode, afl-as, GCC plugin.
+ Different binary code instrumentation modules: QEMU mode, Unicorn mode, QBDI mode.
+ Utilities for testcase/corpus minimization: afl-tmin, afl-cmin.
+ Helper libraries: libtokencap, libdislocator, libcompcov.

It includes a lot of changes, optimizations and new features respect to AFL like the AFLfast power schedules, QEMU 3.1 upgrade with CompareCoverage, MOpt mutators, InsTrim instrumentation and a lot more.

See the [Fetures]({{< relref "/features" >}}) page.

It is maintained by Marc "van Hauser" Heuse <mh@mh-sec.de>, Heiko "hexcoder-" Eißfeldt <heiko.eissfeldt@hexco.de>, Andrea Fioraldi <andreafioraldi@gmail.com> and Dominik Maier <mail@dmnk.co>.

Check out the GitHub repository [here](https://github.com/vanhauser-thc/AFLplusplus).
