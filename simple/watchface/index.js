// This code defines a watch face using the DeviceRuntimeCore.WatchFace object.
(() => {
  // These variables store references to the digital time widget and the time sensor.
  let digitalTime = "";
  let heartRate = "";
  let stepCount = "";
  let timeSensor = "";
  let heartSensor = "";
  let stepSensor = "";
  
  __$$module$$__.module = DeviceRuntimeCore.WatchFace({
      init_view() {
          console.log('[WATCHFACE] init_view START');
          
          // Create a background rectangle widget for the watch face.
          // Screen is 390×450 (width × height)
          hmUI.createWidget(hmUI.widget.FILL_RECT, {
              x: 0,
              y: 0,
              w: 390,  // FIXED: was 450, should be 390
              h: 450,  // FIXED: was 390, should be 450
              color: "0xFF343934",
              radius: 0,
              show_level: hmUI.show_level.ONLY_NORMAL,
          });
          
          console.log('[WATCHFACE] Background created');
          
          // Create a digital time widget for the watch face.
          digitalTime = hmUI.createWidget(hmUI.widget.TEXT, {
              x: 95,   // Adjusted for 390 width
              y: 175,
              w: 200,
              h: 100,
              text: "[HOUR_24_Z]:[MIN_Z]",
              color: "0xFF497d80",
              text_size: 60,
              text_style: hmUI.text_style.NONE,
              align_h: hmUI.align.CENTER_H,
              align_v: hmUI.align.CENTER_V,
              show_level: hmUI.show_level.ONLY_NORMAL,
          });
          
          console.log('[WATCHFACE] Time widget created');
          
          // Create a heart rate widget for the watch face.
          heartRate = hmUI.createWidget(hmUI.widget.TEXT, {
              x: 270,  // Adjusted for 390 width
              y: 195,
              w: 100,
              h: 40,
              text: "HR:[HR]",
              color: "0xFFf30000",
              text_size: 17,
              text_style: hmUI.text_style.NONE,
              align_h: hmUI.align.LEFT,
              align_v: hmUI.align.TOP,
              show_level: hmUI.show_level.ONLY_NORMAL,
          });
          
          console.log('[WATCHFACE] HR widget created');
          
          // Create a step count widget for the watch face.
          stepCount = hmUI.createWidget(hmUI.widget.TEXT, {
              x: 145,  // Centered for 390 width
              y: 265,
              w: 100,
              h: 40,
              text: "SC:[SC]",
              color: "0xFF76dd81",
              text_size: 17,
              text_style: hmUI.text_style.NONE,
              align_h: hmUI.align.LEFT,
              align_v: hmUI.align.TOP,
              show_level: hmUI.show_level.ONLY_NORMAL,
          });
          
          console.log('[WATCHFACE] Step widget created');
          
          // Create the time sensor if it doesn't exist yet.
          if (!timeSensor) {
              timeSensor = hmSensor.createSensor(hmSensor.id.TIME);
              console.log('[WATCHFACE] Time sensor created - hour:', timeSensor.hour, 'minute:', timeSensor.minute);
          }
          
          // Create the heart sensor if it doesn't exist yet.
          if (!heartSensor) {
              heartSensor = hmSensor.createSensor(hmSensor.id.HEART);
              console.log('[WATCHFACE] Heart sensor created - last:', heartSensor.last);
          }
          
          // Create the step sensor if it doesn't exist yet.
          if (!stepSensor) {
              stepSensor = hmSensor.createSensor(hmSensor.id.STEP);
              console.log('[WATCHFACE] Step sensor created - current:', stepSensor.current);
          }
          
          // When the minute changes, update the digital time widget.
          timeSensor.addEventListener(timeSensor.event.MINUTEEND, function () {
              console.log('[WATCHFACE] MINUTEEND event fired');
              digitalTime.setProperty(hmUI.prop.MORE, {
                  text: `${String(timeSensor.hour).padStart(2, "0")}:${String(
                      timeSensor.minute
                  ).padStart(2, "0")}`,
              });
          });
          
          // When the heart value changes, update the heart rate widget.
          heartSensor.addEventListener(heartSensor.event.LAST, function () {
              console.log('[WATCHFACE] Heart LAST event fired - value:', heartSensor.last);
              heartRate.setProperty(hmUI.prop.MORE, {
                  text: `HR:${heartSensor.last}`,
              });
          });
          
          // When the step value changes, update the step count widget.
          stepSensor.addEventListener(hmSensor.event.CHANGE, function () {
              console.log('[WATCHFACE] Step CHANGE event fired - value:', stepSensor.current);
              stepCount.setProperty(hmUI.prop.MORE, {
                  text: `SC:${stepSensor.current}`,
              });
          });

          // Set initial time
          digitalTime.setProperty(hmUI.prop.MORE, {
              text: `${String(timeSensor.hour).padStart(2, "0")}:${String(
                  timeSensor.minute
              ).padStart(2, "0")}`,
          });
          
          console.log('[WATCHFACE] Initial time set');
          
          // Update every second via timer
          timer.createTimer(
              0,
              1000,
              function (sensor) {
                  digitalTime.setProperty(hmUI.prop.MORE, {
                      text: `${String(sensor.hour).padStart(2, "0")}:${String(
                          sensor.minute
                      ).padStart(2, "0")}`,
                  });
              },
              timeSensor
          );
          
          console.log('[WATCHFACE] Timer created');
          
          // Handle resume (when watchface comes back to foreground)
          hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
              resume_call: function () {
                  console.log('[WATCHFACE] RESUME event fired');
                  digitalTime.setProperty(hmUI.prop.MORE, {
                      text: `${String(timeSensor.hour).padStart(2, "0")}:${String(
                          timeSensor.minute
                      ).padStart(2, "0")}`,
                  });
                  heartRate.setProperty(hmUI.prop.MORE, {
                      text: `HR:${heartSensor.last}`,
                  });
                  stepCount.setProperty(hmUI.prop.MORE, {
                      text: `SC:${stepSensor.current}`,
                  });
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