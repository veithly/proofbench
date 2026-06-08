{
  "type": "UI mockup",
  "goal": "Prove mobile receipt review: a QR visitor can inspect verdict, payout, and proof status without dense tables.",
  "source": {
    "prd_section": "§ 11",
    "user_case": "HERO PATH",
    "route": "/receipt/[receiptId]"
  },
  "layout": {
    "viewport": "390x844",
    "main_regions": ["receipt header", "verdict", "payout state", "receipt hash", "proof status"]
  },
  "style": {
    "visual_lane": "data-newsroom",
    "primary_ui_library": "shadcn/ui proof-console shell",
    "palette": ["#f7fbfa", "#123d37", "#ffffff", "#c88913"],
    "hero_composition": "mobile-receipt"
  },
  "constraints": {
    "must_keep": ["large verdict", "payout/no-payout", "receipt hash", "ready calldata state"],
    "avoid": ["tiny table text", "horizontal overflow", "fake tx hash"]
  }
}
