# AFL++ as a Fuzzing Framework Proposal

by Andrea.

Big changes were done in AFL++ to improve usability but the tool remains an extension of the legendary AFL that inherits also its limitations.

The future of AFL++, in my opinion, is not to improve the performance of AFL of a percentile.

We don't aim to build the "best" fuzzer, the best fuzzer is the fuzzer that you write for your target.
We just want to give you all the pieces to do so easily and effectively.

## A framework to build fuzzers

We want to create a fuzzing framework with all the pieces to build fuzzer, a sort of "LLVM of fuzzers".

afl-fuzz will be just one of the frontends to this library.

We will code it entirely in C starting from the existing AFL++ codebase for the maximum compatibility. One of our goals is to allow a dynamic binary instrumentation (DBI) or a debugger to inject the entire library in a target process (like in frida-fuzzer, but better and *NOT* in Javascript).

Imagine injecting the library in a Windows application with a DLL injection with a harness that fuzzes an API with a structured mutator and without coverage. Or maybe with hardware feedback as coverage, or using a DBI, there is a landscape of possibilities.

## Multiple fuzzers in one

Imagine that you built 2 fuzzers but want to share their results, we don't want to synchronize testcases anymore (we will maintain the possibility to do that ofc for backward compatibility with AFL but seriously we want to deprecate it).

You can define these 2 fuzzers, run the first one in a thread and run, e.g., 3 instances of the second running on 3 threads. All in the same process sharing results immediately.

There are several multithreaded fuzzers, most notably honggfuzz, but our idea is to go further and have different configurations running in different threads, not simply a multithreaded fuzzer.

## Basic building blocks

To be an effective framework, we define the basic set of building blocks and how they interact.

A fuzzer can have multiple executors (a forkserver is an executor), for instance one for CmpLog, one for coverage feedback, one for ASan that executes the binary each time that a new interesting input is found.

A fuzzer can have multiple feedback mechanisms (one for executor or multiple for executor e.g. edge coverage + cmp). When a new testcase triggers new feedback a callback decides if the new input has to be inserted in the normal queue or in the per-feedback queue or both.

So the seed selection (yielding the favored testcases set) can work on both normal queue or per-feedback queue.
A mechanism for seed scheduling can be designed to stress a single type of feedback if the others are stuck (e.g. fuzzing does not produce anymore edge coverage but we still produce feedback regarding memory allocation size, then the fuzzer will use with more probability testcases from this per-feedback queue).

There will be also the possibility to use a custom algorithm for calculating the energy of a testcase that can be different for each feedback mechanism.

Mutators are independent sets of mutations. A scheduling policy can be set for such mutations (by default randomly taken like in havoc).
 
## Entities

+ Virtual Input/Input State (hold input buffer and associated metadata (e.g. structure) for a testcase item)
+ Seed Queue per input channel
+ Executor (Forkserver, Fauxserver, Network Connector)
  + Input Channel (A way to send a new testcase to the target (multiple can be stacked, i.e. change command line parameters sparingly, then fuzz for each option over file/stdin))
  + Observation Channel (shared mem or whatever, also a mmaped file, define a generic interface)
+ Feedback
  + Feedback Reducer (VFuzz "Sensor" -> Reduce Observation Channel output to feedback value)
  + Feedback specific queue
    + Feedback specific seed scheduler
    + Feedback specific seed energy
+ Generic queue
  + Generic seed scheduler
  + Generic seed scheduler > andrea duplicate?
+ Stage
  + Mutator (simple)
  + StackedMutator
    + Mutation
    + run callback (schedule Mutations)

## Interfaces

```
Executor {
  observers // more than one
  current_inputs // more than one

  place_inputs() // e.g. write to file or in the target memory

  init()
  destroy()
  run_target()
}

Request {
  executor
  // request from the fuzzer (e.g. gimme me more input)
}

ObservationChannel {
  init()
  destroy()
  pre_run() // memset 0 in the edge coverage case in AFL
  post_run()
}

Feedback {
  executor
  specific_queue

  init()
  destroy()
  reduce_feedback() // not bool but e.g. float 0.0 - 1.0
}

FeedbackSpecificQueue {
  feedback
  scheduler
  energy_calc
}

GenericQueue {
  feedbacks // all feedbacks
  scheduler
  energy_calc
  
  is_interesting() // not bool but e.g. float 0.0 - 1.0
}

Stage {
  executor
  scheduler
  mutators
  
  init()
  destroy()
  run()
}

Mutator() {
  mutate()
}

StackedMutator() {
  mutations[]
  
  mutate()
}
```

## Implementation

```c
struct afl_virtual_input {
  u8 (*init_cb)(struct afl_virtual_input*); // can be NULL
  u8 (*destroy_cb)(struct afl_virtual_input*); // can be NULL

  u8* buffer;
  u32 len;
};

struct afl_executor {
  u8 (*init_cb)(struct afl_executor*); // can be NULL
  u8 (*destroy_cb)(struct afl_executor*); // can be NULL

  u8 (*run_target_cb)(struct afl_executor*);
  u8 (*place_input_cb)(struct afl_executor*); // assume current_input is valid
  
  struct afl_virtual_input* current_input;
  
  struct afl_observation_channel* observers;
  u32 observers_num;
};

struct afl_request_handler {
  u8 (*init_cb)(struct afl_request_handler*); // can be NULL
  u8 (*destroy_cb)(struct afl_request_handler*); // can be NULL

  u8 (*handle_cb)(struct afl_executor* executor, void* data);
  
  s32 request_id; // the dispatcher check this
};

struct afl_observation_channel {
  u8 (*init_cb)(struct afl_observation_channel*); // can be NULL
  u8 (*destroy_cb)(struct afl_observation_channel*); // can be NULL

  u8 (*flush_cb)(struct afl_observation_channel*); // can be NULL
  u8 (*reset_cb)(struct afl_observation_channel*); // can be NULL
  
  // extend here adding e.g. a shared memory
};

struct afl_feedback {
  u8 (*init_cb)(struct afl_feedback*); // can be NULL
  u8 (*destroy_cb)(struct afl_feedback*); // can be NULL

  u64 (*reducer_function)(u64, u64); // new_value = reducer(old_value, proposed_value)
  s32 (*is_interesting_cb)(struct afl_executor* executor); // returns rate
  
  struct afl_queue* specific_queue;
};

struct afl_queue_entry {
  u8 (*init_cb)(struct afl_queue_entry*); // can be NULL
  u8 (*destroy_cb)(struct afl_queue_entry*); // can be NULL
  
  // typical queue entry fields, omit for lazyness
};

struct afl_queue {
  u8 (*init_cb)(struct afl_queue*); // can be NULL
  u8 (*destroy_cb)(struct afl_queue*); // can be NULL
  
  u8 (*add_cb)(struct afl_executor* executor, s32 rate);

  struct afl_queue_entry* start;
  struct afl_queue_entry* current;
  
  u32 size;
};

struct afl_stage {
  u8 (*init_cb)(struct afl_stage*); // can be NULL
  u8 (*destroy_cb)(struct afl_stage*); // can be NULL

  // run is not virtual
  
  u8 (*shceduler_func)(struct afl_stage*, struct afl_mutator*);

  struct afl_mutator* mutators;
  u32 mutators_num;

  struct afl_executor* executor;
};

struct afl_mutator {
  u8 (*init_cb)(struct afl_mutator*); // can be NULL
  u8 (*destroy_cb)(struct afl_mutator*); // can be NULL
  
  u8 (*mutate_cb)(struct afl_virtual_input* input);
};

typedef u8 (*mutation_func_t)(struct afl_virtual_input* input);

struct afl_stacked_mutator {
  struct afl_mutator super;
  
  mutation_func_t* mutations;
  u32 mutations_num;
  
  // mutate_cb here is a scheduler of mutations
};
```

### Inheritance

Example of extension of afl_virtual_input.

```c
struct afl_structured_input {
  struct afl_virtual_input super;
  
  struct virtual_structure* structure;
};

u8 destroy_structure(struct afl_virtual_input* me) {

  struct afl_structured_input* i = baseof(struct afl_structured_input, super, me);
  ck_free(i->structure);
  return R_OK; // all good

}

struct afl_virtual_input* new_structured_input(void) {

  struct afl_structured_input* i = ck_alloc(sizeof(struct afl_structured_input));
  i->super.destroy_cb = &destroy_structure;
  i->structure = new_virtual_structure();

  return &i->super;

}
```

# Obsolete

this part is obsolete, don't read (maintained as a reference).

## Example functions

From a current source code perspective, afl-fuzz.c would be the main.c and all
other files be part of libaflpp.so

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

Also: load dictionary + enable/disable dictionary, etc.

## Input Sender

`ssize_t send_input(struct_aflpp *aflpp, u8 *buf, uint32_t len)`

we should also have default senders, e.g.
aflpp_send_stdin, aflpp_send_file, aflpp_send_argv, aflpp_send_network, ...
for which some need a _configure, e.g. for file, network, argv

## struct_aflpp

has pointers to struct_seed, struct_mutation, ...

