'use strict';
describe('', () => {
  let nobleStub;

  beforeEach(() => {
    nobleStub = {
      on: jest.fn(),
      startScanning: jest.fn()
    };
    jest.mock('noble', () => nobleStub);
  });

  function start() {
    return require('../index');
  }

  it('should start scanning after stateChange to poweredOn', () => {
    let stateChangeCallback;
    nobleStub.on.mockImplementationOnce((on, fn) => {
      if (on === 'stateChange') {
        stateChangeCallback = fn;
      }
    });

    start();
    stateChangeCallback('poweredOn');

    expect(nobleStub.startScanning).toHaveBeenCalled();
  });
});
