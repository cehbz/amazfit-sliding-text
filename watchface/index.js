// Complete Pebble-style sliding text watchface with Optima fonts
(() => {
  // Widget references
  let hourText = null;
  let minute1Text = null;
  let minute2Text = null;
  let dateText = null;
  
  // Sensor reference
  let timeSensor = null;
  
  // Configuration
  const CONFIG = {
    fontRegular: 'fonts/Optima-Regular.ttf',
    fontBold: 'fonts/Optima-Bold.ttf',
    backgroundColor: 0xF6ECAF,      // Cream background
    textColor: 0x000000,            // Black text
    
    // Layout for right-side vertical centering
    hourSize: 72,
    minuteSize: 56,
    dateSize: 24,
    
    // Right-aligned text positioning (with 1em right margin)
    textX: 0,           // Left edge for right-aligned text
    textWidth: 375,     // 390 - 15 = right margin
    
    // Vertical positioning (centered on right side)
    hourY: 120,
    minute1Y: 200,
    minute2Y: 260,
    
    // Date at bottom (centered)
    dateY: 410,
  };
  
  // Hour names (12-hour format, lowercase)
  const hourNames = [
    "twelve", "one", "two", "three", "four", "five",
    "six", "seven", "eight", "nine", "ten", "eleven"
  ];
  
  // Minute names for ones place (0-9)
  const minuteOnes = [
    "", "one", "two", "three", "four", "five",
    "six", "seven", "eight", "nine"
  ];
  
  // Minute names for tens place
  const minuteTens = {
    0: "oh",
    1: "ten",
    2: "twenty",
    3: "thirty",
    4: "forty",
    5: "fifty"
  };
  
  // Special minute names (10-20, 30, 40, 50)
  const specialMinutes = [
    null, null, null, null, null, null, null, null, null, null,
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
    "sixteen", "seventeen", "eighteen", "nineteen", "twenty"
  ];
  
  // Day names (0=Sunday through 6=Saturday)
  const dayNames = [
    "sunday", "monday", "tuesday", "wednesday",
    "thursday", "friday", "saturday"
  ];
  
  // Month names (1-12)
  const monthNames = [
    "", "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];
  
  /**
   * Get minute text(s) based on current minute value
   * Returns object with minute1 and minute2 (minute2 may be null)
   */
  function getMinuteTexts(minute) {
    // Special case: :00 shows "o'clock" as single line
    if (minute === 0) {
      return { minute1: "o'clock", minute2: null };
    }
    
    // :10-:20, :30, :40, :50: single line
    if ((minute >= 10 && minute <= 20) || minute === 30 || minute === 40 || minute === 50) {
      return { 
        minute1: specialMinutes[minute] || minuteTens[Math.floor(minute / 10)], 
        minute2: null 
      };
    }
    
    // All other minutes (01-09, 21-29, 31-39, 41-49, 51-59): two lines
    const tens = Math.floor(minute / 10);
    const ones = minute % 10;
    return {
      minute1: minuteTens[tens],
      minute2: minuteOnes[ones]
    };
  }
  
  /**
   * Format date as "thursday, 11 october"
   */
  function formatDate(week, day, month) {
    return `${dayNames[week]}, ${day} ${monthNames[month]}`;
  }
  
  /**
   * Update all display elements based on current time
   */
  function updateDisplay() {
    if (!timeSensor) return;
    
    const hour = timeSensor.hour % 12;
    const minute = timeSensor.minute;
    const day = timeSensor.day;
    const week = timeSensor.week;
    const month = timeSensor.month;
    
    console.log(`[WATCHFACE] Updating: ${hour}:${minute}, ${formatDate(week, day, month)}`);
    
    // Update hour (lowercase, bold)
    const hourName = hourNames[hour];
    hourText.setProperty(hmUI.prop.MORE, {
      text: hourName
    });
    
    // Update minutes
    const { minute1, minute2 } = getMinuteTexts(minute);
    minute1Text.setProperty(hmUI.prop.MORE, {
      text: minute1
    });
    
    if (minute2) {
      minute2Text.setProperty(hmUI.prop.MORE, {
        text: minute2
      });
      minute2Text.setProperty(hmUI.prop.VISIBLE, true);
    } else {
      minute2Text.setProperty(hmUI.prop.VISIBLE, false);
    }
    
    // Update date
    dateText.setProperty(hmUI.prop.MORE, {
      text: formatDate(week, day, month)
    });
  }
  
  __$$module$$__.module = DeviceRuntimeCore.WatchFace({
    init_view() {
      console.log('[WATCHFACE] init_view START');
      
      // Create background
      hmUI.createWidget(hmUI.widget.FILL_RECT, {
        x: 0,
        y: 0,
        w: 390,
        h: 450,
        color: CONFIG.backgroundColor,
        radius: 0,
        show_level: hmUI.show_level.ONLY_NORMAL,
      });
      
      // Create hour text widget (BOLD, right-aligned)
      hourText = hmUI.createWidget(hmUI.widget.TEXT, {
        x: CONFIG.textX,
        y: CONFIG.hourY,
        w: CONFIG.textWidth,
        h: 90,
        text_size: CONFIG.hourSize,
        color: CONFIG.textColor,
        align_h: hmUI.align.RIGHT,
        align_v: hmUI.align.CENTER_V,
        text_style: hmUI.text_style.NONE,
        font: CONFIG.fontBold,
        text: 'twelve',
        show_level: hmUI.show_level.ONLY_NORMAL,
      });
      
      // Create minute line 1 text widget (regular, right-aligned)
      minute1Text = hmUI.createWidget(hmUI.widget.TEXT, {
        x: CONFIG.textX,
        y: CONFIG.minute1Y,
        w: CONFIG.textWidth,
        h: 70,
        text_size: CONFIG.minuteSize,
        color: CONFIG.textColor,
        align_h: hmUI.align.RIGHT,
        align_v: hmUI.align.CENTER_V,
        text_style: hmUI.text_style.NONE,
        font: CONFIG.fontRegular,
        text: "o'clock",
        show_level: hmUI.show_level.ONLY_NORMAL,
      });
      
      // Create minute line 2 text widget (regular, right-aligned)
      minute2Text = hmUI.createWidget(hmUI.widget.TEXT, {
        x: CONFIG.textX,
        y: CONFIG.minute2Y,
        w: CONFIG.textWidth,
        h: 70,
        text_size: CONFIG.minuteSize,
        color: CONFIG.textColor,
        align_h: hmUI.align.RIGHT,
        align_v: hmUI.align.CENTER_V,
        text_style: hmUI.text_style.NONE,
        font: CONFIG.fontRegular,
        text: 'one',
        show_level: hmUI.show_level.ONLY_NORMAL,
      });
      
      // Create date text widget (centered at bottom)
      dateText = hmUI.createWidget(hmUI.widget.TEXT, {
        x: 0,
        y: CONFIG.dateY,
        w: 390,
        h: 40,
        text_size: CONFIG.dateSize,
        color: CONFIG.textColor,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
        text_style: hmUI.text_style.NONE,
        font: CONFIG.fontRegular,
        text: 'thursday, 11 october',
        show_level: hmUI.show_level.ONLY_NORMAL,
      });
      
      console.log('[WATCHFACE] All widgets created');
      
      // Create time sensor
      timeSensor = hmSensor.createSensor(hmSensor.id.TIME);
      console.log('[WATCHFACE] Time sensor created');
      
      // Set initial display
      updateDisplay();
      console.log('[WATCHFACE] Initial display set');
      
      // Listen for minute changes
      timeSensor.addEventListener(timeSensor.event.MINUTEEND, function () {
        console.log('[WATCHFACE] MINUTEEND event fired');
        updateDisplay();
      });
      
      // Handle resume (when watchface comes back to foreground)
      hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
        resume_call: function () {
          console.log('[WATCHFACE] RESUME event fired');
          updateDisplay();
        },
      });
      
      console.log('[WATCHFACE] init_view COMPLETE');
    },
    
    build() {
      console.log('[WATCHFACE] build() called');
      this.init_view();
    },
  });
})();