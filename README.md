# Sliding Text Watchface for Amazfit Bip 6

A Pebble-style text-based watchface that displays time using pre-rendered PNG images in a sliding/stacked layout.

## Display Layout

The watchface shows time as stacked text images with date information at the bottom:

```
                       TWELVE
                             thirty
                             seven

thursday 9 october
```

Or for exact hours:

```
                                               TWO
                                            o'clock

wednesday 29 september
```

## Minute Display Modes

The watchface uses two display modes based on the current minute:

### Single Line Mode (minutes 0-20, 30, 40, 50)
Displays the hour on line 1, minute text on line 2:
- `:00` → "o'clock"
- `:01-:20` → "one" through "twenty"
- `:30`, `:40`, `:50` → "thirty", "forty", "fifty"

### Two Line Mode (minutes 21-29, 31-39, 41-49, 51-59)
Displays the hour on line 1, tens on line 2, ones on line 3:
- `:27` → "twenty" / "seven"
- `:38` → "thirty" / "eight"
- `:56` → "fifty" / "six"

## Asset Requirements

All images are 8-bit RGBA PNGs with specific dimensions and positions:

### Hours (284×103 at x:97, y:72)
```
assets/hours/
  one.png, two.png, three.png, four.png, five.png, six.png,
  seven.png, eight.png, nine.png, ten.png, eleven.png, twelve.png
```

### Minutes (279×69)
- **Line 1** at x:102, y:184
- **Line 2** at x:102, y:252

```
assets/minutes/
  oclock.png, one.png, two.png, three.png, four.png, five.png,
  six.png, seven.png, eight.png, nine.png, ten.png, eleven.png,
  twelve.png, thirteen.png, fourteen.png, fifteen.png, sixteen.png,
  seventeen.png, eighteen.png, nineteen.png, twenty.png, thirty.png,
  forty.png, fifty.png
```

### Days (160×34 at x:19, y:414)
```
assets/days/
  sunday.png, monday.png, tuesday.png, wednesday.png,
  thursday.png, friday.png, saturday.png
```

### Date Digits (17×24)
- **Tens** at x:188, y:416
- **Ones** at x:207, y:416

```
assets/digits/
  0.png, 1.png, 2.png, 3.png, 4.png, 5.png, 6.png, 7.png, 8.png, 9.png
```

### Months (148×34 at x:233, y:414)
```
assets/months/
  january.png, february.png, march.png, april.png, may.png, june.png,
  july.png, august.png, september.png, october.png, november.png, december.png
```

## Project Structure

```
.
├── README.md
├── app.json
├── app.js
├── package.json
├── watchface/
│   └── index.js
├── assets/
│   ├── hours/
│   ├── minutes/
│   ├── days/
│   ├── digits/
│   └── months/
└── simple/         (reference implementation)
```

## Configuration

### app.json
Copy from the `simple/` example and ensure:
- `appType: "watchface"`
- `designWidth: 390` (for Bip 6)
- Watchface module points to `watchface/index`

### app.js
Use the standard ZeppOS app.js bootstrap (copy from `simple/app.js`).

### package.json
Basic package metadata (copy from `simple/package.json` and update name/description).

## Implementation Details

- **12-hour format**: Converts 24-hour system time to 12-hour display
- **Conditional visibility**: Minute line 2 and date tens digit are hidden when not needed
- **White background**: Currently set for development (black text on white), change `color: 0xFFFFFF` to `0x000000` for production
- **Automatic updates**: Uses `MINUTEEND` sensor event and `resume_call` delegate
- **Image-based rendering**: All text uses IMG widgets for efficiency

## Building and Deployment

1. Ensure all PNG assets are in place under `assets/` directories
2. Build the project using Zeus CLI or your preferred ZeppOS build tool
3. Deploy to Amazfit Bip 6 device

## Development Notes

- All asset filenames are lowercase
- Images contain black text on transparent background
- Text is right-justified within image bounds (hours and minutes)
- Date format: "thursday 9 october" (no year, always lowercase)
- Date tens digit is hidden for days 1-9

## Testing Checklist

- [ ] Hour transitions (especially 11→12 and 12→1)
- [ ] Minute mode transitions:
  - [ ] :20 → :21 (single line → two lines)
  - [ ] :30 → :31 (single line → two lines)
  - [ ] :59 → :00 (two lines → single line)
- [ ] Date transitions:
  - [ ] Day 9 → 10 (tens digit appears)
  - [ ] End of month (day and month update)
  - [ ] End of year (December → January)
- [ ] Day of week transition (Saturday → Sunday)
- [ ] Resume from background updates display correctly