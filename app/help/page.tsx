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
            body: "Open \"Cost & Overhead Ledger\" from the left menu (under Dashboard). It has three sections, one after another on the same page.",
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
            icon: "📜",
            title: "Where your entries go",
            body: "These three sections are for entering new data only — they don't list what you've already logged, so there's nothing to accidentally delete while you're typing. To review or remove past entries, open the \"Entries\" page from the sidebar.",
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
            body: "Every Expense, Raw Wheat, and Production entry you've logged lives here, grouped into three lists — separate from the input forms, so browsing your history can't accidentally add or change anything.",
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
        title="Profit Projection"
        accent="emerald"
        items={[
          {
            icon: "📊",
            title: "Cost / Bag",
            body: "Your total costs (raw wheat + all expenses) divided by the total bags you've actually produced (logged in the ledger's Production section).",
          },
          {
            icon: "💰",
            title: "Profit / Bag",
            body: "Your average selling price per bag minus the Cost / Bag. This is compared against a Rs 600 target margin — the label tells you if you're On Target, Near Target, or Below Target.",
          },
          {
            icon: "🛣️",
            title: "Operational Runway",
            body: "An estimate of how many days your current cash on hand can cover your average daily overhead costs — a quick health check on cash flow.",
          },
          {
            icon: "🥧",
            title: "Production Mix",
            body: "Shows what percentage of your total bags produced came from each brand (e.g. 40% Brand A, 20% Brand B), plus the breakdown by size within that brand (e.g. \"20kg: 200 · 40kg: 100\") and the combined weight in kg for that brand. A grand total (bags + kg) is shown at the bottom.",
          },
          {
            icon: "📈",
            title: "Cost vs Revenue Trend",
            body: "A bar chart comparing your total cost and total revenue for each of the last 6 months. Tap any month to see its exact numbers, or open \"View as table\" for the full list.",
          },
          {
            icon: "💹",
            title: "Avg Selling Rate / Bag",
            body: "A line showing how your average selling price per bag has moved month to month — useful for spotting a pricing trend.",
          },
          {
            icon: "📆",
            title: "Month-over-Month",
            body: "Compares this month to last month on Total Cost, Total Revenue, Profit, and Avg Rate/Bag, with a ▲/▼ and % change for each — green means that change was good for the business, red means it wasn't.",
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
            title: "Fully automatic — nothing to log here",
            body: "There's no manual entry on this page. Every number is calculated from data you've already entered elsewhere: Wheat Received comes from the Raw Wheat section of the ledger, Atta Produced comes from the Production section, and Atta Issued comes from your sales in Quick Bill.",
          },
          {
            icon: "🚚",
            title: "This is internal only",
            body: "These stats track your own wheat and atta handling for your own records — separate from any government subsidy reporting.",
          },
          {
            icon: "⚙️",
            title: "Wheat Received → Grinded → Balance",
            body: "Wheat Grinded is currently assumed equal to Atta Produced (a simple 1:1 estimate — extraction rate/wastage isn't tracked separately yet). Balance is what's left in stock.",
          },
          {
            icon: "🧈",
            title: "Atta Produced → Issued → Balance",
            body: "Produced comes from what you log in the ledger's Production section; Issued comes from bags sold in Quick Bill; Balance is the remaining stock.",
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
            body: "For each brand, add the bag sizes you sell (20kg, 40kg, or any custom weight) along with the retail price. These are what show up in the Quick Bill page's Bag Size dropdown.",
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
