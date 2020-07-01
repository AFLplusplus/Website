---
title: The AFL++ fuzzing framework
type: docs
bookToc: false
---

# AFL++ Overview

AFLplusplus is the daughter of the [American Fuzzy Lop](http://lcamtuf.coredump.cx/afl/) fuzzer by Michal "lcamtuf" Zalewski and was created initially to incorporate all the best features developed in the years for the fuzzers in the AFL family and not merged in AFL cause it is not updated since November 2017.

![screen1]({{% rel %}}screenshot2.png{{% /rel %}})

The AFL++ fuzzing framework includes the following:

+ A fuzzer with many mutators and configurations: afl-fuzz.
+ Different source code instrumentation modules: LLVM mode, afl-as, GCC plugin.
+ Different binary code instrumentation modules: QEMU mode, Unicorn mode, QBDI mode.
+ Utilities for testcase/corpus minimization: afl-tmin, afl-cmin.
+ Helper libraries: libtokencap, libdislocator, libcompcov.

It includes a lot of changes, optimizations and new features respect to AFL like the AFLfast power schedules, QEMU 3.1 upgrade with CompareCoverage, MOpt mutators, InsTrim instrumentation and a lot more.

See the [Features]({{< relref "/features" >}}) page.

If you are a student or enthusiast developer and want to contribute, we have an [idea list](https://github.com/AFLplusplus/AFLplusplus/blob/master/docs/ideas.md) what would be cool to have! :-)

It is maintained by Marc "van Hauser" Heuse <mh@mh-sec.de>, Heiko "hexcoder-" Eißfeldt <heiko.eissfeldt@hexco.de>, Andrea Fioraldi <andreafioraldi@gmail.com> and Dominik Maier <mail@dmnk.co>.

Check out the GitHub repository [here](https://github.com/AFLplusplus/AFLplusplus).

## Trophies

+ VLC
  * [CVE-2019-14437](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14437) [CVE-2019-14438](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14438) [CVE-2019-14498](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14498) [CVE-2019-14533](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14533) [CVE-2019-14534](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14534) [CVE-2019-14535](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14535) [CVE-2019-14776](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14776) [CVE-2019-14777](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14777) [CVE-2019-14778](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14778) [CVE-2019-14779](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14779) [CVE-2019-14970](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14970) by Antonio Morales ([GitHub Security Lab](https://securitylab.github.com/research/vlc-vulnerability-heap-overflow))
+ Sqlite
  * [CVE-2019-16168](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-16168) by Xingwei Lin (Ant-Financial Light-Year Security Lab)
+ Vim
  * [CVE-2019-20079](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-20079) by Dhiraj ([blog](https://www.inputzero.io/2020/03/fuzzing-vim.html))
+ Pure-FTPd
  * [CVE-2019-20176](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-20176) [CVE-2020-9274](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-14437) [CVE-2020-9365](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-9365) by Antonio Morales ([GitHub Security Lab](https://securitylab.github.com/research/fuzzing-sockets-FTP))
+ Bftpd
  * [CVE-2020-6162](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-6162) [CVE-2020-6835](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-6835) by Antonio Morales ([GitHub Security Lab](https://securitylab.github.com/research/fuzzing-sockets-FTP))
+ Tcpdump
  * [CVE-2020-8036](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-8036) by Reza Mirzazade
+ ProFTPd
  * [CVE-2020-9272](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-9272) [CVE-2020-9273](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-9273) by Antonio Morales ([GitHub Security Lab](https://securitylab.github.com/research/fuzzing-sockets-FTP))
+ Gifsicle
  * [Issue 130](https://github.com/kohler/gifsicle/issues/130) by Ashish Kunwar
+ FFmpeg
  * [Ticket 8592](https://trac.ffmpeg.org/ticket/8592) [Ticket 8593](https://trac.ffmpeg.org/ticket/8593) [Ticket 8594](https://trac.ffmpeg.org/ticket/8594) [Ticket 8596](https://trac.ffmpeg.org/ticket/8596) by Andrea Fioraldi
+ Glibc
  * [Bug 25933](https://sourceware.org/bugzilla/show_bug.cgi?id=25933) by David Mendenhall

## Sponsoring

We always need servers with many cores for testing various changes for the efficiency.
If you want to sponsor a server with more than 20 cores - contact us! :-)

Current sponsors:

* [Fuzzing IO](https://www.fuzzing.io) is sponsoring a 24 core server for one year, thank you! ![screen1]({{% rel %}}logo-fuzzing-io.png{{% /rel %}})
