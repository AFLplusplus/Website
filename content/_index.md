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

See the [Features]({{< relref "/features" >}}) page.

If you are a student or enthusiast developer and want to contribute, we have an [idea list](https://github.com/vanhauser-thc/AFLplusplus/blob/master/docs/ideas.md) what would be cool to have! :-)

It is maintained by Marc "van Hauser" Heuse <mh@mh-sec.de>, Heiko "hexcoder-" Eißfeldt <heiko.eissfeldt@hexco.de>, Andrea Fioraldi <andreafioraldi@gmail.com> and Dominik Maier <mail@dmnk.co>.

Check out the GitHub repository [here](https://github.com/vanhauser-thc/AFLplusplus).

## Trophies

+ VLC
  * [CVE-2019-14437](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14437) [CVE-2019-14438](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14438) [CVE-2019-14498](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14498) [CVE-2019-14533](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14533) [CVE-2019-14534](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14534) [CVE-2019-14535](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14535) [CVE-2019-14776](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14776) [CVE-2019-14777](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14777) [CVE-2019-14778](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14778) [CVE-2019-14779](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14779) [CVE-2019-14970](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14970) by Antonio Morales ([GitHub Security Lab](https://securitylab.github.com/research/vlc-vulnerability-heap-overflow))
+ Sqlite
  * [CVE-2019-16168](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-16168) by Xingwei Lin
+ Vim
  * [CVE-2019-20079](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-20079) by Dhiraj ([blog](https://www.inputzero.io/2020/03/fuzzing-vim.html))
+ Tcpdump
  * [CVE-2020-8036](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-8036) by Reza Mirzazade
+ Gifsicle
  * [Issue 130](https://github.com/kohler/gifsicle/issues/130) by Ashish Kunwar
+ FFmpeg
  * [Ticket 8594](https://trac.ffmpeg.org/ticket/8594) by Andrea Fioraldi
