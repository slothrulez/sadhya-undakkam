Create an interactive Figma Make website called "SADHYA BATTLE" 
for the Onam Makeathon.

═══════════════════════════════════════════════════════════════

PROJECT OVERVIEW:

This is a chaotic, playful interactive game where users build their own 
Kerala Onam feast (Sadhya) by drawing custom portions directly onto a 
banana leaf. Each drawn portion represents a dish and contributes to the 
overall Sadhya's stats and appearance.

Flow:
1. User selects a dish from a sidebar menu
2. User freehand-draws on the banana leaf (circle, squiggle, any shape)
3. The drawn area fills with the selected dish's color/pattern
4. The size of the drawn area determines the PORTION SIZE
5. Larger portions = greater stat contributions
6. Maveli reacts to each addition
7. User finalizes and sees a score based on their composition

The project has TWO MODES:
- NORMAL MODE: Vegetarian dishes only
- KANNUR MODE: Non-veg dishes (meme unlockable mode)

═══════════════════════════════════════════════════════════════

PAGE 1 — HOME SCREEN

Layout:
- Transparent background (video loops behind; user provides video file)
- Hero heading: "BUILD YOUR OWN SADHYA"
- Subtitle: "How chaotic is your Onam feast?"
- Large centered "START" button
- Mode toggle (right of START button): NORMAL MODE ⟷ KANNUR MODE
- Visual feedback on mode switch:
  - Background video changes
  - Background music changes (different loop for each mode)
  - Subtle color scheme shift

Interactions:
- Toggle updates mode state (persists through builder → result)
- START button has hover effect
- Background music loops infinitely
- START button → links to Sadhya Builder (appropriate mode)

Audio:
- Background music (Normal Mode) — looping
- Background music (Kannur Mode) — looping
- Both should be cheerful/celebratory

═══════════════════════════════════════════════════════════════

PAGE 2 — SADHYA BUILDER (2 versions: Normal Mode & Kannur Mode)

LAYOUT:

Left Side (60%):
- Large banana leaf canvas (where user draws)
- Background pattern (subtle, Kerala-inspired)
- Faint grid or banana leaf texture

Right Sidebar (40%):
- DISH SELECTOR (top section):
  - List of available dishes with icons/colors
  - Dish name + brief stat preview
  - User clicks to "select" a dish
  - Selected dish is highlighted
  
- STAT DISPLAY (middle section):
  - Real-time stat bars (update as user draws):
    * SADHYA POWER (0–100)
    * SPICE (0–100)
    * CRUNCH (0–100)
    * CHAOS (0–100)
    * SWEETNESS (0–100)
  - Color-coded bars
  
- PORTION INDICATOR (below stats):
  - Shows current selected dish
  - Shows: "Draw on leaf to add [DISH NAME]"
  - Size guide: "Larger drawings = bigger portions"

Bottom:
- Small Maveli character (observing, reacts to dish additions)
- "FINALIZE MY SADHYA" button (triggers result sequence)
- "CLEAR LEAF" button (undo/reset, optional)

DRAWING MECHANICS:

1. User clicks a dish name from sidebar
2. Drawing mode activates on banana leaf canvas
3. User draws freehand on leaf (mouse/touch input)
   - Can draw circles, squiggles, abstract shapes
   - Drawn strokes create a closed or semi-closed area
4. Once user lifts (completes stroke), drawn area fills with:
   - Dish color/pattern
   - Dish texture (subtle visual representation)
5. Portion size = drawn area size in pixels
   - Smaller drawing = 20% portion size = small stat contribution
   - Medium drawing = 50% portion size = medium stat contribution
   - Large drawing = 100% portion size = max stat contribution
6. Stat calculation:
   - Each dish has base stats (e.g., Rasam: +30 Spice, +10 Crunch)
   - Portion multiplier is applied (size-based)
   - Example: Rasam (small) = +15 Spice; Rasam (large) = +30 Spice
   - Overall SADHYA POWER = sum of all dish contributions
7. Maveli reacts:
   - Audio plays (2–3 generic reactions, cycling)
   - Brief animation (thumbs up, nod, etc.)
   - Reaction differs slightly by mode

DISHES — NORMAL MODE (Vegetarian):

| Dish | Color | Base Stats | Personality |
|------|-------|-----------|-------------|
| Choru (Rice) | Light Brown | +20 Power, +10 Crunch | The foundation |
| Parippu (Lentil) | Yellow | +15 Power, +20 Sweetness | Gentle opener |
| Sambar | Orange-Red | +25 Power, +15 Spice, +15 Crunch | Reliable all-rounder |
| Rasam | Red | +20 Power, +30 Spice, +5 Crunch | Glass cannon |
| Avial | Green | +30 Power, +15 Crunch, +10 Chaos | Tank/heavyweight |
| Olan | Light Green | +15 Power, +20 Sweetness, +15 Healing | Support/healer |
| Kaalan | Dark Brown | +25 Power, +20 Spice, +15 Defense | Defensive tank |
| Erissery | Orange | +22 Power, +18 Spice, +12 Crunch | Bruiser |
| Puli Inji | Dark Red | +10 Power, +40 Spice, +25 Chaos | Tiny assassin |
| Pappadam | Tan | +5 Power, +10 Crunch, +30 Defense | Legendary shield |
| Payasam | Gold | +35 Power, +45 Sweetness, +50 Chaos | Ultimate/finale |

DISHES — KANNUR MODE (Non-Vegetarian):

| Dish | Color | Base Stats | Personality |
|------|-------|-----------|-------------|
| Meen Curry (Fish) | Orange | +28 Power, +20 Spice, +15 Crunch | Swift attacker |
| Kozhi Curry (Chicken) | Brown-Red | +30 Power, +25 Spice, +20 Crunch | Balanced fighter |
| Mutta Achar (Egg) | Yellow-Orange | +22 Power, +18 Spice, +25 Sweetness | Versatile |
| Beef Fry | Dark Brown | +35 Power, +30 Chaos, +15 Crunch | Heavy hitter |
| Prawn Masala | Red-Orange | +25 Power, +35 Spice, +20 Crunch | Assassin |
| Kozhi Roast | Dark Brown | +32 Power, +28 Spice, +30 Crunch | Powerhouse |
| Kela (Fried Banana) | Golden | +15 Power, +25 Sweetness, +20 Crunch | Sweet tank |
| Upperi (Banana Chips) | Gold | +10 Power, +20 Crunch, +15 Sweetness | Crunchy support |
| Payasam | Gold | +35 Power, +45 Sweetness, +50 Chaos | Ultimate/finale (same both modes) |

STAT CALCULATION FORMULA:

For each drawn dish on the leaf:
- Portion Size Factor = (drawn_area_pixels / max_leaf_area_pixels) × 100%
  - Capped at 100% (largest reasonable portion)
  - Minimum 15% (smallest recognizable drawing)
- Dish Contribution = Base Stats × Portion Size Factor
- Total Stats = Sum of all dish contributions
- SADHYA POWER = Total power contributions

Example:
- User draws small Rasam (+30 Spice base)
  - Portion Size: 30% (small drawing)
  - Contribution: +9 Spice
  
- User draws large Avial (+30 Power base)
  - Portion Size: 80% (large drawing)
  - Contribution: +24 Power

COLOR PALETTE & DESIGN:
- Banana leaf: Light cream (#f5f1de) with subtle veining
- Dish colors: Warm Kerala-inspired tones (reds, oranges, golds, greens)
- Stat bars: Color-coded (Spice = red, Sweetness = gold, Crunch = orange, etc.)
- Overall: Playful but visually cohesive
- Typography: Modern UI (for controls) + serif (for dish names)

INTERACTIONS:
- Hover over dish name: Shows stat preview tooltip
- Click dish name: Enables drawing mode (canvas highlights subtly)
- Draw on leaf: Real-time visual feedback (stroke preview)
- After drawing: Auto-fill completes, stat bars animate upward
- Multiple drawings allowed (can add same dish multiple times)
- User can keep adding until satisfied

AUDIO:
- Dish addition sound (reaction): 2–3 generic MP3 clips per mode, ~1–2 sec each, cycling
- Stat bar update: Optional subtle "ding" sound
- No other audio on builder page (let background music dominate)

═══════════════════════════════════════════════════════════════

PAGE 3 — RESULT SCREEN (2 versions: Normal Mode & Kannur Mode)

ANIMATION SEQUENCE (on page load):

1. [0–1 sec] Zoom out from banana leaf
   - Camera pulls back, shows full Sadhya composition
2. [1–2 sec] Maveli character enters frame
   - Walks/floats toward banana leaf from bottom
3. [2–4 sec] Inspection animation
   - Maveli leans in, examines Sadhya closely
   - Audio plays: "mmmm MMMM" (contemplative approval)
   - Maveli nods or gives thumbs up
4. [4–5 sec] Transition to score display
   - Fade out inspection, fade in result screen

RESULT DISPLAY (after animation):

Split-screen layout:

LEFT SIDE (50%):
- SCORE CARD:
  - Large score number: [0–100] (e.g., "78/100")
  - Sadhya title/nickname (based on composition):
    * E.g., "SPICY CHAOS BUILD" / "BALANCED FEAST" / "PAYASAM POWER"
  - Breakdown:
    * SADHYA POWER: [value]
    * SPICE: [value]
    * CRUNCH: [value]
    * CHAOS: [value]
    * SWEETNESS: [value]
  - Funny badge/label (contextual):
    * Normal mode: "Ammachi Approved™" / "Proper Sadhya" / "Peak Malayali"
    * Kannur mode: "You Have Chosen Violence" / "Non-Veg Rebel" / "Malabar Edition™"
  - Mode indicator: "NORMAL MODE" or "KANNUR MODE"
  - Stat bar visualization (same as builder)

RIGHT SIDE (50%):
- Maveli reaction video/animation
  - Looped reaction based on score tier:
    * Score 0–40: Confused/skeptical Maveli
    * Score 41–70: Pleased/approving Maveli
    * Score 71–100: Delighted/amazed Maveli
  - Different video for Normal vs Kannur mode
  - Video loops seamlessly

SEAMLESS BLEND:
- No visible divider between left and right
- Subtle gradient or color transition at the center
- Both sides feel like one unified result display

BUTTONS (bottom):
- "BUILD ANOTHER" button
  - Returns to Home (mode preserved so user can toggle if desired)
  - Or option to rebuild with same mode directly

- "SHARE" button (optional, low priority)
  - Share score on social media / download result image

DESIGN:
- Celebratory color scheme (golds, greens, warm tones)
- Confetti animation (optional, subtle)
- Typography: Large, readable score; smaller but clear stat breakdown

═══════════════════════════════════════════════════════════════

DESIGN SYSTEM:

Color Palette:
- Primary (Sadhya Gold): #d4af37
- Dark Green (Kerala): #1a4d2e
- Warm Red (Traditional): #c41e3a
- Cream (Leaf): #f5f1de
- Accent Orange: #ff8c42
- Secondary Green: #52a552

Typography:
- Headings: Serif font (e.g., Playfair Display, traditional feel)
- UI/Body: Modern sans-serif (e.g., Inter, Poppins)
- Dish names: Sans-serif, medium weight

Icons & Graphics:
- Stat icons (spoon, flame, sparkle, etc.)
- Dish illustrations or colored textures
- Maveli character (simple, playful design)
- Banana leaf (hand-drawn or illustrated)

Animations:
- Smooth easing (ease-in-out)
- Bounce effects on stat updates
- Fade transitions between pages
- Drawing feedback (stroke animation)
- No heavy animations (keep it snappy)

═══════════════════════════════════════════════════════════════

AUDIO ASSETS (User Must Provide):

1. Background music (Normal Mode)
   - File: MP3, 30–60 sec, looping
   - Tone: Upbeat, celebratory, traditional Kerala vibes
   - Example: Onam songs or similar instrumental

2. Background music (Kannur Mode)
   - File: MP3, 30–60 sec, looping
   - Tone: Slightly edgier/playful, still joyful
   - Example: Remixed version or different track

3. Dish reaction sounds (Normal Mode)
   - 2–3 short MP3 clips, 1–2 sec each
   - Examples: "Nalla!", "Ayyo!", "Acha!" (Malayalam exclamations)
   - Cycle through on each dish addition

4. Dish reaction sounds (Kannur Mode)
   - 2–3 short MP3 clips, 1–2 sec each
   - Examples: "Oho!", "Nice!", "Haha!" (playful reactions)

5. Inspection sound (Both modes)
   - File: MP3, "mmmm MMMM" (contemplative approval)
   - Used during Maveli inspection animation
   - Same for both modes

6. Background video (Normal Mode)
   - File: MP4/WebM, ~10 sec, looping
   - Content: Kerala scenery, Onam decorations, or vibrant nature
   - Tone: Serene, traditional, celebratory

7. Background video (Kannur Mode)
   - File: MP4/WebM, ~10 sec, looping
   - Content: Different Kerala scenery or slightly more energetic
   - Tone: Playful, slightly edgier

8. Maveli reaction video (Normal Mode)
   - File: MP4/WebM, ~5 sec (looping)
   - Content: Maveli approving/pleased expression
   - 3 tiers: confused, pleased, delighted

9. Maveli reaction video (Kannur Mode)
   - File: MP4/WebM, ~5 sec (looping)
   - Content: Maveli surprised/amused expression
   - 3 tiers: skeptical, amused, impressed

═══════════════════════════════════════════════════════════════

TECHNICAL REQUIREMENTS:

State Management:
- Mode (Normal / Kannur) persists from Home → Builder → Result
- Current dish selection persists during builder session
- Drawn dishes on leaf persist until user clears
- Stats update in real-time

Canvas Drawing:
- Freehand drawing capability on banana leaf canvas
- Drawn areas auto-fill with dish color/pattern
- Portion size calculated from drawn area
- Support for multiple strokes (can draw multiple times)
- Touch-friendly (mobile/tablet compatible)

Responsive Design:
- Tablet-friendly layout (flex/responsive sidebars)
- Mobile: Consider single-column layout (sidebar below canvas on mobile)
- Canvas scaling maintains proportion

Performance:
- Smooth drawing experience (no lag)
- Real-time stat calculation
- Fluid animations (60fps target)

═══════════════════════════════════════════════════════════════

TONE & MESSAGING:

Voice:
- Playful, chaotic, meme-y
- Culturally authentic (jokes Malayalis recognize)
- Confident and fun (not apologetic)

Humor Examples:
- "Pappadam is legendary" (culturally recognized as essential)
- "Payasam = final boss" (dessert is the ultimate component)
- "Puli Inji hits different" (tiny dish, huge impact)
- "Kannur Mode: You have chosen violence" (non-veg unlockable)
- "Ammachi Approved™" (grandma's validation is the real score)
- "Portion control is for cowards" (encouraging bigger drawings)

Copy:
- Keep it short, punchy, witty
- Use Malayalam words (Malayalam speakers will appreciate)
- Embrace the chaos

═══════════════════════════════════════════════════════════════

BUILD PRIORITIES (for 3–4 hour timeline):

MUST-HAVE (Tier 1 — 1.5 hours):
□ Home page with mode toggle + START button
□ Sadhya builder with dish sidebar
□ Freehand drawing on banana leaf canvas
□ Drawn areas fill with dish colors
□ Stat calculation + real-time bar updates
□ "FINALIZE" button

SHOULD-HAVE (Tier 2 — 1.5 hours):
□ Result screen with score display
□ Maveli inspection animation
□ Reaction audio (dish selections + inspection)
□ Background video + music (both modes)
□ Mode persistence (Normal ↔ Kannur)

NICE-TO-HAVE (Tier 3 — if time allows):
□ Maveli video reaction on result screen
□ Score tier-based reactions
□ Funny badges/labels
□ Confetti animation
□ "SHARE" button

═══════════════════════════════════════════════════════════════

SUCCESS CRITERIA:

The final demo should:
✅ Be playable end-to-end in 60–90 seconds
✅ Make users immediately understand the concept
✅ Make users smile/laugh (the cultural humor lands)
✅ Feel polished and responsive
✅ Work reliably without glitches
✅ Look visually impressive (Kerala + game UI aesthetic)
✅ Feel specifically like "someone who knows Kerala made this" (not generic)

═══════════════════════════════════════════════════════════════

BUILD WITH:
- Model: Claude Sonnet 4.6 (in Figma Make)
- Framework: Figma Make interactive prototyping
- Target: Web (responsive)
- Timeframe: 3–4 hours