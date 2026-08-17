export const BOOK_PLUG_GROUPS = [
  {
    id: "wall",
    label: "Firewall",
    page: "78–80",
    ids: ["dash-2-hyd", "engine-2a-hyd", "front-2-cab", "front-2b-mate", "eng-dash-3"],
  },
  {
    id: "fuse",
    label: "Fuse & key",
    page: "77, 83",
    ids: ["fuse-block", "key-63"],
  },
  {
    id: "cluster",
    label: "Cluster",
    page: "80–81",
    ids: ["alarm-20", "cluster-26", "cluster-27", "cluster-28"],
  },
  {
    id: "hyd",
    label: "Hyd brakes",
    page: "82, 85A",
    ids: ["diode-47", "monitor-49", "hyd-sw-50", "stop-51", "booster-300", "diff-301", "flow-763"],
  },
  {
    id: "fuel",
    label: "Fuel",
    page: "83, 88–90",
    ids: ["filter-71", "filter-399", "filter-401", "wif-470", "heater-rel-431"],
  },
  {
    id: "engine",
    label: "Engine",
    page: "86–91",
    ids: ["cec-379", "diag-384", "aps-382", "start-387", "modpwr-396", "speedo-303", "backup-304", "tot-345", "bap-406", "ats-398", "ata-p", "ata-n"],
  },
  {
    id: "cab",
    label: "Cab",
    page: "82–85",
    ids: ["hdlamp-60", "horn-61", "cruise-391", "cruise-392", "bb-194", "turn-459"],
  },
  {
    id: "lights",
    label: "Lights",
    page: "98–101",
    ids: ["lh-502", "rh-504", "lt-503", "horn-605", "stop-540"],
  },
  {
    id: "relays",
    label: "Relays",
    page: "84–106",
    ids: ["ltd-100", "ftp-101", "abs-284", "abs-286", "abs-377", "abs-423", "shift-403", "neutral-615", "bu-639", "crank-661", "modpwr-662", "stop-995", "ret-996"],
  },
] as const;
