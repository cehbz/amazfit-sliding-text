# Sliding Text Watchface for Amazfit Bip 6

A Pebble-style text-based watchface that displays time using custom Optima fonts in a sliding/stacked layout.

## Display Layout

The watchface shows time as stacked text with date information at the bottom:

```
                                            twelve
                                                 thirty
                                                 seven

                    thursday, 11 october
```

Or for exact hours:

```
                                                two
                                            o'clock

                  wednesday, 29 september
```

## Minute Display Modes

The watchface uses two display modes based on the current minute:

### Single Line Mode (minutes 0, 10-20, 30, 40, 50)
Displays the hour on line 1, minute text on line 2:
- `:00` → "o'clock"
- `:10-:20` → "ten" through "twenty"
- `:30`, `:40`, `:50` → "thirty", "forty", "fifty"

### Two Line Mode (minutes 1-9, 21-29, 31-39, 41-49, 51-59)
Displays the hour on line 1, tens on line 2, ones on line 3:
- `:01` → "oh" / "one"
- `:27` → "twenty" / "seven"
- `:38` → "thirty" / "eight"
- `:56` → "fifty" / "six"

## Font Requirements

The watchface uses two Optima font files:

```
assets/fonts/
  Optima-Bold.ttf       (for hour display)
  Optima-Regular.ttf    (for minutes and date)
```

**Font Optimization:** Use the included `subset-fonts.py` script to reduce font file sizes by keeping only required glyphs:
- Bold: a-z (26 glyphs)
- Regular: a-z, 0-9, space, comma, apostrophe (39 glyphs)

```bash
python3 subset-fonts.py assets/fonts assets/fonts-subsetted
```

## Project Structure

```
.
├── README.md
├── app.json
├── app.js
├── package.json
├── subset-fonts.py
├── watchface/
│   └── index.js
└── assets/
    ├── fonts/
    │   ├── Optima-Bold.ttf
    │   └── Optima-Regular.ttf
    └── background.png    (optional decorative background)
```

## Configuration

### app.json
- `appType: "watchface"`
- `designWidth: 390` (for Bip 6)
- Watchface module points to `watchface/index`

### app.js
Standard ZeppOS application bootstrap with error handling.

### package.json
Basic package metadata.

## Implementation Details

- **12-hour format**: Converts 24-hour system time to 12-hour display
- **Font rendering**: Uses ZeppOS TEXT widgets with custom Optima fonts
- **Right-aligned text**: Hour and minute text aligned to right with 15px margin
- **Centered date**: Date text centered at bottom of screen
- **Conditional visibility**: Minute line 2 hidden when not needed (single-line mode)
- **Battery optimization**: 
  - Updates only when screen is visible (visibility flag)
  - Date updates only when day changes (caching)
  - Early return prevents unnecessary work when paused
- **Automatic updates**: Uses `MINUTEEND` sensor event and `resume_call`/`pause_call` delegates
- **Color scheme**: Cream background (#F6ECAF) with white text (development), customizable via CONFIG object

## Display Format

- **Time**: lowercase text (e.g., "twelve", "thirty")
- **Date**: "thursday, 11 october" (day name, day number, month name - no year)
- **Week indexing**: ZeppOS uses 1-7 where 1=Monday, 7=Sunday

## Building and Deployment

1. Install font files in `assets/fonts/` directory
2. (Optional) Run `subset-fonts.py` to optimize font sizes
3. (Optional) Add `background.png` for decorative background
4. In Zepp Android app, enable developer, bridge mode
5. Deploy to Amazfit Bip 6 device
   ```bash
   zeus bridge
   zeus$ connect
   zeus$ install
   ```

## Development Notes

- All text is lowercase
- Font files should be subsetted for optimal file size and performance
- Background color and text color customizable in CONFIG object
- Currently uses TEXT widgets with custom fonts (see Performance Considerations)

## Performance Considerations

**Current Implementation:** TEXT widgets with custom TTF fonts
- Fonts are rasterized on each update (~60 times per day when screen is on)
- More battery intensive than stock watchfaces using pre-rendered images
- Provides flexibility for future enhancements

**Alternative Implementation:** For better battery life, consider converting to IMG widgets with pre-rendered text images (see git history for IMG-based implementation).

## Testing Checklist

- [ ] Hour transitions (especially 11→12 and 12→1)
- [ ] Minute mode transitions:
  - [ ] :09 → :10 (two lines → single line)
  - [ ] :20 → :21 (single line → two lines)
  - [ ] :29 → :30 (two lines → single line)
  - [ ] :30 → :31 (single line → two lines)
  - [ ] :59 → :00 (two lines → single line)
- [ ] Date transitions:
  - [ ] Day changes correctly
  - [ ] Month changes correctly (end of month)
  - [ ] Year transitions (December → January)
- [ ] Day of week transition (Saturday → Sunday)
- [ ] Resume from background updates display correctly
- [ ] Screen wake shows current time (not stale)
- [ ] Battery life comparable to expectations

## Troubleshooting

**Battery drains faster than stock watchfaces:**
- Ensure subsetted fonts are being used
- Check that visibility flag prevents updates when screen is off
- Consider converting to IMG widget implementation for maximum efficiency

**Text not displaying:**
- Verify font files are in correct location (`assets/fonts/`)
- Check font file names match CONFIG constants
- Ensure fonts contain required glyphs (use subset-fonts.py)

**Wrong day of week displayed:**
- ZeppOS week values: 1=Monday through 7=Sunday
- Verify dayNames array indexing matches