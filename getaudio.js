function webaudio_tooling_obj() {

  var audioContext = new AudioContext();

  console.log("audio is starting up ...");

  var BUFF_SIZE = 16384;

  var audioInput = null,
      microphone_stream = null,
      gain_node = null,
      script_processor_node = null,
      script_processor_fft_node = null,
      analyserNode = null;

  if (!navigator.getUserMedia)
          navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia || navigator.msGetUserMedia;

  if (navigator.getUserMedia){

      navigator.getUserMedia({audio:true}, 
        function(stream) {
            start_microphone(stream);
        },
        function(e) {
          alert('Error capturing audio.');
        }
      );

  } else { alert('getUserMedia not supported in this browser.'); }



  function process_microphone_buffer(event) { // invoked by event loop

      var i, N, inp, microphone_output_buffer;

      microphone_output_buffer = event.inputBuffer.getChannelData(0); // just mono - 1 channel for now

      // microphone_output_buffer  <-- this buffer contains current gulp of data size BUFF_SIZE

  }

  function start_microphone(stream){

    gain_node = audioContext.createGain();
    gain_node.connect( audioContext.destination );

    microphone_stream = audioContext.createMediaStreamSource(stream);
    microphone_stream.connect(gain_node); 

    script_processor_node = audioContext.createScriptProcessor(BUFF_SIZE, 1, 1);
    script_processor_node.onaudioprocess = process_microphone_buffer;

    microphone_stream.connect(script_processor_node);

    // --- enable volume control for output speakers
        
    document.getElementById('volume').addEventListener('change', function() {

        var curr_volume = this.value;
        gain_node.gain.value = curr_volume;

        console.log("curr_volume ", curr_volume);
    });

    // --- setup FFT

    script_processor_fft_node = audioContext.createScriptProcessor(2048, 1, 1);
    script_processor_fft_node.connect(gain_node);

    analyserNode = audioContext.createAnalyser();
    analyserNode.minDecibels = -70;
    analyserNode.maxDecibels = -10;
    analyserNode.smoothingTimeConstant = 0.4;
    analyserNode.fftSize = 2048; // 21.533203125 Hz between bins (N * samplerate/fftSize) (44100/2048)

    microphone_stream.connect(analyserNode);

    analyserNode.connect(script_processor_fft_node);

    script_processor_fft_node.onaudioprocess = function() {

      // get the average for the first channel
      var array = new Uint8Array(analyserNode.frequencyBinCount);
      analyserNode.getByteFrequencyData(array);

      // draw the spectrogram
      if (microphone_stream.playbackState == microphone_stream.PLAYING_STATE) {
        MAIN_FREQ = getMainFreq(array);
        document.getElementById("freq").innerHTML = MAIN_FREQ + ' Hz';
      }
    };
  }

}; //  webaudio_tooling_obj = function()

function getMainFreq(arr) {
  var max = indexOfMax(arr);
  return max * 21.533203125;
}

function indexOfMax(arr) {
  if (arr.length === 0) {
      return -1;
  }

  var max = arr[0];
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
          maxIndex = i;
          max = arr[i];
      }
  }

  return maxIndex;
}