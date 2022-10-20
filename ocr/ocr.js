const path = require('path');
const tesseract = require('tesseract.js');

module.exports = function(RED) {

  /**
   * Enum for status.
   * @readonly
   * @enum {{text: string, fill: string, shape: string}}
   */
  const Status = Object.freeze({
    AVAILABLE: { text: 'available', fill: 'green', shape: 'dot' },
    PROCESSING: { text: 'processing', fill: 'yellow', shape: 'ring' },
    ERROR: { text: 'error', fill: 'red', shape: 'dot' }
  });

  const processImage = async (image, language) => {

    const options = {
      langPath: path.join(__dirname, 'lang')
    };

    try {
      const { data: { text, lines } } = await tesseract.recognize(image, language, options);
      return {
        text,
        lines: lines.map(x => {
          return {
            text: x.text,
            words: x.words.map(y => y.text)
          }
        })
      };
    } catch (error) {
      throw(error);
    }
  };

  const setNodeStatus = (node) => {

    const context = node.context();
    let { text, fill, shape } = context.status;
    
    if (context.queue.length > 0) {
      text += ` - ${context.queue.length} waiting`;
    }

    node.status({
      text,
      fill,
      shape
    });

  };

  function OCRNode(config) {

    RED.nodes.createNode(this, config);

    this.language = config.language || 'eng';

    const node = this;
    const context = node.context();
    context.queue = context.queue || [];
    context.status = context.queue.length === 0 ? Status.AVAILABLE : Status.PROCESSING;

    setNodeStatus(node);

    this.on('input', async (msg, send, done) => {
      if (msg.hasOwnProperty('payload')) {

        try {
          context.queue.push({
            image: msg.payload
          });

          setNodeStatus(node);

          if (context.status !== Status.PROCESSING) {
  
            while (context.queue.length > 0) {

              const { image } = context.queue.shift();

              context.status = Status.PROCESSING;
              setNodeStatus(node);

              msg.payload = await processImage(image, this.language);
              send(msg);
            }
            context.status = Status.AVAILABLE;
            setNodeStatus(node);
          }

        } catch (error) {
          if (done) {
            context.status = Status.ERROR;
            setNodeStatus(node);
            done(error);
          } else {
            node.error(err, msg);
          }
        }

        if (done) {
          done();
        }
      }
    });
  }

  RED.nodes.registerType('ocr', OCRNode);
}
