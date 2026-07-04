export function AuthLayout(content: string): string {
  return `
    <main class="min-h-screen overflow-hidden bg-[#e8edf7] text-[#07111f]">
      <section class="mx-auto grid min-h-screen w-full max-w-[1400px] items-center gap-8 px-6 py-8 xl:grid-cols-[230px_1fr]">

        <!-- LEFT TITLE SIDE -->
        <div class="flex items-center justify-center xl:justify-start">
          <div class="w-full max-w-[230px] text-center xl:text-left">
            <h1 class="text-4xl font-black leading-[1.05] tracking-tight text-[#07111f] 2xl:text-5xl">
              <span class="block">SMART</span>
              <span class="mt-2 block">E-WASTE</span>
              <span class="mt-2 block">LOGIN</span>
            </h1>

            <p class="mt-5 text-sm font-semibold leading-6 text-slate-600">
              Digital tracking, verification, pickup, wallet, and recycling management.
            </p>
          </div>
        </div>

        <!-- MAIN CARD -->
        <div class="relative z-10 grid min-h-[600px] w-full overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-slate-900/20 lg:grid-cols-[1.2fr_0.8fr]">

          <!-- ILLUSTRATION SIDE -->
          <div class="relative hidden overflow-hidden bg-white p-8 lg:block">
            <div class="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-gradient-to-b from-slate-300 to-white"></div>
            <div class="absolute -bottom-28 -right-28 h-72 w-72 rounded-full bg-gradient-to-t from-slate-300 to-white"></div>

            <div class="relative flex h-full items-center justify-center">
              <div class="w-full max-w-xl">

                <div class="relative mx-auto flex h-[390px] w-full max-w-[500px] items-center justify-center rounded-full border-2 border-dashed border-slate-200">

                  <!-- monitor -->
                  <div class="relative h-52 w-64 rounded-3xl bg-slate-100 shadow-xl shadow-slate-200">
                    <div class="absolute left-0 top-0 h-12 w-full rounded-t-3xl bg-[#0b1633]"></div>

                    <div class="absolute left-8 top-20 h-20 w-20 rounded-2xl bg-[#0b1633]">
                      <div class="absolute left-1/2 top-5 h-6 w-9 -translate-x-1/2 rounded-t-xl border-4 border-slate-400 border-b-0"></div>
                      <div class="absolute left-1/2 top-12 h-3 w-3 -translate-x-1/2 rounded-full bg-blue-300"></div>
                    </div>

                    <div class="absolute right-8 top-24 h-4 w-24 rounded-full bg-[#0b1633]"></div>
                    <div class="absolute right-8 top-36 h-5 w-20 rounded-full bg-blue-800"></div>

                    <div class="absolute bottom-7 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-slate-300"></div>
                    <div class="absolute -bottom-12 left-1/2 h-12 w-4 -translate-x-1/2 bg-slate-300"></div>
                    <div class="absolute -bottom-16 left-1/2 h-4 w-32 -translate-x-1/2 rounded-full bg-slate-300"></div>
                  </div>

                  <!-- check box -->
                  <div class="absolute right-8 top-20 flex h-18 w-18 items-center justify-center bg-[#172554] shadow-lg shadow-blue-950/20">
                    <span class="text-4xl font-black text-white">✓</span>
                  </div>

                  <!-- laptop -->
                  <div class="absolute bottom-18 right-14 rounded-2xl bg-[#0b1633] p-3 shadow-lg">
                    <div class="h-14 w-20 rounded-lg bg-blue-100"></div>
                    <div class="mt-2 h-2 w-24 rounded-full bg-slate-500"></div>
                  </div>

                  <!-- phone -->
                  <div class="absolute left-12 bottom-24 h-22 w-12 rounded-2xl bg-[#0b1633] p-2 shadow-lg">
                    <div class="h-full rounded-xl bg-blue-100"></div>
                  </div>

                  <!-- recycle badge -->
                  <div class="absolute left-20 top-16 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-900 text-2xl font-black text-white shadow-lg">
                    ♻
                  </div>

                  <!-- worker simple shape -->
                  <div class="absolute left-36 bottom-28">
                    <div class="h-10 w-10 rounded-full bg-[#0b1633]"></div>
                    <div class="ml-2 mt-1 h-24 w-16 rounded-[26px] bg-slate-800"></div>
                    <div class="absolute left-12 top-18 h-10 w-16 -rotate-12 rounded-xl bg-blue-900"></div>
                    <div class="absolute -left-7 top-32 h-14 w-7 -rotate-12 rounded-full bg-[#0b1633]"></div>
                    <div class="absolute left-10 top-32 h-14 w-7 rotate-12 rounded-full bg-[#0b1633]"></div>
                    <div class="absolute -left-10 top-25 h-7 w-10 -rotate-12 rounded-lg bg-slate-300"></div>
                  </div>

                  <!-- small dots -->
                  <div class="absolute left-44 top-24 flex gap-2">
                    <span class="h-3 w-3 rounded-full bg-blue-900"></span>
                    <span class="h-3 w-3 rounded-full bg-blue-700"></span>
                    <span class="h-3 w-3 rounded-full bg-slate-300"></span>
                  </div>
                </div>

                <div class="mt-8 grid grid-cols-3 gap-4">
                  <div class="rounded-2xl bg-slate-50 p-4 text-center">
                    <p class="text-xl font-black text-[#0b1633]">QR</p>
                    <p class="text-xs font-semibold text-slate-500">Tag Scan</p>
                  </div>

                  <div class="rounded-2xl bg-slate-50 p-4 text-center">
                    <p class="text-xl font-black text-[#0b1633]">GPS</p>
                    <p class="text-xs font-semibold text-slate-500">Pickup</p>
                  </div>

                  <div class="rounded-2xl bg-slate-50 p-4 text-center">
                    <p class="text-xl font-black text-[#0b1633]">Wallet</p>
                    <p class="text-xs font-semibold text-slate-500">Payment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- FORM SIDE -->
          <div class="flex items-center justify-center bg-white px-8 py-10">
            ${content}
          </div>
        </div>
      </section>
    </main>
  `
}
