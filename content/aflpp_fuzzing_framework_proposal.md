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
 
## Example functions

From a current source code perspective, afl-fuzz.c and functionality 

### Seeds

`ssize_t afpp_seedselection_load_seeds(struct_aflpp *aflpp, char *directory_or_file)`
  * ssize_t := number of seeds loaded

`void aflpp_seedselection_configure(struct_aflpp *aflpp, uint32_t weight_time, uint32_t weight_len, uint32_t rare, bool now)`
Setup a specific seed selection strategy. might need more options.
  * weight_... : apply weighting to this characeristic (0 = none, 1 = x1, 2 = x2, etc.)
  * now:= false: starting next cycle, true: immedeatly

`int32_t aflpp_seedselection_custom_register(struct_aflpp *aflpp, void *custom_seed_calculation_callback)`
Register your own seed selection algorithm
  * int32_t := -1 : failed, >= 0 : custom_seedselection_id

`bool aflpp_seedselection_custom_enable|disable(struct_aflpp *aflpp, int32_t custom_mutator_id)`
  * bool := true : success, false : failure (not defined)

`void aflpp_seedselection_method(struct_aflpp *aflpp, uint32_t method, bool now)`
Alternativly select a pre-coded stategy
  * method := enum { EXPLORE, FAST, COE, LIN, QUAD, EXPLOIT, MMOPT, RARE }

`bool aflpp_seedselection_next(struct_aflpp *aflpp)`
Go to the next seed. Normally this would not be used as aflpp_mutations_mutate() would do that.
  * bool := true: this starts next cycle

## Mutation

`void aflpp_mutations_configure(struct_aflpp *aflpp, uint64_t mutations, bool now)`
Configure the mutator
  * mutations := enum { BITFLIP, ARITH, DICT, HAVOC, MORE_HAVOC, ... }, combined with OR

`int32_t aflpp_mutations_custom_register(struct_aflpp *aflpp, void *custom_init, void *custom_new_seed, void *custom_mutate, ... `
  * int32_t := -1 : failed, >= 0 : custom_mutator_id
  * void* parameters can be NULL

`bool aflpp_mutations_custom_enable|disable(struct_aflpp *aflpp, int32_t custom_mutator_id)`
  * bool := true : success, false : failure (not defined)

`ssize_t aflpp_mutations_mutate(struct_aflpp *aflpp, uint32_t end, uint32_t count, uint32_t min_len, uint32_t max_len, void *sender_callback)`
  * end := enum { NONE, DONE_WITH_SEED, DONE_MUTATION_TYPE), combined with OR
  * count := number of maximum of mutations to perform, 0 = no limit (and basically what `end` says but can then not be NONE)
  * sender_callback := the function that sends the data to the target (e.g. to stdin, file, tcp/ip, ipc, ioctl, ...)
  * ssize_t := number of mutations performed

`ssize_t aflpp_mutations_mutate_specfic(struct_aflpp *aflpp, uint64_t mutator_type, uint32_t count, uint32_t min_len, uint32_t max_len, void *sender_callback)`
same as aflpp_mutations_mutate() but only use this specific mutator (of enum `mutations`)

`ssize_t aflpp_mutations_mutate_custom(struct_aflpp *aflpp, int32_t custom_mutator_id, uint32_t count, uint32_t min_len, uint32_t max_len, void *sender_callback)`
same as aflpp_mutations_mutate() but only use this specific mutator (of enum `mutations`)

## Sending

`ssize_t sender_callback(struct_aflpp *aflpp, u8 *buf, uint32_t len)`

we should also have default senders, e.g.
`aflpp_send_stdin`, aflpp_send_file, aflpp_send_argv, aflpp_send_network, ...
for which some need a _configure, e.g. for file, network, argv

## struct_aflpp

has pointers to struct_seed, struct_mutation, ...

