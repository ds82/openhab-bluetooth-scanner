# openhab-lebluetooth-scanner

Simple nodejs script that scans for bluetooth devices and report their status to
openhab items.

Used for presence management. After you start the script it will begin to scan for
devices defined in `config.json`. If it finds a LE bluetooth device, it will
update the status of the linked openhab binding to `OPEN`.

If the beacon was not seen for 5 minutes, it will report the linked item to `CLOSED`
in openhab.

## config

To use it, create a `config.json` file like this one:

```
{
  "openhab": {
    "url": "http://1.2.3.4:8080"
  },
  "beacons": {
    "beacon-uuid": {
      "owner": "some-name",
      "item": "ContactItemInOpenHab"
    }
  }
}
```

Don't forget to create a `Contact` item in your openHAB setup:

```
  Contact ContactItemInOpenHab "Presence of Beacon"
```

## deps

This nodejs program uses [`noble`](https://www.npmjs.com/package/noble) library. Please regard the [prerequisites](https://www.npmjs.com/package/noble#prerequisites) to use this library

## run

```
// --> clone this repo & cd into it
// --> create config.json as described above
// --> install required libs for noble (see deps above)
npm install
node index.js
```
