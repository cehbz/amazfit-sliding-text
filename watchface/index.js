// Complete Pebble-style sliding text watchface with Optima fonts
(() => {
  // Constants
  const SCREEN_WIDTH = 390;
  const SCREEN_HEIGHT = 450;
  const RIGHT_MARGIN = 15;
  
  // Widget references
  let hourText = null;
  let minute1Text = null;
  let minute2Text = null;
  let dateText = null;
  
  // State
  let timeSensor = null;
  let isVisible = true;
  let displayedDay = -1;

  // Configuration
  const CONFIG = {
    fontRegular: 'fonts/Optima-Regular.ttf',
    fontBold: 'fonts/Optima-Bold.ttf',
    backgroundColor: 0xF6ECAF,      // Cream background
    textColor: 0xFFFFFF,            // White text
    
    // Layout for right-side vertical centering
    hourSize: 72,
    minuteSize: 56,
    dateSize: 24,
    
    // Right-aligned text positioning
    textX: 0,
    textWidth: SCREEN_WIDTH - RIGHT_MARGIN,
    
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
  
  // Minute names for tens place
  const minuteTens = [
    "oh", "ten", "twenty", "thirty", "forty", "fifty"
  ];
  
  // Minute names for ones place (0-9)
  const minuteOnes = [
    "", "one", "two", "three", "four", "five", 
    "six", "seven", "eight", "nine"
  ];
  
  // Minute names for "teens"
  const minuteTeens = [
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", 
    "sixteen", "seventeen", "eighteen", "nineteen"
  ];
  
  // Day names
  const dayNames = [
    "", "monday", "tuesday", "wednesday", "thursday", 
    "friday", "saturday", "sunday"
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
  function getMinutes(minute) {
    // :00 shows "o'clock" as single line
    if (minute === 0) {
      return { minute1: "o'clock", minute2: null };
    }

    const tens = Math.floor(minute / 10);
    const ones = minute % 10;

    // :10, :20, :30, :40, :50, single line
    if (ones === 0) {
      return { minute1: minuteTens[tens], minute2: null };
    }
    
    // :11-:19, single line
    if (11 <= minute && minute <= 19) {
      return { minute1: minuteTeens[minute - 11], minute2: null };
    }
    
    // Everything else: two lines
    return { minute1: minuteTens[tens], minute2: minuteOnes[ones] };
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
    if (!isVisible || !timeSensor) return;

    const hour = timeSensor.hour % 12;
    const minute = timeSensor.minute;
    const day = timeSensor.day;
    const week = timeSensor.week;
    const month = timeSensor.month;
    
    // Update hour (lowercase, bold)
    const hourName = hourNames[hour];
    hourText.setProperty(hmUI.prop.MORE, {
      text: hourName
    });
    
    // Update minutes
    const { minute1, minute2 } = getMinutes(minute);
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

    // Only update date when day changes
    if (day !== displayedDay) {
      displayedDay = day;
      dateText.setProperty(hmUI.prop.MORE, {
        text: formatDate(week, day, month)
      });
    }
  }
  
  __$$module$$__.module = DeviceRuntimeCore.WatchFace({
    init_view() {
      // Create background
      hmUI.createWidget(hmUI.widget.FILL_RECT, {
        x: 0,
        y: 0,
        w: SCREEN_WIDTH,
        h: SCREEN_HEIGHT,
        color: CONFIG.backgroundColor,
        radius: 0,
        show_level: hmUI.show_level.ONLY_NORMAL,
      });
      
      // Create background image
      hmUI.createWidget(hmUI.widget.IMG, {
        x: 0,
        y: 0,
        src: 'background.png',
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
        text: '',
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
        text: '',
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
        text: '',
        show_level: hmUI.show_level.ONLY_NORMAL,
      });
      
      // Create date text widget (centered at bottom)
      dateText = hmUI.createWidget(hmUI.widget.TEXT, {
        x: 0,
        y: CONFIG.dateY,
        w: SCREEN_WIDTH,
        h: 40,
        text_size: CONFIG.dateSize,
        color: CONFIG.textColor,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
        text_style: hmUI.text_style.NONE,
        font: CONFIG.fontRegular,
        text: '',
        show_level: hmUI.show_level.ONLY_NORMAL,
      });
      
      // Create time sensor
      timeSensor = hmSensor.createSensor(hmSensor.id.TIME);
      
      // Set initial display
      updateDisplay();
      
      // Listen for minute changes
      timeSensor.addEventListener(timeSensor.event.MINUTEEND, updateDisplay);
      
      // Handle visibility changes
      hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
        resume_call: () => {
          isVisible = true;
          updateDisplay();
        },
        pause_call: () => {
          isVisible = false;
        },
      });
    },
    
    build() {
      this.init_view();
    },
  });
})();