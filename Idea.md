Here is a highly professional, production-optimized prompt rewritten for Claude. It translates your practical requirements into structured engineering specifications while perfectly embedding your custom design system constraints so that Claude can generate clean, client-ready code immediately.

---

```markdown
# Role & Objective
You are an elite Lead Full-Stack Engineer and UX Architect. Your task is to design and implement a production-grade, 2-page Flour Mill Management System tailored for a non-technical client. The interface must look incredibly polished, modern, fast, and utilize the exact structural constraints and design tokens specified in the `<design-system>` tag below.

# Technical Requirements & Architecture

## Page 1: The Sales Interface (Point of Sale & Ledger)
This page is optimized for fast, frictionless retail and credit sales tracking.
- **Quick Bill Generation:** Dropdown selector for Brand, Bag Size (e.g., 20kg, 40kg), Quantity, and automated subtotal calculation.
- **Payment Split Engine:** A dual-mode transaction handler:
  - *Full Payment:* Standard cash/digital confirmation.
  - *Partial/Credit Payment:* Must activate a conditional form capturing: Customer Name, CNIC Number (Optional), unique Bill Number, and Credit Amount Left (Outstanding Ledger balance).
- **Recent Transactions Ledger:** A scannable list showing recent sales, highlighting clear color-coded statuses ("Paid" vs "Credit Pending").
- **Production Cost & Overhead Ledger:**
  - Dynamic inputs for incoming raw material costs (e.g., raw wheat volume and rate).
  - Overhead categorization inputs: Logistics/Transport, Electricity/Utilities, Labor costs, and Miscellaneous expenses.
  
## Page 2: The Owner Dashboard (Analytics & Inventory Configurator)
This is a secure, high-level administrative interface accessible only by the owner to manage the entire financial and physical operation.
- **Product & Packaging Configurator:** 
  - Dynamic forms to add new Flour Brands.
  - Dynamic packaging size definitions (e.g., custom weights beyond 20kg/40kg) paired with instant retail base pricing updates.
- **Production Cost & Overhead Ledger:**
  - Dynamic inputs for incoming raw material costs (e.g., raw wheat volume and rate).
  - Overhead categorization inputs: Logistics/Transport, Electricity/Utilities, Labor costs, and Miscellaneous expenses.
- **Profit Projection & Analytics Engine:**
  - Real-time financial modeling cards that track metrics based on sales data and dynamic operational inputs.
  - Automatically calculate and display: Total Cost per Bag vs. Projected Profit per Bag (e.g., tracking target margins like 600 Rs/bag).
  - High-level charts or visual indicators summarizing net operational runway and overall profit health.

---

<design-system>
# High-Fidelity Claymorphism Design System

## Design Philosophy
- **Core Concept: Digital Clay:** Tangible, physical depth featuring matte-finish vinyl or soft silicone finishes. 
- **Lighting & Shadows:** Complex multi-layer lighting using 4-layer shadow stacks. Elements must look convex (bulging out) when interactive, and concave (pressed in) for inputs.
- **The Sensory Vibe:** Playful yet premium. Zero sharp corners (`rounded-[20px]` absolute minimum, up to `rounded-[60px]` for large containers). 
- **The "Clay" Physics Engine:** Micro-interactions must feature responsive hover lifts (`hover:-translate-y-1` to `-translate-y-2`) and dramatic active click squishes (`active:scale-[0.92] active:shadow-clayPressed`).

## Design Token System
- **Canvas Background:** `#F4F1FA` (Very pale, cool lavender-white).
- **Text (Primary):** `#332F3A` (Soft Charcoal).
- **Muted (Secondary):** `#635F69` (Dark Lavender-Gray).
- **Accents:** Primary Violet (`#7C3AED`), Secondary Hot Pink (`#DB2777`), Sky Blue (`#0EA5E9`), Success Emerald (`#10B981`), Warning Amber (`#F59E0B`).
- **Typography:** Headings & Numbers = **Nunito** (font-black/extrabold, apply inline style `fontFamily: "Nunito"`). Body = **DM Sans** (font-medium).

## CSS Shadow Stacks
1. **Deep Clay (Surface/Containers):**
   `box-shadow: 30px 30px 60px #cdc6d9, -30px -30px 60px #ffffff, inset 10px 10px 20px rgba(139, 92, 246, 0.05), inset -10px -10px 20px rgba(255, 255, 255, 0.8);`
2. **Clay Card (Floating elements):**
   `box-shadow: 16px 16px 32px rgba(160, 150, 180, 0.2), -10px -10px 24px rgba(255, 255, 255, 0.9), inset 6px 6px 12px rgba(139, 92, 246, 0.03), inset -6px -6px 12px rgba(255, 255, 255, 1);`
3. **Clay Button (High Convexity):**
   `box-shadow: 12px 12px 24px rgba(139, 92, 246, 0.3), -8px -8px 16px rgba(255, 255, 255, 0.4), inset 4px 4px 8px rgba(255, 255, 255, 0.4), inset -4px -4px 8px rgba(0, 0, 0, 0.1);`
4. **Clay Pressed (Recessed Inputs/Active states):**
   `box-shadow: inset 10px 10px 20px #d9d4e3, inset -10px -10px 20px #ffffff;`
</design-system>

---

# Execution Deliverables
1. **Tech Stack Choice:** Provide the code assuming React/Next.js combined with standard Tailwind CSS utility classes.
2. **State Management:** Build inline state simulations using `useState` hooks so the forms, metrics calculators, and credit balance conditions operate smoothly in real time for client demonstrations.
3. **Code Quality:** Write clean, modular, self-contained functional components. Avoid generic templates or boring boilerplates—maximize the unique personality, 3D float mechanics, and extreme rounded shapes of the High-Fidelity Claymorphism system to make this software stand out immediately.

There are 4 photos 1.jpeg 2.jpeg 3.jpeg 4.jpeg Which are screens shots from a government website which has the intake for (wheat/Chokur) Grinding etc etc look into those images as well```