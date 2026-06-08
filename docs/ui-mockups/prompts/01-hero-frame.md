{
  "type": "UI mockup",
  "goal": "Prove the 0-10s hook: a judge sees ProofBench, the agent task, and the first no-wallet action.",
  "source": {
    "prd_section": "§ 9 / § 10 / § 11",
    "user_case": "HERO PATH",
    "route": "/"
  },
  "layout": {
    "viewport": "1920x1200",
    "main_regions": ["agent cards", "quote guard task", "evaluator mode", "receipt preview"]
  },
  "style": {
    "visual_lane": "data-newsroom",
    "primary_ui_library": "shadcn/ui proof-console shell",
    "palette": ["#f7fbfa", "#123d37", "#ffffff", "#c88913"],
    "hero_composition": "receipt-bench"
  },
  "constraints": {
    "must_keep": ["hero copy", "Run agent task CTA", "payout/no-payout receipt preview"],
    "avoid": ["generic purple AI gradient", "wallet wall", "agent marketplace grid"]
  }
}
