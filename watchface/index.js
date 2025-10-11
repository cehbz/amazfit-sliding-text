// Pebble-style sliding text watchface using pre-rendered PNG images
(() => {
    // Widget references
    let hourImg = null;
    let minute1Img = null;
    let minute2Img = null;
    let dayImg = null;
    let dateTensImg = null;
    let dateOnesImg = null;
    let monthImg = null;
    
    // Sensor reference
    let timeSensor = null;
    
    // Hour names (0-23, but we'll use 12-hour format)
    const hourNames = [
      "twelve", "one", "two", "three", "four", "five",
      "six", "seven", "eight", "nine", "ten", "eleven",
      "twelve", "one", "two", "three", "four", "five",
      "six", "seven", "eight", "nine", "ten", "eleven"
    ];
    
    // Minute names for ones place (0-9)
    const minuteOnes = [
      "", "one", "two", "three", "four", "five",
      "six", "seven", "eight", "nine"
    ];
    
    // Minute names for tens place and special cases
    const minuteTens = {
      0: "oclock",
      1: "ten",
      2: "twenty",
      3: "thirty",
      4: "forty",
      5: "fifty"
    };
    
    // Special minute names (0-20, 30, 40, 50)
    const specialMinutes = [
      "oclock", "one", "two", "three", "four", "five",
      "six", "seven", "eight", "nine", "ten",
      "eleven", "twelve", "thirteen", "fourteen", "fifteen",
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
      // 0-20, 30, 40, 50: single line
      if (minute <= 20 || minute === 30 || minute === 40 || minute === 50) {
        return { minute1: specialMinutes[minute] || minuteTens[Math.floor(minute / 10)], minute2: null };
      }
      
      // 21-29, 31-39, 41-49, 51-59: two lines
      const tens = Math.floor(minute / 10);
      const ones = minute % 10;
      return {
        minute1: minuteTens[tens],
        minute2: minuteOnes[ones]
      };
    }
    
    /**
     * Update all display elements based on current time
     */
    function updateDisplay() {
      if (!timeSensor) return;
      
      const hour = timeSensor.hour % 12; // Convert to 12-hour format
      const minute = timeSensor.minute;
      const day = timeSensor.day;
      const week = timeSensor.week; // Day of week (0=Sunday)
      const month = timeSensor.month;
      
      console.log(`[SLIDING] Updating display: ${hour}:${minute}, ${dayNames[week]} ${day} ${monthNames[month]}`);
      
      // Update hour
      const hourName = hourNames[hour];
      hourImg.setProperty(hmUI.prop.MORE, {
        src: `hours/${hourName}.png`
      });
      
      // Update minutes
      const { minute1, minute2 } = getMinuteTexts(minute);
      minute1Img.setProperty(hmUI.prop.MORE, {
        src: `minutes/${minute1}.png`
      });
      
      if (minute2) {
        minute2Img.setProperty(hmUI.prop.MORE, {
          src: `minutes/${minute2}.png`
        });
        minute2Img.setProperty(hmUI.prop.VISIBLE, true);
      } else {
        minute2Img.setProperty(hmUI.prop.VISIBLE, false);
      }
      
      // Update day of week
      dayImg.setProperty(hmUI.prop.MORE, {
        src: `days/${dayNames[week]}.png`
      });
      
      // Update date (day of month)
      const dateTens = Math.floor(day / 10);
      const dateOnes = day % 10;
      
      if (dateTens > 0) {
        dateTensImg.setProperty(hmUI.prop.MORE, {
          src: `digits/${dateTens}.png`
        });
        dateTensImg.setProperty(hmUI.prop.VISIBLE, true);
      } else {
        dateTensImg.setProperty(hmUI.prop.VISIBLE, false);
      }
      
      dateOnesImg.setProperty(hmUI.prop.MORE, {
        src: `digits/${dateOnes}.png`
      });
      
      // Update month
      monthImg.setProperty(hmUI.prop.MORE, {
        src: `months/${monthNames[month]}.png`
      });
    }
    
    __$$module$$__.module = DeviceRuntimeCore.WatchFace({
      init_view() {
        console.log('[SLIDING] init_view START');
        
        // Create white background for development (black text on white)
        hmUI.createWidget(hmUI.widget.FILL_RECT, {
          x: 0,
          y: 0,
          w: 390,
          h: 450,
          color: "0xF6ECAF",
          radius: 0,
          show_level: hmUI.show_level.ONLY_NORMAL,
        });
        
        console.log('[SLIDING] Background created');
        
        // Create hour image widget (284x103 at 97,72)
        hourImg = hmUI.createWidget(hmUI.widget.IMG, {
          x: 97,
          y: 72,
          w: 284,
          h: 103,
          src: "hours/twelve.png",
          show_level: hmUI.show_level.ONLY_NORMAL,
        });
        
        // Create minute line 1 image widget (279x69 at 102,184)
        minute1Img = hmUI.createWidget(hmUI.widget.IMG, {
          x: 102,
          y: 184,
          w: 279,
          h: 69,
          src: "minutes/oclock.png",
          show_level: hmUI.show_level.ONLY_NORMAL,
        });
        
        // Create minute line 2 image widget (279x69 at 102,252)
        minute2Img = hmUI.createWidget(hmUI.widget.IMG, {
          x: 102,
          y: 252,
          w: 279,
          h: 69,
          src: "minutes/one.png",
          show_level: hmUI.show_level.ONLY_NORMAL,
        });
        
        // Create day of week image widget (160x34 at 19,414)
        dayImg = hmUI.createWidget(hmUI.widget.IMG, {
          x: 19,
          y: 414,
          w: 160,
          h: 34,
          src: "days/monday.png",
          show_level: hmUI.show_level.ONLY_NORMAL,
        });
        
        // Create date tens digit image widget (17x24 at 188,416)
        dateTensImg = hmUI.createWidget(hmUI.widget.IMG, {
          x: 188,
          y: 416,
          w: 17,
          h: 24,
          src: "digits/0.png",
          show_level: hmUI.show_level.ONLY_NORMAL,
        });
        
        // Create date ones digit image widget (17x24 at 207,416)
        dateOnesImg = hmUI.createWidget(hmUI.widget.IMG, {
          x: 207,
          y: 416,
          w: 17,
          h: 24,
          src: "digits/0.png",
          show_level: hmUI.show_level.ONLY_NORMAL,
        });
        
        // Create month image widget (148x34 at 233,414)
        monthImg = hmUI.createWidget(hmUI.widget.IMG, {
          x: 233,
          y: 414,
          w: 148,
          h: 34,
          src: "months/january.png",
          show_level: hmUI.show_level.ONLY_NORMAL,
        });
        
        console.log('[SLIDING] All widgets created');
        
        // Create time sensor
        timeSensor = hmSensor.createSensor(hmSensor.id.TIME);
        console.log('[SLIDING] Time sensor created');
        
        // Set initial display
        updateDisplay();
        console.log('[SLIDING] Initial display set');
        
        // Listen for minute changes
        timeSensor.addEventListener(timeSensor.event.MINUTEEND, function () {
          console.log('[SLIDING] MINUTEEND event fired');
          updateDisplay();
        });
        
        // Handle resume (when watchface comes back to foreground)
        hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
          resume_call: function () {
            console.log('[SLIDING] RESUME event fired');
            updateDisplay();
          },
        });
        
        console.log('[SLIDING] init_view COMPLETE');
      },
      
      build() {
        console.log('[SLIDING] build() called');
        this.init_view();
      },
    });
  })();