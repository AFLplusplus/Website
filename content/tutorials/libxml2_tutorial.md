# Fuzzing libxml2 with AFL++

Before starting, build AFL++ LLVM mode and QEMU mode.

I assume that the path to AFL++ is `~/AFLplusplus`, change it in the commands if your installation path is different.

Download the source of libxml2 with

```
git clone https://gitlab.gnome.org/GNOME/libxml2.git
cd libxml2
```

Now confgure it disabling the sahred libraries

```
./autogen.sh
./configure --enable-shared=no
```

If you want to enable the sanitizers, use the proper env var.

In this tutorial we will enable ASan and UBSan.

```
export AFL_USE_UBSAN=1
export AFL_USE_ASAN=1
```

Build the library using the clang wappers

```
make CC=~/AFLplusplus/afl-clang-fast CXX=~/AFLplusplus/afl-clang-fast++ LD=~/AFLplusplus/afl-clang-fast
```

When the job is completed, we start to fuzz libxml2 using the tool xmllint as harness.

```
mkdir fuzz
cp xmllint fuzz/xmllint_cov

mkdir fuzz/in
cp test/*.xml fuzz/in/

cd fuzz
```

Make sure to configure your system with our script before start afl-fuzz

```
sudo ~/AFLplusplus/afl-system-config
```

Here we are!

```
~/AFLplusplus/afl-fuzz -i in/ -o out -m none -d -- ./xmllint_cov @@
```

Beware of the `-m none`. We built it using AddressSanitizer that maps a lot of pages for the shasdow memory so we have to remove the memory limit in order to have it up and running.

XML is an higly structured input so `-d` is a good choice. It enables FidgetyAFL, a modality that skips the deterministic stages (that are well suited for binary formats) in favour of the randomic stages.

![screen1]({{% rel %}}libxml_screen1.png{{% /rel %}})

Now, knowing that libxml2 is a library and so the code is reentrant, we can speedup out fuzzing process using persistent mode.

Persistent mode avoid the overhead of forking and give a lot of speedup.

To enable it, we have to choose a reentrant routine and setup a persistent loop patching the code.

```
diff --git a/xmllint.c b/xmllint.c
index 735d951d..64725e9c 100644
--- a/xmllint.c
+++ b/xmllint.c
@@ -3102,8 +3102,19 @@ static void deregisterNode(xmlNodePtr node)
     nbregister--;
 }
 
+int main(int argc, char** argv) {
+
+  if (argc < 2) return 1;
+
+  while (__AFL_LOOP(10000))
+    parseAndPrintFile(argv[1], NULL);
+
+  return 0;
+
+}
+
 int
-main(int argc, char **argv) {
+old_main(int argc, char **argv) {
     int i, acount;
     int files = 0;
     int version = 0;
```

In this case I choose parseAndPrintFile, the main parsing routine called from the xmllint main. As you can see, I created a new main function that loops around that function.

`__AFL_LOOP` is the way that we have to tell AFL++ that we want persistent mode. Each fuzzing iteration, instead to fork and reexecute the target with a different input, is just an execution of this lopp.

The number 10000 tells that after 10000 the harness has to fork and reset the state of the target. This is useful when the fuzzed routine is reentrant but, for example, has memory leaks and so we want to restore the target after a fixed number of executions to avoid to fill the heap with useless allocated memory.

To build it, just remove the previously compile xmllint and recompile it.

```
cd ..
rm xmllint
make CC=~/AFLplusplus/afl-clang-fast CXX=~/AFLplusplus/afl-clang-fast++ LD=~/AFLplusplus/afl-clang-fast
cp xmllint fuzz/xmllint_persistent
```

Now restart the fuzzer

```
cd fuzz
~/AFLplusplus/afl-fuzz -i in/ -o out -m none -d -- ./xmllint_persistent @@
```

![screen1]({{% rel %}}libxml_screen2.png{{% /rel %}})

As you can see, the speedup is impressive.

Stay tuned for an update of this tutorial about QEMU and QEMU persistent to show how to use do binary only fuzzing.

