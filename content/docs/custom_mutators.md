---
bookCollapseSection: true
weight: 20
type: docs
---

# Custom Mutators in AFL++

This file describes how you can implement custom mutations to be used in AFL.
For now, we support C/C++ library and Python module, collectively named as the
custom mutator.

There is also experimental support for Rust in `custom_mutators/rust`. For
documentation, refer to that directory. Run `cargo doc -p custom_mutator --open`
in that directory to view the documentation in your web browser.

Implemented by
- C/C++ library (`*.so`): Khaled Yakdan from Code Intelligence
  (<yakdan@code-intelligence.de>)
- Python module: Christian Holler from Mozilla (<choller@mozilla.com>)

## 1) Introduction

Custom mutators can be passed to `afl-fuzz` to perform custom mutations on test
cases beyond those available in AFL. For example, to enable structure-aware
fuzzing by using libraries that perform mutations according to a given grammar.

The custom mutator is passed to `afl-fuzz` via the `AFL_CUSTOM_MUTATOR_LIBRARY`
or `AFL_PYTHON_MODULE` environment variable, and must export a fuzz function.
Now AFL++ also supports multiple custom mutators which can be specified in the
same `AFL_CUSTOM_MUTATOR_LIBRARY` environment variable like this.

```bash
export AFL_CUSTOM_MUTATOR_LIBRARY="full/path/to/mutator_first.so;full/path/to/mutator_second.so"
```

For details, see [APIs]({{< relref "#2-apis" >}}) and [Usage]({{< relref "#3-usage" >}}).

The custom mutation stage is set to be the first non-deterministic stage (right
before the havoc stage).

Note: If `AFL_CUSTOM_MUTATOR_ONLY` is set, all mutations will solely be
performed with the custom mutator.

## 2) APIs

**IMPORTANT NOTE**: If you use our C/C++ API and you want to increase the size
of an **out_buf buffer, you have to use `afl_realloc()` for this, so include
`include/alloc-inl.h` - otherwise afl-fuzz will crash when trying to free
your buffers.

C/C++:

```c
void *afl_custom_init(afl_state_t *afl, unsigned int seed);
unsigned int afl_custom_fuzz_count(void *data, const unsigned char *buf, size_t buf_size);
void afl_custom_splice_optout(void *data);
size_t afl_custom_fuzz(void *data, unsigned char *buf, size_t buf_size, unsigned char **out_buf, unsigned char *add_buf, size_t add_buf_size, size_t max_size);
const char *afl_custom_describe(void *data, size_t max_description_len);
size_t afl_custom_post_process(void *data, unsigned char *buf, size_t buf_size, unsigned char **out_buf);
int afl_custom_init_trim(void *data, unsigned char *buf, size_t buf_size);
size_t afl_custom_trim(void *data, unsigned char **out_buf);
int afl_custom_post_trim(void *data, unsigned char success);
size_t afl_custom_havoc_mutation(void *data, unsigned char *buf, size_t buf_size, unsigned char **out_buf, size_t max_size);
unsigned char afl_custom_havoc_mutation_probability(void *data);
unsigned char afl_custom_queue_get(void *data, const unsigned char *filename);
void (*afl_custom_fuzz_send)(void *data, const u8 *buf, size_t buf_size);
u8 afl_custom_queue_new_entry(void *data, const unsigned char *filename_new_queue, const unsigned int *filename_orig_queue);
const char* afl_custom_introspection(my_mutator_t *data);
void afl_custom_deinit(void *data);
```

Python:

```python
def init(seed):
    pass

def fuzz_count(buf):
    return cnt

def splice_optout():
    pass

def fuzz(buf, add_buf, max_size):
    return mutated_out

def describe(max_description_length):
    return "description_of_current_mutation"

def post_process(buf):
    return out_buf

def init_trim(buf):
    return cnt

def trim():
    return out_buf

def post_trim(success):
    return next_index

def havoc_mutation(buf, max_size):
    return mutated_out

def havoc_mutation_probability():
    return probability # int in [0, 100]

def queue_get(filename):
    return True

def fuzz_send(buf):
    pass

def queue_new_entry(filename_new_queue, filename_orig_queue):
    return False

def introspection():
    return string

def deinit():  # optional for Python
    pass
```

### Custom Mutation

- `init` (optional in Python):

    This method is called when AFL++ starts up and is used to seed RNG and set
    up buffers and state.

- `queue_get` (optional):

    This method determines whether AFL++ should fuzz the current
    queue entry or not: all defined custom mutators as well as
    all AFL++'s mutators.

- `fuzz_count` (optional):

    When a queue entry is selected to be fuzzed, afl-fuzz selects the number of
    fuzzing attempts with this input based on a few factors. If, however, the
    custom mutator wants to set this number instead on how often it is called
    for a specific queue entry, use this function. This function is most useful
    if `AFL_CUSTOM_MUTATOR_ONLY` is **not** used.

- `splice_optout` (optional):

    If this function is present, no splicing target is passed to the `fuzz`
    function. This saves time if splicing data is not needed by the custom
    fuzzing function.
    This function is never called, just needs to be present to activate.

- `fuzz` (optional):

    This method performs your custom mutations on a given input.
    The add_buf is the contents of another queue item that can be used for
    splicing - or anything else - and can also be ignored. If you are not
    using this additional data then define `splice_optout` (see above).
    This function is optional.
    Returning a length of 0 is valid and is interpreted as skipping this
    one mutation result.
    For non-Python: the returned output buffer is under **your** memory
    management!

- `describe` (optional):

    When this function is called, it shall describe the current test case,
    generated by the last mutation. This will be called, for example, to name
    the written test case file after a crash occurred. Using it can help to
    reproduce crashing mutations.

- `havoc_mutation` and `havoc_mutation_probability` (optional):

    `havoc_mutation` performs a single custom mutation on a given input. This
    mutation is stacked with other mutations in havoc. The other method,
    `havoc_mutation_probability`, returns the probability that `havoc_mutation`
    is called in havoc. By default, it is 6%.

- `post_process` (optional):

    For some cases, the format of the mutated data returned from the custom
    mutator is not suitable to directly execute the target with this input. For
    example, when using libprotobuf-mutator, the data returned is in a protobuf
    format which corresponds to a given grammar. In order to execute the target,
    the protobuf data must be converted to the plain-text format expected by the
    target. In such scenarios, the user can define the `post_process` function.
    This function is then transforming the data into the format expected by the
    API before executing the target.

    This can return any python object that implements the buffer protocol and
    supports PyBUF_SIMPLE. These include bytes, bytearray, etc.

    You can decide in the post_process mutator to not send the mutated data
    to the target, e.g. if it is too short, too corrupted, etc. If so,
    return a NULL buffer and zero length (or a 0 length string in Python).

    NOTE: Do not make any random changes to the data in this function!

    PERFORMANCE for C/C++: If possible make the changes in-place (so modify
    the `*data` directly, and return it as `*outbuf = data`.

- `fuzz_send` (optional):

    This method can be used if you want to send data to the target yourself,
    e.g. via IPC. This replaces some usage of utils/afl_proxy but requires
    that you start the target with afl-fuzz.

    Setting `AFL_CUSTOM_MUTATOR_LATE_SEND` will call the afl_custom_fuzz_send()
    function after the target has been restarted. (This is needed for e.g. TCP
    services.)

    Example: [custom_mutators/examples/custom_send.c](https://github.com/AFLplusplus/AFLplusplus/blob/stable/docs/../custom_mutators/examples/custom_send.c)

- `queue_new_entry` (optional):

    This methods is called after adding a new test case to the queue. If the
    contents of the file was changed, return True, False otherwise.

- `introspection` (optional):

    This method is called after a new queue entry, crash or timeout is
    discovered if compiled with INTROSPECTION. The custom mutator can then
    return a string (const char *) that reports the exact mutations used.

- `deinit` (optional in Python):

    The last method to be called, deinitializing the state.

Note that there are also three functions for trimming as described in the next
section.

### Trimming Support

The generic trimming routines implemented in AFL++ can easily destroy the
structure of complex formats, possibly leading to a point where you have a lot
of test cases in the queue that your Python module cannot process anymore but
your target application still accepts. This is especially the case when your
target can process a part of the input (causing coverage) and then errors out on
the remaining input.

In such cases, it makes sense to implement a custom trimming routine. The API
consists of multiple methods because after each trimming step, we have to go
back into the C code to check if the coverage bitmap is still the same for the
trimmed input. Here's a quick API description:

- `init_trim` (optional):

    This method is called at the start of each trimming operation and receives
    the initial buffer. It should return the amount of iteration steps possible
    on this input (e.g., if your input has n elements and you want to remove
    them one by one, return n, if you do a binary search, return log(n), and so
    on).

    If your trimming algorithm doesn't allow to determine the amount of
    (remaining) steps easily (esp. while running), then you can alternatively
    return 1 here and always return 0 in `post_trim` until you are finished and
    no steps remain. In that case, returning 1 in `post_trim` will end the
    trimming routine. The whole current index/max iterations stuff is only used
    to show progress.

- `trim` (optional)

    This method is called for each trimming operation. It doesn't have any
    arguments because there is already the initial buffer from `init_trim` and
    we can memorize the current state in the data variables. This can also save
    reparsing steps for each iteration. It should return the trimmed input
    buffer.

- `post_trim` (optional)

    This method is called after each trim operation to inform you if your
    trimming step was successful or not (in terms of coverage). If you receive a
    failure here, you should reset your input to the last known good state. In
    any case, this method must return the next trim iteration index (from 0 to
    the maximum amount of steps you returned in `init_trim`).

Omitting any of three trimming methods will cause the trimming to be disabled
and trigger a fallback to the built-in default trimming routine.

**IMPORTANT** If you have a custom post process mutator that needs to be run
after trimming, you must call it yourself at the end of your successful
trimming!


### Environment Variables

Optionally, the following environment variables are supported:

- `AFL_CUSTOM_MUTATOR_ONLY`

    Disable all other mutation stages. This can prevent broken test cases (those
    that your Python module can't work with anymore) to fill up your queue. Best
    combined with a custom trimming routine (see below) because trimming can
    cause the same test breakage like havoc and splice.

- `AFL_PYTHON_ONLY`

    Deprecated and removed, use `AFL_CUSTOM_MUTATOR_ONLY` instead.

- `AFL_DEBUG`

    When combined with `AFL_NO_UI`, this causes the C trimming code to emit
    additional messages about the performance and actions of your custom
    trimmer. Use this to see if it works :)

## 3) Usage

### Prerequisite

For Python mutators, the python 3 or 2 development package is required. On
Debian/Ubuntu/Kali it can be installed like this:

```bash
sudo apt install python3-dev
# or
sudo apt install python-dev
```

Then, AFL++ can be compiled with Python support. The AFL++ Makefile detects
Python3 through `python-config`/`python3-config` if it is in the PATH and
compiles `afl-fuzz` with the feature if available.

Note: for some distributions, you might also need the package `python[3]-apt`.
In case your setup is different, set the necessary variables like this:
`PYTHON_INCLUDE=/path/to/python/include LDFLAGS=-L/path/to/python/lib make`.

### Helpers

For C/C++ custom mutators you get a pointer to `afl_state_t *afl` in the
`afl_custom_init()` which contains all information that you need.
Note that if you access it, you need to recompile your custom mutator if
you update AFL++ because the structure might have changed!

For mutators written in Python, Rust, GO, etc. there are a few environment
variables set to help you to get started:

`AFL_CUSTOM_INFO_PROGRAM` - the program name of the target that is executed.
If your custom mutator is used with modes like Qemu (`-Q`), this will still
contain the target program, not afl-qemu-trace.

`AFL_CUSTOM_INFO_PROGRAM_INPUT` - if the `-f` parameter is used with afl-fuzz
then this value is found in this environment variable.

`AFL_CUSTOM_INFO_PROGRAM_ARGV` - this contains the parameters given to the
target program and still has the `@@` identifier in there.

Note: If `AFL_CUSTOM_INFO_PROGRAM_INPUT` is empty and `AFL_CUSTOM_INFO_PROGRAM_ARGV`
is either empty or does not contain `@@` then the target gets the input via
`stdin`.

`AFL_CUSTOM_INFO_OUT` - This is the output directory for this fuzzer instance,
so if `afl-fuzz` was called with `-o out -S foobar`, then this will be set to
`out/foobar`.

### Custom Mutator Preparation

For C/C++ mutators, the source code must be compiled as a shared object:

```bash
gcc -shared -Wall -O3 example.c -o example.so
```

Note that if you specify multiple custom mutators, the corresponding functions
will be called in the order in which they are specified. E.g., the first
`post_process` function of `example_first.so` will be called and then that of
`example_second.so`.

### Run

C/C++

```bash
export AFL_CUSTOM_MUTATOR_LIBRARY="/full/path/to/example_first.so;/full/path/to/example_second.so"
afl-fuzz /path/to/program
```

Python

```bash
export PYTHONPATH=`dirname /full/path/to/example.py`
export AFL_PYTHON_MODULE=example
afl-fuzz /path/to/program
```

## 4) Example

See [example.c](https://github.com/AFLplusplus/AFLplusplus/blob/stable/docs/../custom_mutators/examples/example.c) and
[example.py](https://github.com/AFLplusplus/AFLplusplus/blob/stable/docs/../custom_mutators/examples/example.py).

## 5) Other Resources

- AFL libprotobuf mutator
    - [bruce30262/libprotobuf-mutator_fuzzing_learning](https://github.com/bruce30262/libprotobuf-mutator_fuzzing_learning/tree/master/4_libprotobuf_aflpp_custom_mutator)
    - [thebabush/afl-libprotobuf-mutator](https://github.com/thebabush/afl-libprotobuf-mutator)
- [XML Fuzzing@NullCon 2017](https://www.agarri.fr/docs/XML_Fuzzing-NullCon2017-PUBLIC.pdf)
    - [A bug detected by AFL + XML-aware mutators](https://bugs.chromium.org/p/chromium/issues/detail?id=930663)
