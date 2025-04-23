// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded affix "><a href="libafl.html">The LibAFL Fuzzing Library</a></li><li class="chapter-item expanded affix "><a href="introduction.html">Introduction</a></li><li class="chapter-item expanded "><a href="getting_started/getting_started.html"><strong aria-hidden="true">1.</strong> Getting Started</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="getting_started/setup.html"><strong aria-hidden="true">1.1.</strong> Setup</a></li><li class="chapter-item expanded "><a href="getting_started/build.html"><strong aria-hidden="true">1.2.</strong> Build</a></li><li class="chapter-item expanded "><a href="getting_started/crates.html"><strong aria-hidden="true">1.3.</strong> Crates</a></li></ol></li><li class="chapter-item expanded "><a href="baby_fuzzer/baby_fuzzer.html"><strong aria-hidden="true">2.</strong> Baby Fuzzer</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="baby_fuzzer/more_examples.html"><strong aria-hidden="true">2.1.</strong> More Examples</a></li></ol></li><li class="chapter-item expanded "><a href="core_concepts/core_concepts.html"><strong aria-hidden="true">3.</strong> Core Concepts</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="core_concepts/observer.html"><strong aria-hidden="true">3.1.</strong> Observer</a></li><li class="chapter-item expanded "><a href="core_concepts/executor.html"><strong aria-hidden="true">3.2.</strong> Executor</a></li><li class="chapter-item expanded "><a href="core_concepts/feedback.html"><strong aria-hidden="true">3.3.</strong> Feedback</a></li><li class="chapter-item expanded "><a href="core_concepts/input.html"><strong aria-hidden="true">3.4.</strong> Input</a></li><li class="chapter-item expanded "><a href="core_concepts/corpus.html"><strong aria-hidden="true">3.5.</strong> Corpus</a></li><li class="chapter-item expanded "><a href="core_concepts/mutator.html"><strong aria-hidden="true">3.6.</strong> Mutator</a></li><li class="chapter-item expanded "><a href="core_concepts/generator.html"><strong aria-hidden="true">3.7.</strong> Generator</a></li><li class="chapter-item expanded "><a href="core_concepts/stage.html"><strong aria-hidden="true">3.8.</strong> Stage</a></li></ol></li><li class="chapter-item expanded "><a href="design/design.html"><strong aria-hidden="true">4.</strong> Design</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="design/architecture.html"><strong aria-hidden="true">4.1.</strong> Architecture</a></li><li class="chapter-item expanded "><a href="design/metadata.html"><strong aria-hidden="true">4.2.</strong> Metadata</a></li><li class="chapter-item expanded "><a href="design/migration-0.9.html"><strong aria-hidden="true">4.3.</strong> Migrating from LibAFL &lt;0.9 to 0.9</a></li><li class="chapter-item expanded "><a href="design/migration-0.11.html"><strong aria-hidden="true">4.4.</strong> Migrating from LibAFL &lt;0.11 to 0.11</a></li></ol></li><li class="chapter-item expanded "><a href="message_passing/message_passing.html"><strong aria-hidden="true">5.</strong> Message Passing</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="message_passing/spawn_instances.html"><strong aria-hidden="true">5.1.</strong> Spawning Instances</a></li><li class="chapter-item expanded "><a href="message_passing/configurations.html"><strong aria-hidden="true">5.2.</strong> Configurations</a></li></ol></li><li class="chapter-item expanded "><a href="tutorial/tutorial.html"><strong aria-hidden="true">6.</strong> Tutorial</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="tutorial/intro.html"><strong aria-hidden="true">6.1.</strong> Introduction</a></li></ol></li><li class="chapter-item expanded "><a href="advanced_features/advanced_features.html"><strong aria-hidden="true">7.</strong> Advanced Features</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="advanced_features/frida.html"><strong aria-hidden="true">7.1.</strong> Binary-Only Fuzzing with Frida</a></li><li class="chapter-item expanded "><a href="advanced_features/concolic.html"><strong aria-hidden="true">7.2.</strong> Concolic Tracing &amp; Hybrid Fuzzing</a></li><li class="chapter-item expanded "><a href="advanced_features/no_std.html"><strong aria-hidden="true">7.3.</strong> LibAFL in no_std environments (Kernels, Hypervisors, ...)</a></li><li class="chapter-item expanded "><a href="advanced_features/nyx.html"><strong aria-hidden="true">7.4.</strong> Snapshot Fuzzing in Nyx</a></li><li class="chapter-item expanded "><a href="advanced_features/statsd_monitor.html"><strong aria-hidden="true">7.5.</strong> StatsD Monitor</a></li></ol></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
