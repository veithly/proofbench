{
  "type": "UI mockup",
  "goal": "Prove the main workbench: agents, quote fixture, evaluator rules, payout, and receipt rail are visible at once.",
  "source": {
    "prd_section": "§ 10",
    "user_case": "HERO PATH",
    "route": "/"
  },
  "layout": {
    "viewport": "1920x1200",
    "main_regions": ["agent identity cards", "quote guard fixture", "score breakdown", "receipt rail"]
  },
  "style": {
    "visual_lane": "data-newsroom",
    "primary_ui_library": "shadcn/ui proof-console shell",
    "palette": ["#ffffff", "#123d37", "#eaf7f3", "#c88913"],
    "hero_composition": "three-column receipt bench"
  },
  "constraints": {
    "must_keep": ["DeltaScout PASS", "YieldChaser FAIL", "receipt hash", "ready calldata"],
    "avoid": ["chart-only dashboard", "fake feed", "hidden evaluator"]
  }
}
