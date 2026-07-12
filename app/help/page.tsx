"use client";

import { useState } from "react";
import { ClaySurface } from "@/components/clay/ClaySurface";
import { HelpSection } from "@/components/help/HelpSection";
import { FeedbackModal } from "@/components/FeedbackModal";

export default function HelpPage() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />

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
        <button
          onClick={() => setFeedbackOpen(true)}
          className="mt-4 px-4 py-2 bg-violet text-white rounded-lg text-sm font-medium hover:bg-violet/90 transition-colors"
        >
          📧 Send Feedback or Report Issue
        </button>
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
            title: "Add one or more items",
            body: "Type to search a Brand and Bag Size (no more scrolling through a long list), enter a quantity, and tap Add to Bill. Repeat for as many different brands and sizes as the customer is buying — they all end up on one bill, under one Bill Number.",
          },
          {
            icon: "🚫",
            title: "Can't oversell",
            body: "Each item you add is checked against current stock (produced minus sold, minus anything already in this bill) — if a customer wants more bags of a brand/size than you actually have, adding it is blocked with a message telling you exactly how many are left.",
          },
          {
            icon: "🗑️",
            title: "Change your mind",
            body: "Tap × next to any item in the bill to remove it before confirming — the Bill Subtotal updates instantly.",
          },
          {
            icon: "💳",
            title: "Full Payment vs Partial / Credit",
            body: "This applies to the whole bill, not per item. Choose Full Payment if the customer pays everything now (cash or digital). Choose Partial / Credit if they're paying only part now — this reveals fields for their name, phone number, optional CNIC, and how much they're paying today. Add the phone number so you can follow up on what's still owed. The remaining balance (\"Credit Amount Left\") is calculated for you.",
          },
          {
            icon: "✅",
            title: "Confirm Sale",
            body: "Tapping this creates one bill with a unique Bill Number (e.g. BILL-0001) covering every item you added, and adds it to the Recent Transactions list below. If it's a credit sale, all items on that bill share the same amount owed — recording a payment on any one of them settles the whole bill at once.",
          },
        ]}
      />

      <HelpSection
        eyebrow="Sidebar → Quick Bill & Ledger"
        title="Recent Transactions"
        accent="sky"
        items={[
          {
            icon: "🔎",
            title: "Search, Date, and Payment Status",
            body: "Search matches bill number, customer name, phone number, or CNIC — handy for finding a specific credit sale without scrolling. Combine it with the Date and Payment Status filters (e.g. only Credit Pending sales on a given day) to narrow things down fast. Works the same way on the Entries page.",
          },
          {
            icon: "🧾",
            title: "Tap a sale to see the full bill",
            body: "Tap anywhere on a sale (not on Record Payment or the × button) to open its complete detail — brand, size, quantity, pricing, payment mode, customer name and phone, and how much is still owed.",
          },
          {
            icon: "🟢",
            title: "\"Paid\" badge",
            body: "The customer paid in full — nothing outstanding.",
          },
          {
            icon: "🟠",
            title: "\"Credit Pending\" badge",
            body: "The customer still owes money. The list shows their name, how much was billed, and how much is still owed so you can follow up later.",
          },
          {
            icon: "✅",
            title: "Record Payment",
            body: "Tap Record Payment on a credit sale to log money the customer brings in. It defaults to the full amount still owed — change it if they're only paying part of it. Paying in full flips the badge to \"Paid\"; a partial amount reduces what's owed and the sale stays \"Credit Pending\" so you can record the rest later. This button only shows up on sales that still have credit outstanding.",
          },
          {
            icon: "↩️",
            title: "Return",
            body: "If a customer brings bags back, tap Return on that sale, type your name and the reason, and confirm. The bags go back into stock, the sale is marked \"Returned\" (shown with a strikethrough), and it's excluded from revenue and stock-sold figures. If the bill was still Credit Pending, the returned item's value comes straight off what's owed. Every return is kept in the Return Log on the Entries page.",
          },
          {
            icon: "👀",
            title: "Deleting needs Entries",
            body: "Made a sale with the wrong quantity or brand? Remove it from the Entries page instead, where deleting a sale requires typing your name and the reason.",
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
            body: "Log how much wheat you bought and at what rate per kg — the app multiplies these to track your raw material cost. Supplier Name and Vehicle Number Plate are required for every purchase, so there's always a record of who delivered the wheat and on what vehicle.",
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
            title: "A safe place to review entries",
            body: "Every Expense, Raw Wheat, Production, Daily Grinding entry, and sale you've logged lives here, grouped into five lists — separate from the input forms, so browsing your history can't accidentally add or change anything.",
          },
          {
            icon: "🔎",
            title: "Search each list",
            body: "Every list has its own Search and From / Till date-range filters — search matches whatever's relevant to that entry type (category, supplier name, vehicle number, brand, note, and more). Lists with more than one person logging entries also get an Entered By filter. Handy once you've got months or years of history and need to find one specific entry fast.",
          },
          {
            icon: "✍️",
            title: "Deleting an entry takes a signature",
            body: "Tap × on any entry — including a sale — and you'll be asked to type your name and the reason before it's removed. This is the only place a sale can be deleted; Quick Bill & Ledger's Recent Transactions is view-only.",
          },
          {
            icon: "↩️",
            title: "Return Log",
            body: "Every returned sale — what it was, who processed the return, and why — is kept in a permanent Return Log, separate from deletions since a return keeps the sale on record instead of erasing it.",
          },
          {
            icon: "📇",
            title: "Deletion Log",
            body: "Every confirmed deletion — what was removed, who removed it, and why — is kept in a permanent Deletion Log at the bottom of this page.",
          },
          {
            icon: "↩️",
            title: "Undo",
            body: "After confirming a deletion, a bar appears at the bottom of the screen for a few seconds with an Undo button — tap it to bring the entry straight back if it was a mistake.",
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
          {
            icon: "🔎",
            title: "Tap a card to see the sales behind it",
            body: "Every figure is clickable — tap it to open the full list of sales (bill number, brand & size, quantity, amount, paid/credit status) that made up that number. Inside that list, use Filter by Brand, Filter by Bag Size, and Filter by Status to narrow it down further — the Bags Sold and Revenue totals update to match.",
          },
          {
            icon: "🗓️",
            title: "Custom Range",
            body: "Pick any From / Till date to see bags sold and revenue for a specific stretch of time — not just the four fixed periods — and tap the result to see those sales too.",
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
            body: "Total Cost is Raw Material + every Expense category combined. Net Profit is Revenue minus Cost — shown in green if positive, red if you're currently running at a loss.",
          },
          {
            icon: "🗓️",
            title: "All Time / Today / This Week / This Month / This Year / Custom",
            body: "Pick a timeline to see these figures for just that period instead of all-time — pick Custom and set a From / Till date for any specific stretch.",
          },
          {
            icon: "📐",
            title: "Cost composition bar",
            body: "A simple split bar showing how much of your Total Cost is Raw Material vs Overhead (Expense categories) — a quick visual on where the money is going, for the selected timeline.",
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
            body: "Three cards: bags Produced, kg Grinded (from your Daily Grinding entry), and total Stock Remaining across every brand — the physical picture of the mill at a glance, without digging into Mill Operations.",
          },
          {
            icon: "📅",
            title: "Pick any date",
            body: "Defaults to today. Pick an earlier date to see what was produced and grinded that day, and what Stock Remaining looked like as of that date.",
          },
          {
            icon: "🔎",
            title: "Tap a card to see the detail behind it",
            body: "Produced opens the list of that day's production entries; Grinded opens that day's grinding log entries; Stock Remaining opens the full produced-minus-sold breakdown per brand & size.",
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
            body: "Rows are your brands, columns are your bag sizes — each cell is how many bags of that brand/size were produced. Total Bags, combined Weight (kg), and % share of total production for each brand are on the right.",
          },
          {
            icon: "🔢",
            title: "Total Bags Produced",
            body: "One number below the table — the grand total across every brand. No per-column breakdown clutter, just the figure that matters.",
          },
          {
            icon: "🗓️",
            title: "All Time / Today / This Week / This Month / This Year / Custom",
            body: "Pick a timeline to see the mix for just that period instead of all-time. This same filter also appears on the Production Mix shown inside the Cost & Overhead Ledger's Production section — the two are independent, so you can look at different periods in each place.",
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
            icon: "📅",
            title: "As of Date",
            body: "The default mode. The Date field controls everything below: the two cumulative cards show totals up through that date, and the highlighted card shows what happened on that specific day. Defaults to today — pick an earlier date (e.g. 5 July) to see what things looked like then.",
          },
          {
            icon: "🗓️",
            title: "Date Range",
            body: "Switch to this mode to see totals for just a stretch of time (From / Till) instead of a running cumulative total — handy for \"how much wheat did we receive and grind in June\" without it being buried in the all-time figure. \"Stock / Balance\" becomes \"Net Change\" in this mode, since it's the change over that period rather than a running balance.",
          },
          {
            icon: "⚙️",
            title: "Wheat Received → Grinded → Balance",
            body: "Grinded is the real figure logged for the selected date or range (not an estimate). Balance/Net Change is Received minus Grinded.",
          },
          {
            icon: "🧈",
            title: "Atta Produced → Issued → Balance",
            body: "Produced comes from what's logged in the ledger's Production section; Issued comes from bags sold in Quick Bill; Balance/Net Change is what's left over — scoped to whichever mode (As of Date or Date Range) you've picked.",
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
            body: "Choose a date and see that day's stock movement per brand & size (e.g. \"Premium Atta · 20kg\" and \"Premium Atta · 40kg\" as separate rows): Opening Stock (what was on hand at the start of that day), Production Today (bags made that day) with its Atta Produced (kg) equivalent, Sales (bags sold that day), and Closing Stock (what's left at the end of the day).",
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
            body: "Type to search for a brand (no scrolling a long list), then either a single date or a date range (From / Till), and tap Search. You'll see total bags sold, total revenue, and how many sales matched — useful for answering \"how much did we sell last week\" without scrolling through Recent Transactions.",
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
            icon: "📅",
            title: "Pick a date on Mill Operations",
            body: "On Mill Operations, Check Stock has its own Date field — pick a past date (e.g. 5 August) to see what stock looked like as of that day. On the Quick Bill page it always shows the current, real-time stock so you know what's sellable right now.",
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
            body: "Type a brand name (e.g. \"Chakki Atta\") and your name in Entered By, then tap Add Brand. It immediately appears as an option in Quick Bill and in the Production Entry section.",
          },
          {
            icon: "⚖️",
            title: "Add Bag Sizes",
            body: "For each brand, enter a weight (in kg), the retail price, and your name, then tap Add Size — the size label (e.g. \"20kg\") is generated automatically from the weight.",
          },
          {
            icon: "💾",
            title: "Editing a price or weight needs Save Changes",
            body: "Nothing here auto-saves as you type. Change a weight or price, type your name, and tap Save Changes — it stays disabled until something's actually different from what's saved and your name is filled in.",
          },
          {
            icon: "✍️",
            title: "Deleting a brand or size takes a signature",
            body: "Tap Delete brand or Remove on a size and you'll be asked to type your name and the reason before it's removed — same accountability pattern as the Entries page.",
          },
          {
            icon: "📇",
            title: "Change Log",
            body: "Every add, edit, and removal on this page — what changed, who did it, and when — is kept in a permanent Change Log at the bottom of the page. Once this becomes a cloud-based system, the typed name will be replaced by a Google account stamp.",
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
