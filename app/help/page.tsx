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
          A quick guide to every screen and button in the Flour Mill Management System. Come
          back here anytime from the <span className="font-extrabold text-violet">Help</span>{" "}
          tab.
        </p>
      </ClaySurface>

      <HelpSection
        eyebrow="Sales Page"
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
        eyebrow="Sales Page"
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
        eyebrow="Shared Between Both Pages"
        title="Production Cost & Overhead Ledger"
        accent="amber"
        items={[
          {
            icon: "🌾",
            title: "Raw Wheat Intake",
            body: "Log how much wheat you bought and at what rate per kg — the app multiplies these to track your raw material cost.",
          },
          {
            icon: "🧾",
            title: "Overhead Categories",
            body: "Log Logistics/Transport, Electricity/Utilities, Labor, or Miscellaneous expenses as they come up. These feed directly into the Profit Projection on the Dashboard.",
          },
          {
            icon: "🔗",
            title: "One shared ledger",
            body: "This section appears on both the Sales and Dashboard pages, but it's the exact same data — add an expense on one page and it instantly shows on the other.",
          },
        ]}
      />

      <HelpSection
        eyebrow="Dashboard"
        title="Product & Packaging"
        accent="violet"
        items={[
          {
            icon: "🏷️",
            title: "Add a Brand",
            body: "Give your flour brand a name (e.g. \"Chakki Atta\"). It'll immediately appear as an option on the Sales page.",
          },
          {
            icon: "⚖️",
            title: "Add Bag Sizes",
            body: "For each brand, add the bag sizes you sell (20kg, 40kg, or any custom weight) along with the retail price. These are what show up in the Sales page's Bag Size dropdown.",
          },
        ]}
      />

      <HelpSection
        eyebrow="Dashboard"
        title="Profit Projection"
        accent="emerald"
        items={[
          {
            icon: "📊",
            title: "Cost / Bag",
            body: "Your total costs (raw wheat + all overhead entries) divided by the total bags you've sold.",
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
        ]}
      />

      <HelpSection
        eyebrow="Dashboard"
        title="Mill Operations"
        accent="sky"
        items={[
          {
            icon: "🚚",
            title: "This is internal only",
            body: "These stats track your own wheat and atta handling for your own records — separate from any government subsidy reporting.",
          },
          {
            icon: "⚙️",
            title: "Wheat Received → Grinded → Balance",
            body: "Shows cumulative totals: how much wheat came in, how much has been grinded, and what's left in stock.",
          },
          {
            icon: "🧈",
            title: "Atta Produced → Issued → Balance",
            body: "Same idea, for the flour you've produced and given out, with the remaining stock balance.",
          },
          {
            icon: "📅",
            title: "Log Today's Activity",
            body: "Fill in today's wheat received, wheat grinded, atta produced, and atta issued, then tap Log Entry. The cumulative and \"Today\" cards update automatically.",
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
