import { ClaySurface } from "@/components/clay/ClaySurface";
import { HelpSection } from "@/components/help/HelpSection";

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-6">
      <ClaySurface className="flex flex-col gap-3 text-center items-center">
        <span className="text-4xl">📖</span>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-ink">
          How This App Works
        </h1>
        <p className="text-sm sm:text-base text-muted max-w-xl">
          A quick guide to every section in the Flour Mill Management System. Use the menu on
          the left (or the ☰ button on mobile) to jump between sections — come back to{" "}
          <span className="font-extrabold text-violet">Help</span> anytime from there.
        </p>
      </ClaySurface>

      <HelpSection
        eyebrow="Every Form"
        title="Date, Time & Who Entered It"
        accent="pink"
        items={[
          {
            icon: "🕒",
            title: "Backdate anything",
            body: "Every form — Quick Bill, Expense, Raw Wheat, Production — has a Date & Time field. It defaults to right now, but you can change it to log something for an earlier day (or even backfill a whole month of history).",
          },
          {
            icon: "✍️",
            title: "Entered By",
            body: "Each form also has an Entered By field. Type your name once and this device remembers it for next time — no need to retype it on every entry, but you can change it if someone else is using the same device.",
          },
          {
            icon: "👀",
            title: "Where you'll see it",
            body: "The date, time, and who entered it are shown on every transaction in Recent Transactions and every entry on the Entries page.",
          },
        ]}
      />

      <HelpSection
        eyebrow="Sidebar → Quick Bill & Ledger"
        title="Making a Sale"
        accent="violet"
        items={[
          {
            icon: "🧾",
            title: "Quick Bill",
            body: "Pick a Brand, then a Bag Size, then how many bags. The Subtotal updates automatically — no manual math needed.",
          },
          {
            icon: "💳",
            title: "Full Payment vs Partial / Credit",
            body: "Choose Full Payment if the customer pays everything now (cash or digital). Choose Partial / Credit if they're paying only part now — this reveals fields for their name, optional CNIC, and how much they're paying today. The remaining balance (\"Credit Amount Left\") is calculated for you.",
          },
          {
            icon: "✅",
            title: "Confirm Sale",
            body: "Tapping this creates a bill with a unique Bill Number (e.g. BILL-0001) and adds it to the Recent Transactions list below.",
          },
        ]}
      />

      <HelpSection
        eyebrow="Sidebar → Quick Bill & Ledger"
        title="Recent Transactions"
        accent="sky"
        items={[
          {
            icon: "🟢",
            title: "\"Paid\" badge",
            body: "The customer paid in full — nothing outstanding.",
          },
          {
            icon: "🟠",
            title: "\"Credit Pending\" badge",
            body: "The customer still owes money. The list shows their name and how much was billed so you can follow up later.",
          },
          {
            icon: "↩️",
            title: "Fixing a mistake",
            body: "Made a sale with the wrong quantity or brand? Tap × on that transaction to remove it — an Undo button appears at the bottom of the screen for a few seconds in case you didn't mean to.",
          },
        ]}
      />

      <HelpSection
        eyebrow="Sidebar → Cost & Overhead Ledger"
        title="Production Cost & Overhead Ledger"
        accent="amber"
        items={[
          {
            icon: "🗂️",
            title: "Find it in the sidebar",
            body: "Open \"Cost & Overhead Ledger\" from the left menu (under Dashboard). It has four sections, one after another on the same page.",
          },
          {
            icon: "1️⃣",
            title: "Section 1 — Expense",
            body: "All nine categories are listed together — Electricity, Transport, Bardana (Bags), Unloading, Packery, Salary, Telephone, Mill Khata, Langar Khata. Fill in whichever apply (e.g. at month start or month end) and tap \"Save Expenses\" once — you don't have to add them one at a time.",
          },
          {
            icon: "2️⃣",
            title: "Section 2 — Raw Wheat",
            body: "Log how much wheat you bought and at what rate per kg — the app multiplies these to track your raw material cost.",
          },
          {
            icon: "3️⃣",
            title: "Section 3 — Production",
            body: "Every brand and bag size you've configured is listed as its own row. Enter bags produced for each (e.g. 400 for Brand A 20kg, 100 for Brand B 40kg) and tap \"Save Production\" once — all of them are compared against each other automatically in the Production Mix below.",
          },
          {
            icon: "4️⃣",
            title: "Section 4 — Daily Grinding",
            body: "Log the actual kg of wheat grinded that day. Do this once, at the end of each working day, before you leave — it's what powers the Wheat Grinded figures on Mill Operations and the Daily Stock page. If you forget, a reminder banner shows up until it's logged.",
          },
          {
            icon: "📜",
            title: "Where your entries go",
            body: "These four sections are for entering new data only — they don't list what you've already logged, so there's nothing to accidentally delete while you're typing. To review or remove past entries, open the \"Entries\" page from the sidebar.",
          },
        ]}
      />

      <HelpSection
        eyebrow="Sidebar → Entries"
        title="Entries"
        accent="pink"
        items={[
          {
            icon: "📜",
            title: "A safe place to review and remove entries",
            body: "Every Expense, Raw Wheat, Production, and Daily Grinding entry you've logged lives here, grouped into four lists — separate from the input forms, so browsing your history can't accidentally add or change anything.",
          },
          {
            icon: "↩️",
            title: "Undo",
            body: "Tap × to remove an entry and a bar appears at the bottom of the screen for a few seconds with an Undo button — tap it to bring the entry straight back if it was a mistake.",
          },
        ]}
      />

      <HelpSection
        eyebrow="The Sidebar"
        title="Finding Your Way Around"
        accent="emerald"
        items={[
          {
            icon: "🗂️",
            title: "One section at a time",
            body: "The left menu lists every section, grouped under Sales and Dashboard. Tap a section to open it — only that section shows on screen, keeping each view simple and uncluttered.",
          },
          {
            icon: "📱",
            title: "On a phone",
            body: "Tap the ☰ icon at the top to slide out the menu, pick a section, and it closes automatically.",
          },
        ]}
      />

      <HelpSection
        eyebrow="Sidebar → Profit Projection"
        title="Sales Performance"
        accent="violet"
        items={[
          {
            icon: "📊",
            title: "Today / This Week / This Month / This Year",
            body: "Four scannable cards, each showing bags sold and revenue for that period. \"This Week\" is the trailing 7 days (including today); \"This Month\" and \"This Year\" are calendar-to-date.",
          },
        ]}
      />

      <HelpSection
        eyebrow="Sidebar → Profit Projection"
        title="Financial Health"
        accent="emerald"
        items={[
          {
            icon: "💰",
            title: "Total Cost, Total Revenue, Net Profit",
            body: "All-time totals, to date. Total Cost is Raw Material + every Expense category combined. Net Profit is Revenue minus Cost — shown in green if positive, red if you're currently running at a loss.",
          },
          {
            icon: "📐",
            title: "Cost composition bar",
            body: "A simple split bar showing how much of your Total Cost is Raw Material vs Overhead (Expense categories) — a quick visual on where the money is going.",
          },
        ]}
      />

      <HelpSection
        eyebrow="Sidebar → Profit Projection"
        title="Operational Snapshot"
        accent="sky"
        items={[
          {
            icon: "⚡",
            title: "Right now, mill-wide",
            body: "Three cards: bags Produced Today, kg Grinded Today (from your Daily Grinding entry), and total Stock Remaining across every brand — the physical picture of the mill at a glance, without digging into Mill Operations.",
          },
        ]}
      />

      <HelpSection
        eyebrow="Sidebar → Profit Projection"
        title="Production Mix"
        accent="pink"
        items={[
          {
            icon: "🥧",
            title: "One table, everything at a glance",
            body: "Rows are your brands, columns are your bag sizes — each cell is how many bags of that brand/size were produced. Total Bags, %, and combined Weight (kg) for each brand are on the right.",
          },
          {
            icon: "🔢",
            title: "Total Bags Produced",
            body: "One number below the table — the grand total across every brand. No per-column breakdown clutter, just the figure that matters.",
          },
        ]}
      />

      <HelpSection
        eyebrow="Sidebar → Mill Operations"
        title="Mill Operations"
        accent="sky"
        items={[
          {
            icon: "🤖",
            title: "Nothing to log on this page itself",
            body: "Wheat Received, Atta Produced, and Atta Issued are calculated automatically from the ledger's Raw Wheat and Production sections and your Quick Bill sales. Wheat Grinded comes from the Daily Grinding entry you log in the ledger (Section 4) — this page just displays it.",
          },
          {
            icon: "🚚",
            title: "This is internal only",
            body: "These stats track your own wheat and atta handling for your own records — separate from any government subsidy reporting.",
          },
          {
            icon: "⚙️",
            title: "Wheat Received → Grinded → Balance",
            body: "Grinded is the real figure you logged that day (not an estimate). Balance is Received minus Grinded — what's left of your raw wheat stock.",
          },
          {
            icon: "🧈",
            title: "Atta Produced → Issued → Balance",
            body: "Produced comes from what you log in the ledger's Production section; Issued comes from bags sold in Quick Bill; Balance is the remaining stock.",
          },
        ]}
      />

      <HelpSection
        eyebrow="Sidebar → Mill Operations"
        title="Daily Stock"
        accent="violet"
        items={[
          {
            icon: "📅",
            title: "Pick any day",
            body: "Choose a date and see that day's stock movement per brand: Opening Stock (what was on hand at the start of that day), Production Today (bags made that day), Sales (bags sold that day), and Closing Stock (what's left at the end of the day).",
          },
          {
            icon: "🌾",
            title: "Wheat Grinded This Day",
            body: "Shown separately above the table, not as a per-brand column — wheat isn't tied to a specific brand until it's produced and bagged, so grinding is a mill-wide figure pulled from that day's Daily Grinding entry.",
          },
        ]}
      />

      <HelpSection
        eyebrow="Sidebar → Mill Operations"
        title="Sales Search"
        accent="emerald"
        items={[
          {
            icon: "🔍",
            title: "How much did Brand A sell?",
            body: "Pick a brand, then either a single date or a date range (From / Till), and tap Search. You'll see total bags sold, total revenue, and how many sales matched — useful for answering \"how much did we sell last week\" without scrolling through Recent Transactions.",
          },
        ]}
      />

      <HelpSection
        eyebrow="Quick Bill & Ledger + Mill Operations"
        title="Check Stock"
        accent="sky"
        items={[
          {
            icon: "📦",
            title: "Bags remaining, per brand & size",
            body: "A \"Check Stock\" list shows, for every brand/size, how many bags were Produced, how many were Sold, and how many are left — in both bags and kg. It appears on the Quick Bill page (so you can check before confirming a sale) and on Mill Operations.",
          },
          {
            icon: "🟢🟠🔴",
            title: "Color meaning",
            body: "Green means healthy stock, amber means 10 bags or fewer left, red means none left.",
          },
        ]}
      />

      <HelpSection
        eyebrow="Sidebar → Product & Packaging"
        title="Product & Packaging"
        accent="violet"
        items={[
          {
            icon: "🏷️",
            title: "Add a Brand",
            body: "Give your flour brand a name (e.g. \"Chakki Atta\"). It'll immediately appear as an option in Quick Bill and in the Production Entry section.",
          },
          {
            icon: "⚖️",
            title: "Add Bag Sizes",
            body: "For each brand, enter a weight (in kg) and the retail price — the size label (e.g. \"20kg\") is generated automatically from the weight. These are what show up in the Quick Bill page's Bag Size dropdown.",
          },
        ]}
      />

      <ClaySurface className="text-center">
        <p className="text-sm text-muted">
          Still unsure about something? All your data is saved automatically on this device —
          nothing is lost if you close the browser or refresh the page.
        </p>
      </ClaySurface>
    </div>
  );
}
