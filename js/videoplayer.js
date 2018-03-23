/**
 * Videoplayer Element
 * Author: Moses Wan
 * Date: January 2018
 *
 * This class is designed grab the camera stream and have an interactive canvas
 * in which a group of pixels in a square formation can be use via an event.
 *
 * DO NOT EDIT THIS FILE.
 */
class VideoPlayer {
  constructor()
  {
    this._self = this;
    this._video = document.querySelector('video');
    this._canvas = document.querySelector('canvas');
    this._ctx = this._canvas.getContext('2d');

    // This kickstarts the canvas redraw.
    this._video.addEventListener('play', function() {
      this.timerCallback()
    }.bind(this), false);

    // Click also interacts with the touch events as well.
    this._canvas.addEventListener('click', this.targetChange, false);

    // Puts the cursor in the middle by default
    this._canvas._cursor = {"X": 640, "Y": 480};
  }

/**
 * Redraws the canvas by drawing the video frame first, then draws the cursor on
 * afterwards. Event under 'refresh', containing the pixel data in the selected area,
 * is dispatched just before the cursor is drawn to make sure the cursor itself
 * isn't polluting the pixel data sent in the event.
 */
  timerCallback()
  {
    // If there is no new frame (when it is paused or no stream), stop the update
    // recursion.
    if (this._video.paused || this._video.ended) {
      return;
    }

    // Redraws the video frame onto the canvas
    this._ctx.drawImage(this._video, 0, 0, this._canvas.width, this._canvas.height);

    // Forms the event to send out
    let event = new CustomEvent('refresh', {
      detail: {
        data: this._ctx.getImageData(this._canvas._cursor.X - 10, this._canvas._cursor.Y - 10, 20 ,20).data,
        time: new Date()
      },
      bubbles: true,
      cancelable: true
    });

    // Dispatches the event that looks like it was dispatched by the canvas.
    this._canvas.dispatchEvent(event);

    // Redraw the cursor overlay
    this.overlayVideo(this._canvas._cursor, 10);

    // This is a recursion loop used to refresh the canvas.
    let self = this;
    setTimeout(function() {
        self.timerCallback();
      }, 20);
  }

/**
 * Overlays the video with a cursor that will draw a box with a cross in the middle
 * to indicate which pixels are selected to send back.
 * @param  {object} cursor    The center of the cursor. Has property of X and Y and
 *                          is in terms of the canvas coordinates.
 * @param  {Number} size      Amount of pixels going outward from the center to be
 *                          selected for the event dispatch.
 */
  overlayVideo(cursor, size)
  {
    // Drawing the cross
    this._ctx.beginPath();
    this._ctx.lineWidth = 5;
    this._ctx.strokeStyle = 'yellow';
    this._ctx.moveTo(cursor.X-size,cursor.Y-size);
    this._ctx.lineTo(cursor.X+size,cursor.Y+size);
    this._ctx.moveTo(cursor.X-size,cursor.Y+size);
    this._ctx.lineTo(cursor.X+size,cursor.Y-size);
    this._ctx.closePath();
    this._ctx.stroke();

    // Drawing the rectangle around the cross
    this._ctx.strokeRect(cursor.X-size,cursor.Y-size, 20, 20)
  }

/**
 * When the video player is click, this function is called to handle the change
 * of cursor position.
 * @param  {EventType} event  Event object that contains information about the click.
 */
  targetChange(event)
  {
    // Note that "this" is currently referencing the canvas
    let bounds = this.getClientRects()[0];

    // Disable the default behaviour of a click (if there was any)
    event.preventDefault();

    // If the browser doesn't have pageX/pageY, use clientX/clientY to get click
    // position
    if(!("pageX" in event)) {
      event.pageX = event.clientX;
      event.pageY = event.clientY;
    }

    // Converts pixels to canvas coordinates. The event object records using the
    // viewport pixels. Canvas may use different coordinate system.
    this._cursor = {"X": 1280/bounds.width*(event.pageX-bounds.left), "Y": 960/bounds.height*(event.pageY-bounds.top)};
    console.log(this._cursor);
    return;
  }

/**
 * Rerouting the addEventListener to the canvas
 * @param {string}   eventName    Name of the event
 * @param {Function} callback     Function that is used for the callback
 */
  addEventListener(eventName, callback)
  {
    this._canvas.addEventListener('refresh', callback);
  }
}
