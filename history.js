<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>History • MyImageApp</title>
  <!-- Tailwind via CDN for quick demo; in prod use your build pipeline -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Link to existing project stylesheet (keeps visual consistency) -->
  <link rel="stylesheet" href="/assets/style.css" />
  <style>
    /* Small local tweaks that complement Tailwind and existing style.css */
    .card-img {
      aspect-ratio: 16/10;
      object-fit: cover;
      width: 100%;
      border-radius: 0.5rem;
    }
    /* subtle skeleton loading state */
    .skeleton {
      background: linear-gradient(90deg,#f3f3f3 25%,#ececec 50%,#f3f3f3 75%);
      background-size: 200% 100%;
      animation: shine 1.2s linear infinite;
      border-radius: 0.5rem;
    }
    @keyframes shine { from { background-position: 200% 0 } to { background-position: -200% 0 } }
  </style>
</head>
<body class="bg-gray-50 text-gray-800 min-h-screen">
  <!-- Main navigation (desktop + mobile) -->
  <header class="bg-white shadow-sm">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <a href="/" class="flex items-center gap-3">
          <img src="/assets/logo.svg" alt="Logo" class="h-8 w-8" />
          <span class="font-semibold text-lg">MyImageApp</span>
        </a>

        <!-- Desktop nav -->
        <nav class="hidden md:flex items-center gap-6">
          <a href="/generate" class="hover:text-indigo-600">Generate</a>
          <!-- History link: toggled by JS only for signed-in users -->
          <a id="nav-history" href="/history.html" class="hidden hover:text-indigo-600">History</a>
          <a href="/about" class="hover:text-indigo-600">About</a>
          <div id="auth-block-desktop" class="flex items-center gap-3">
            <!-- Will be replaced by JS --></div>
        </nav>

        <!-- Mobile menu button -->
        <div class="md:hidden flex items-center">
          <button id="mobile-toggle" aria-label="Toggle menu" class="p-2 rounded-md focus:ring-2 focus:ring-indigo-500">
            <svg id="mobile-open" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            <svg id="mobile-close" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu panel -->
    <div id="mobile-panel" class="md:hidden hidden border-t bg-white">
      <div class="px-4 py-4 space-y-2">
        <a href="/generate" class="block">Generate</a>
        <a id="mobile-history" href="/history.html" class="hidden block">History</a>
        <a href="/about" class="block">About</a>
        <div id="auth-block-mobile"></div>
      </div>
    </div>
  </header>

  <!-- Page content -->
  <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-semibold">Your History</h1>
      <div class="text-sm text-gray-500">Only you can see your generated images here</div>
    </div>

    <!-- Empty / signed-out placeholder -->
    <div id="signed-out-placeholder" class="hidden rounded-lg border border-dashed border-gray-200 p-8 text-center bg-white">
      <p class="mb-4">You need to sign in to view your history.</p>
      <a href="/signin" class="inline-flex items-center gap-2 px-4 py-2 rounded-md border bg-indigo-600 text-white">Sign in</a>
    </div>

    <!-- History container -->
    <section id="history-root" class="hidden">
      <div class="mb-6 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <label for="sort" class="text-sm text-gray-600">Sort</label>
          <select id="sort" class="text-sm rounded-md border px-2 py-1">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
        <div class="text-sm text-gray-500">Stored locally for quick demo — replace with your API.</div>
      </div>

      <!-- Grid of image cards -->
      <div id="history-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Cards will be injected by JS -->
      </div>

      <!-- Pagination / load more (optional) -->
      <div class="mt-8 flex justify-center">
        <button id="load-more" class="px-4 py-2 rounded-md border hover:bg-gray-50">Load more</button>
      </div>
    </section>
  </main>

  <footer class="border-t mt-12 py-6 text-center text-sm text-gray-500">© <span id="year"></span> MyImageApp</footer>

  <!-- Script: toggles, render history, demo auth check -->
  <script>
    // ---- Demo auth: replace this logic with your real auth state check ----
    // For a real app you would read the session cookie, JWT, or call /api/me
    const isSignedIn = (() => {
      // Example: if localStorage has `demo-signed-in` set to "1" we treat user as signed in
      return localStorage.getItem('demo-signed-in') === '1';
    })();

    // DOM elements
    const navHistory = document.getElementById('nav-history');
    const mobileHistory = document.getElementById('mobile-history');
    const authBlockDesktop = document.getElementById('auth-block-desktop');
    const authBlockMobile = document.getElementById('auth-block-mobile');
    const signedOutPlaceholder = document.getElementById('signed-out-placeholder');
    const historyRoot = document.getElementById('history-root');

    // Toggle history link visibility based on auth
    if (isSignedIn) {
      navHistory.classList.remove('hidden');
      mobileHistory.classList.remove('hidden');

      // Show user menu / avatar
      authBlockDesktop.innerHTML = `
        <button id="signout" class="px-3 py-1 rounded-md border text-sm">Sign out</button>
      `;
      authBlockMobile.innerHTML = `<button id="signout-mobile" class="w-full text-left px-3 py-2 rounded-md border">Sign out</button>`;

      // Show history area
      signedOutPlaceholder.classList.add('hidden');
      historyRoot.classList.remove('hidden');

      // Render history (demo or API)
      renderHistory();
    } else {
      // Signed out UI
      navHistory.classList.add('hidden');
      mobileHistory.classList.add('hidden');
      signedOutPlaceholder.classList.remove('hidden');
      historyRoot.classList.add('hidden');

      authBlockDesktop.innerHTML = `<a href="/signin" class="px-3 py-1 rounded-md border text-sm">Sign in</a>`;
      authBlockMobile.innerHTML = `<a href="/signin" class="block px-3 py-2 rounded-md border">Sign in</a>`;
    }

    // Mobile toggle logic
    document.getElementById('mobile-toggle').addEventListener('click', () => {
      const panel = document.getElementById('mobile-panel');
      const open = panel.classList.toggle('hidden');
      document.getElementById('mobile-open').classList.toggle('hidden');
      document.getElementById('mobile-close').classList.toggle('hidden');
    });

    // Sign out demo handlers
    document.addEventListener('click', (e) => {
      if (e.target && (e.target.id === 'signout' || e.target.id === 'signout-mobile')) {
        localStorage.removeItem('demo-signed-in');
        location.reload();
      }
    });

    // set year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // ---- History rendering ----
    async function fetchHistory({ page = 1, perPage = 12 } = {}) {
      // Replace with API call like: return fetch(`/api/history?page=${page}&perPage=${perPage}`).then(r=>r.json())
      // Demo: read from localStorage demo-history or generate placeholders
      const raw = localStorage.getItem('demo-history');
      if (!raw) {
        // create demo items
        const demo = Array.from({length: 8}).map((_, i) => ({
          id: `demo-${i}`,
          prompt: `A cozy cottage in the woods, style ${i + 1}`,
          image: `https://picsum.photos/seed/history-${i}/800/500`,
          createdAt: Date.now() - i * 1000 * 60 * 60 * 24,
        }));
        localStorage.setItem('demo-history', JSON.stringify(demo));
        return demo;
      }
      return JSON.parse(raw);
    }

    function formatDate(ts) {
      const d = new Date(ts);
      return d.toLocaleString();
    }

    async function renderHistory() {
      const grid = document.getElementById('history-grid');
      grid.innerHTML = ''; // clear

      // show skeletons while fetching
      for (let i = 0; i < 6; i++) {
        const skel = document.createElement('div');
        skel.className = 'skeleton p-4 space-y-3';
        skel.innerHTML = '<div style="height:140px" class="w-full"></div><div style="height:16px;width:80%" class="rounded"></div><div style="height:12px;width:60%" class="rounded"></div>';
        grid.appendChild(skel);
      }

      const items = await fetchHistory();

      // clear skeletons
      grid.innerHTML = '';

      if (!items || items.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">No history yet. Generate some images to see them here.</div>';
        return;
      }

      // sort based on select
      const sort = document.getElementById('sort');
      sort.addEventListener('change', () => renderHistory());
      const sorted = items.slice().sort((a,b) => {
        if (sort.value === 'oldest') return a.createdAt - b.createdAt;
        return b.createdAt - a.createdAt;
      });

      for (const it of sorted) {
        const card = document.createElement('article');
        card.className = 'bg-white rounded-lg p-3 shadow-sm';
        card.innerHTML = `
          <div class="overflow-hidden rounded-md">
            <img src="${it.image}" alt="Generated image for: ${escapeHtml(it.prompt)}" class="card-img" loading="lazy" />
          </div>
          <div class="mt-3">
            <p class="text-sm text-gray-700 mb-2">${escapeHtml(it.prompt)}</p>
            <div class="text-xs text-gray-400 mb-3">${formatDate(it.createdAt)}</div>
            <div class="flex items-center gap-2">
              <button data-id="${it.id}" class="download-btn px-3 py-1 rounded-md border text-sm">Download</button>
              <button data-id="${it.id}" class="recreate-btn px-3 py-1 rounded-md border text-sm">Recreate</button>
              <button data-id="${it.id}" class="delete-btn ml-auto text-sm text-red-600">Delete</button>
            </div>
          </div>
        `;
        grid.appendChild(card);
      }

      attachCardHandlers();
    }

    function attachCardHandlers() {
      document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.id;
          // in prod use the real image url from the item /signed-url
          const items = JSON.parse(localStorage.getItem('demo-history') || '[]');
          const found = items.find(i => i.id === id);
          if (!found) return alert('Image not found');
          const a = document.createElement('a');
          a.href = found.image;
          a.download = `image-${id}.jpg`;
          document.body.appendChild(a);
          a.click();
          a.remove();
        });
      });

      document.querySelectorAll('.recreate-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.id;
          const items = JSON.parse(localStorage.getItem('demo-history') || '[]');
          const found = items.find(i => i.id === id);
          if (!found) return alert('Image not found');
          // send user to the generator with the prompt prefilled
          const q = encodeURIComponent(found.prompt);
          location.href = `/generate?prompt=${q}`;
        });
      });

      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.id;
          if (!confirm('Delete this item from history?')) return;
          let items = JSON.parse(localStorage.getItem('demo-history') || '[]');
          items = items.filter(i => i.id !== id);
          localStorage.setItem('demo-history', JSON.stringify(items));
          renderHistory();
        });
      });
    }

    // tiny sanitize helper (for demo only) — prefer proper escaping on server
    function escapeHtml(str){
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  </script>
</body>
</html>
