# AFL++ as a Fuzzing Framework Proposal

by Andrea.

Big changes were done in AFL++ to improve usability but the tool remains an extension of the legendary AFL that inherits also its limitations.

The future of AFL++, in my opinion, is not to improve the performance of AFL of a percentile.

We don't aim to build the "best" fuzzer, the best fuzzer is the fuzzer that you write for your target.
We just want to give you all the pieces to do so easily and effectively.

## A framework to build fuzzers

We want to create a fuzzing framework with all the pieces to build fuzzer, a sort of "LLVM of fuzzers".

afl-fuzz will be just one of the frontends to this library.

We will code it entirely in C starting from the existing AFl++ codebase for the maximum compatibility. One of our goals is to allow a DBI or a debugger to inject the entire library in a target process (like in frida-fuzzer, but better and *NOT* in Javascript).

Imagine injecting the library in a Windows application with a DLL injection with a harness that fuzzes an API with a structured mutator and without coverage. Or maybe with hardware feedback as coverage, or using a DBI, there is a landscape of possibilities.

## Multiple fuzzers in one

Imagine that you built 2 fuzzers but wants to share their results, we don't want to synchronize testcases anymore (we will ofc maintain the possibility to do that ofc for backward compatibility with AFL but seriously we want to deprecate it).

You can define these 2 fuzzers, run the first one a thread and run, e.g., 3 instances of the seconds running on 3 threads. All in the same process sharing results immediately.

There are several multithreaded fuzzers, most notably honggfuzz, but our idea is to go further and have different configurations running in different threads, not simply a multithreaded fuzzer.

## Basic building blocks

To be an effective framework, we define the basic set of building blocks and how they interact.

A fuzzer can have multiple executors (a forkserver is an executor), for instance one for CmpLog, one for coverage feedback, one for ASan that executes the binary each time that a new interesting input is found.

A fuzzer can have multiple feedback mechanisms (one for executor or multiple for executor e.g. edge coverage + cmp). When a new testcase triggers new feedback a callback decides if the new input has to be inserted in the normal queue or in the per-feedback queue or both.

So the seed selection (the favored testcases set) can work on both normal queue or per-feedback queue.
A mechanism for seed scheduling can be designed to stress a single type of feedback if the others are stuck (e.g. fuzzing does not produce anymore edge coverage but we still produce feedback regards memory allocation size, the fuzzer will use with more probability testcases from this per-feedback queue).

There will be also the possibility to use a custom algorithm for calculating the energy of a testcase that can be different for each feedback mechanism.

Mutators are independent sets of mutations. A scheduling policy can be set for such mutations (by default randomly taken like in havoc).
 
